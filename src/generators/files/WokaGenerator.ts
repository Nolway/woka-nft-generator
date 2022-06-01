import sha1 from "sha1";
import sharp from "sharp";
import fs from "fs";
import { PNG } from "pngjs";
import { wokasDirPath, wokasUpscaleDirPath } from "../../env";
import { Config } from "../../guards/ConfigGuards";
import { LoadedLayers, Woka, WokaLayers, WokaTexture } from "../../guards/WokaGuards";

sharp.cache(false);

export class WokaGenerator {
    constructor(private config: Config, private loadedLayers: LoadedLayers) {}

    public generateCollection(): Woka[] {
        const wokas: Woka[] = [];

        for (let i = 1; i <= this.config.collection.size; i++) {
            let generatedWoka: Woka;

            do {
                generatedWoka = this.generate(i);
            } while (wokas.find((woka) => woka.dna === generatedWoka.dna));

            wokas.push(generatedWoka);
        }

        return wokas;
    }

    private generate(edition: number): Woka {
        let layers: WokaLayers = {};
        let attempts = 0;

        do {
            for (const layer of Object.keys(this.loadedLayers)) {
                layers[layer] = this.getRandomTexture(this.loadedLayers[layer]);
            }

            layers = this.aggrgateConstraints(layers);

            for (const layer of Object.keys(this.loadedLayers)) {
                const configLayer = this.config.collection.layers.find((currentLayer) => currentLayer.name === layer);
                if (configLayer?.skip?.allow === false && !layers[layer].file) {
                    layers = {};
                    break;
                }
            }

            attempts++;
        } while (Object.keys(layers).length < 1 && attempts < 1000);

        if (attempts === 1000) {
            throw new Error("Cannot generate a new edition! Maybe something was wrong with constraints?");
        }

        return {
            edition,
            dna: this.generateDNA(layers),
            layers,
        };
    }

    private getRandomTexture(textures: WokaTexture[]): WokaTexture {
        if (textures.length < 1) {
            return {
                name: "None",
                weight: 100,
                file: undefined,
            };
        }

        const weights: number[] = [];
        let i: number;

        for (i = 0; i < textures.length; i++) {
            weights[i] = textures[i].weight + (weights[i - 1] || 0);
        }

        const random = Math.random() * weights[weights.length - 1];

        for (i = 0; i < weights.length; i++) {
            if (weights[i] > random) break;
        }

        return textures[i];
    }

    private aggrgateConstraints(layers: WokaLayers): WokaLayers {
        const newLayers: WokaLayers = {};

        for (const layerName of Object.keys(this.loadedLayers)) {
            const configLayer = this.config.collection.layers.find((currentLayer) => currentLayer.name === layerName);

            if (!configLayer?.constraints) {
                newLayers[layerName] = layers[layerName];
                continue;
            }

            if (!configLayer.skip) {
                throw new Error("If you declare a constraint you need to add a skip value");
            }

            if (configLayer.constraints.linked) {
                const layer = this.loadedLayers[layerName];
                const layerLink = this.loadedLayers[configLayer.constraints.linked.layer];

                if (!layer) {
                    throw new Error(`Unknown layer ${configLayer.constraints.linked.layer} on linked constraint`);
                }

                for (const textureLink of configLayer.constraints.linked.textures) {
                    const textureSearched = layer.find((texture) => texture.name === textureLink.with);
                    if (!textureSearched) {
                        throw new Error(
                            `Unknown ${textureLink.with} texture 'with' on constraint linked on ${layerName} layer`
                        );
                    }

                    if (!layerLink.find((texture) => texture.name === textureLink.on)) {
                        throw new Error(
                            `Unknown ${textureLink.on} texture 'on' on constraint linked on ${layerName} layer`
                        );
                    }

                    if (layers[configLayer.constraints.linked.layer].name === textureLink.on) {
                        newLayers[layerName] = textureSearched;
                        break;
                    }
                }
            }

            if (configLayer.constraints.with) {
                for (const constraintLayer in configLayer.constraints.with) {
                    if (!layers[constraintLayer]) {
                        throw new Error(`Unknown layer ${constraintLayer} on with constraint`);
                    }

                    if (
                        configLayer.constraints.with[constraintLayer] !== "*" &&
                        !configLayer.constraints.with[constraintLayer].includes(layers[constraintLayer].name)
                    ) {
                        continue;
                    }

                    if (
                        !layers[constraintLayer].file &&
                        (!newLayers[constraintLayer] || !newLayers[constraintLayer].file)
                    ) {
                        newLayers[layerName] = {
                            name: configLayer.skip.value,
                            weight: configLayer.skip.rarity,
                            file: undefined,
                        };
                    }
                }
            }

            if (configLayer.constraints.without) {
                for (const constraintLayer in configLayer.constraints.without) {
                    if (!layers[constraintLayer]) {
                        throw new Error(`Unknown layer ${constraintLayer} on without constraint`);
                    }

                    if (
                        configLayer.constraints.without[constraintLayer] !== "*" &&
                        !configLayer.constraints.without[constraintLayer].includes(layers[constraintLayer].name)
                    ) {
                        continue;
                    }

                    if (
                        layers[constraintLayer].file &&
                        (!newLayers[constraintLayer] || newLayers[constraintLayer].file)
                    ) {
                        newLayers[layerName] = {
                            name: configLayer.skip.value,
                            weight: configLayer.skip.rarity,
                            file: undefined,
                        };
                    }
                }
            }

            if (configLayer.constraints.parts && configLayer.constraints.parts[layers[layerName].name]) {
                const partConstraints = configLayer.constraints.parts[layers[layerName].name];

                if (partConstraints.with) {
                    for (const constraintLayer in partConstraints.with) {
                        if (!layers[constraintLayer]) {
                            throw new Error(`Unknown layer ${constraintLayer} on with constraint`);
                        }

                        if (
                            partConstraints.with[constraintLayer] !== "*" &&
                            !partConstraints.with[constraintLayer].includes(layers[constraintLayer].name)
                        ) {
                            continue;
                        }

                        if (
                            !layers[constraintLayer].file &&
                            (!newLayers[constraintLayer] || !newLayers[constraintLayer].file)
                        ) {
                            newLayers[layerName] = {
                                name: configLayer.skip.value,
                                weight: configLayer.skip.rarity,
                                file: undefined,
                            };
                        }
                    }
                }

                if (partConstraints.without) {
                    for (const constraintLayer in partConstraints.without) {
                        if (!layers[constraintLayer]) {
                            throw new Error(`Unknown layer ${constraintLayer} on without constraint`);
                        }

                        if (
                            partConstraints.without[constraintLayer] !== "*" &&
                            !partConstraints.without[constraintLayer].includes(layers[constraintLayer].name)
                        ) {
                            continue;
                        }

                        if (
                            layers[constraintLayer].file &&
                            (!newLayers[constraintLayer] || newLayers[constraintLayer].file)
                        ) {
                            newLayers[layerName] = {
                                name: configLayer.skip.value,
                                weight: configLayer.skip.rarity,
                                file: undefined,
                            };
                        }
                    }
                }
            }

            if (!newLayers[layerName]) {
                newLayers[layerName] = layers[layerName];
            }
        }

        return newLayers;
    }

    private generateDNA(textures: WokaLayers): string {
        let composition = "";

        for (const layer of Object.keys(textures)) {
            composition += (composition === "" ? "" : "-") + textures[layer].name;
        }

        return sha1(composition);
    }

    public async generateTileset(woka: Woka): Promise<void> {
        const layers: sharp.OverlayOptions[] = [];
        const layersUpscale: sharp.OverlayOptions[] = [];

        for (const layer of Object.keys(woka.layers)) {
            const partFile = woka.layers[layer].file;
            const partFileUpsacle = woka.layers[layer].upscaleFile;

            if (!partFile || !partFileUpsacle) {
                continue;
            }

            layers.push({
                input: partFile,
            });

            layersUpscale.push({
                input: partFileUpsacle,
            });
        }

        const newFile = new PNG({
            width: 96,
            height: 128,
            filterType: -1,
        });

        try {
            woka.tileset = await newFile.pack().pipe(sharp().composite(layers)).toBuffer();
        } catch (err) {
            console.error(err);
            throw new Error(`Error on generate woka edition ${woka.edition}`);
        }

        const newFileUpsacle = new PNG({
            width: 750,
            height: 1000,
            filterType: -1,
        });

        try {
            woka.upscaleTileset = await newFileUpsacle.pack().pipe(sharp().composite(layersUpscale)).toBuffer();
        } catch (err) {
            console.error(err);
            throw new Error(`Error on generate woka upscale edition ${woka.edition}`);
        }
    }

    public static async exportLocal(woka: Woka): Promise<void> {
        if (!woka.tileset) {
            throw new Error(`Undefined tileset on woka edition ${woka.edition}`);
        }

        const filePath = wokasDirPath + woka.edition + ".png";
        const fileUpscalePath = wokasUpscaleDirPath + woka.edition + ".png";

        if (!fs.existsSync(filePath)) {
            const newFile = new PNG({
                width: 96,
                height: 128,
                filterType: 1,
            });

            fs.writeFileSync(filePath, PNG.sync.write(newFile));
        }

        await sharp(woka.tileset).toFile(filePath);

        if (!fs.existsSync(fileUpscalePath)) {
            const newFile = new PNG({
                width: 750,
                height: 1000,
                filterType: 1,
            });

            fs.writeFileSync(fileUpscalePath, PNG.sync.write(newFile));
        }

        await sharp(woka.upscaleTileset).toFile(fileUpscalePath);
    }
}

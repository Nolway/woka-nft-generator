import sharp from "sharp";
import fs from "fs";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import textToSvg from "text-svg";
import { avatarsDirPath, backgroundDirPath } from "../../env";
import {
    Config,
    isConfigCollectionBackgroundParametersCropPositionGravity,
    isConfigCollectionBackgroundParametersCropPositionXY,
} from "../../guards/ConfigGuards";
import { Woka } from "../../guards/WokaGuards";
import { CropPosition } from "../../guards/AvatarGuard";
import path from "path";
import { formatStringWithVariables } from "../../utils/MetadataUtils";
import { PNG } from "pngjs";

sharp.cache(false);

export class AvatarGenerator {
    constructor(private config: Config) {}

    private getCropPosition(): CropPosition {
        if (!this.config.collection?.background?.parameters?.crop?.position) {
            return {
                gravity: "centre",
            };
        }

        const configCropPosition = this.config.collection.background.parameters.crop.position;

        const isCropPositionXY = isConfigCollectionBackgroundParametersCropPositionXY.safeParse(configCropPosition);
        const isCropPositionGravity =
            isConfigCollectionBackgroundParametersCropPositionGravity.safeParse(configCropPosition);

        if (isCropPositionXY.success) {
            return {
                ...isCropPositionXY.data,
            };
        }

        if (isCropPositionGravity.success) {
            return {
                gravity: isCropPositionGravity.data,
            };
        }

        throw new Error("Unknown crop position");
    }

    public async generate(woka: Woka, backgrounds: Map<string, Buffer>): Promise<void> {
        if (!woka.crop) {
            throw new Error(`Undefined crop on woka edition ${woka.edition}`);
        }

        if (this.config.collection.background) {
            const cropPosition = this.getCropPosition();
            const cropOverlay = {
                input: woka.crop,
                ...cropPosition,
            };

            switch (this.config.collection.background.method) {
                case "image": {
                    if (backgrounds.size < 1) {
                        throw new Error("You don't have any background in the assets folder");
                    }

                    woka.avatar = await sharp(
                        [...backgrounds.values()][Math.floor(Math.random() * (backgrounds.size - 1))]
                    )
                        .composite([cropOverlay])
                        .toBuffer();
                    break;
                }
                case "linked": {
                    woka.avatar = await sharp([...backgrounds.values()][woka.edition - 1])
                        .composite([cropOverlay])
                        .toBuffer();
                    break;
                }
                case "color": {
                    if (!this.config.collection.background.parameters?.color) {
                        throw new Error("Undefined color property for \"color\" background method");
                    }

                    const background: sharp.Color = {
                        r: undefined,
                        g: undefined,
                        b: undefined,
                        alpha: undefined,
                    };

                    if (this.config.collection.background.parameters.color.hex) {
                        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
                            this.config.collection.background.parameters.color.hex
                        );
                        if (result) {
                            background.r = parseInt(result[1], 16);
                            background.g = parseInt(result[2], 16);
                            background.b = parseInt(result[3], 16);
                        }
                    }

                    if (this.config.collection.background.parameters.color.alpha) {
                        background.alpha = this.config.collection.background.parameters.color.alpha;
                    }

                    woka.avatar = await sharp(woka.crop).removeAlpha().flatten({ background }).toBuffer();
                    break;
                }
                case "rarity": {
                    let lowerWeight: number | undefined;

                    for (const layer of Object.values(woka.layers)) {
                        if (!lowerWeight) {
                            lowerWeight = layer.weight;
                        } else if (lowerWeight > layer.weight) {
                            lowerWeight = layer.weight;
                        }
                    }

                    if (!lowerWeight) {
                        woka.avatar = woka.crop;
                        break;
                    }

                    const background = backgrounds.get(lowerWeight.toString());

                    woka.avatar = background
                        ? (woka.avatar = await sharp(background).composite([cropOverlay]).toBuffer())
                        : woka.crop;

                    break;
                }
                case "none":
                case undefined: {
                    woka.avatar = woka.crop;
                    break;
                }
            }

            if (this.config.collection.background.parameters?.name) {
                const name = formatStringWithVariables(this.config.blockchain.metadata.name, this.config, woka);
                // const textToSVG = TextToSVG.loadSync(this.config.collection.background.parameters.name.font);
                // const nameSvg = textToSVG.getSVG("TEST FFFFFFFFFFFFFFFFFFF", {
                //     fontSize: this.config.collection.background.parameters.name.size,
                // });

                // // fs.writeFileSync("test.svg", nameSvg);

                // const attributes = {fill: "red", stroke: "black"};
                // const options = {x: 0, y: 0, fontSize: 72, attributes: attributes};

                // const svg = textToSVG.getSVG("hello", options);
                // fs.writeFileSync("test.svg", svg)

                //const nameSvg = `<svg > <text x="0" y="0" font-size="${this.config.collection.background.parameters.name.size}" fill="${this.config.collection.background.parameters.name.color ?? "white"}">${name}</text> </svg>`;

                const nameSvg: string = textToSvg(name, {
                    font: `${this.config.collection.background.parameters.name.size}px ${this.config.collection.background.parameters.name.font}`,
                    color: this.config.collection.background.parameters.name.color ?? "black",
                });

                const baseNamePng = new PNG({
                    width: 2478,
                    height: 200,
                    filterType: -1,
                });

                const nameImg = await baseNamePng
                    .pack()
                    .pipe(sharp().composite([{ input: Buffer.from(nameSvg), gravity: "centre" }]))
                    .toBuffer();

                woka.avatar = await sharp(woka.avatar)
                    .composite([
                        {
                            input: nameImg,
                            ...this.config.collection.background.parameters.name.position,
                        },
                    ])
                    .toBuffer();
            }
        } else {
            woka.avatar = woka.crop;
        }
    }

    public async getLocalBackgrounds(): Promise<Map<string, Buffer>> {
        const loadedBackgrounds: Map<string, Buffer> = new Map<string, Buffer>();

        const backgroundFiles = await fs.promises.readdir(backgroundDirPath);

        for (const file of backgroundFiles) {
            const filePath = backgroundDirPath + file;

            if (fs.statSync(filePath).isDirectory()) {
                continue;
            }

            loadedBackgrounds.set(path.parse(file).name, await sharp(filePath).toBuffer());
        }

        return loadedBackgrounds;
    }

    public static async exportLocal(woka: Woka): Promise<void> {
        if (!woka.avatar) {
            throw new Error(`Undefined avatar on woka edition ${woka.edition}`);
        }

        await sharp(woka.avatar).toFile(avatarsDirPath + woka.edition + ".png");
    }
}

import fs from "fs";
import sizeOf from "image-size";
import chalk from "chalk";
import { Config, ConfigCollection } from "../guards/ConfigGuards";
import { LoadedLayers, Woka, WokaTexture } from "../guards/WokaGuards";
import { layersDirPath, layersUpscaleDirPath } from "../env";
import { generateBuildDirectories, removeBuildDirectory } from "../utils/DirectoryUtils";
import { maxCombination } from "../utils/LayerUtils";
import { WokaGenerator } from "../generators/files/WokaGenerator";
import { MetadataGenerator } from "../generators/files/MetadataGenerator";
import { CropGenerator } from "../generators/files/CropGenerator";
import { AvatarGenerator } from "../generators/files/AvatarGenerator";
import { getLocalConfig } from "../utils/ConfigUtils";

let loadedLayers: LoadedLayers;
const wokasGenerated: Woka[] = [];

async function run(): Promise<void> {
    const config = await getLocalConfig();

    removeBuildDirectory();
    generateBuildDirectories();

    await generate(config);
}

async function generate(config: Config): Promise<void> {
    loadedLayers = await loadLayers(config.collection);

    // Check max combination
    const max = maxCombination(loadedLayers);
    console.log(`${max} combinations can be generated`);

    if (max < config.collection.size) {
        throw new Error(
            `You want to generate a collection of ${config.collection.size} Woka but you can only generate ${max}`
        );
    }

    // Initiate generators
    const wokaGenerator = new WokaGenerator(config, loadedLayers);
    const metadataGenerator = new MetadataGenerator(config);
    const cropGenerator = new CropGenerator(config.collection.crop);
    const avatarGenerator = new AvatarGenerator(config);

    // Generate the Woka collection
    wokasGenerated.push(...wokaGenerator.generateCollection());
    console.log(chalk.green("All wokas has been generated"));

    for (const woka of wokasGenerated) {
        await wokaGenerator.generateTileset(woka);
        await WokaGenerator.exportLocal(woka);
        console.log(`Edition ${woka.edition} woka has been generated with DNA: ${woka.dna}`);

        const metadata = metadataGenerator.generate(woka);
        await MetadataGenerator.exportLocal(metadata);
        console.log(`Edition ${woka.edition} metadata has been generated`);

        await cropGenerator.generate(woka);
        await CropGenerator.exportLocal(woka);
        console.log(`Edition ${woka.edition} crop has been created!`);

        const backgrounds = await avatarGenerator.getLocalBackgrounds();
        await avatarGenerator.generate(woka, backgrounds);
        await AvatarGenerator.exportLocal(woka);
        console.log(`Edition ${woka.edition} avatar has been generated`);

        woka.avatar = undefined;
        woka.tileset = undefined;
        woka.upscaleTileset = undefined;
        woka.crop = undefined;
    }
}

async function loadLayers(config: ConfigCollection): Promise<LoadedLayers> {
    const loadedLayers: LoadedLayers = {};

    const folders = (await fs.promises.readdir(layersDirPath)).filter((fileName) =>
        fs.statSync(layersDirPath + fileName).isDirectory()
    );

    if (!folders || folders.length < 1) {
        throw new Error("Any layer found on layers folder");
    }

    for (const layer of config.layers) {
        if (!folders.includes(layer.name) && !layer.skip?.allow) {
            throw new Error(`Undefined ${layer.name} layer on layers folder`);
        }

        loadedLayers[layer.name] = await loadLayer(config, layer.name);

        if (layer.skip?.allow) {
            loadedLayers[layer.name].push({
                name: layer.skip.value,
                weight: layer.skip.rarity,
                file: undefined,
            });
        }
    }

    console.log(chalk.green("All layers assets has been loaded"));

    return loadedLayers;
}

async function loadLayer(config: ConfigCollection, layer: string): Promise<WokaTexture[]> {
    const layerDirPath = layersDirPath + layer + "/";
    const layerUpsacleDirPath = layersUpscaleDirPath + layer + "/";
    const files = await fs.promises.readdir(layerDirPath);
    const loadedTextures: WokaTexture[] = [];

    for (const file of files) {
        const filePath = layerDirPath + file;
        const fileUpscalePath = layerUpsacleDirPath + file;

        if (fs.statSync(filePath).isDirectory()) {
            continue;
        }

        const parts = file.split(".");

        if (parts[parts.length - 1] !== "png") {
            throw new Error(`${file} file must be a PNG`);
        }

        const dimensions = sizeOf(filePath);

        if (dimensions.height !== 128 && dimensions.width !== 96) {
            console.log(`${file} file must have a size of 128/96 pixels`);
        }

        let weight = 100;
        let name = "";

        if (config.rarity) {
            switch (config.rarity.method) {
                case "delimiter": {
                    const nameSplited = parts[0].split("#");
                    name = nameSplited[0];
                    weight = Number(nameSplited.pop());
                    if (isNaN(weight)) {
                        weight = 100;
                    }
                    break;
                }
                case "random": {
                    name = parts[0];
                    weight = Math.floor(Math.random() * 100);
                    break;
                }
                case "none": {
                    name = parts[0];
                    break;
                }
            }
        } else {
            name = parts[0];
        }

        loadedTextures.push({
            name,
            weight,
            file: filePath,
            upscaleFile: fileUpscalePath,
        });
    }

    console.log(`${layer} layer has been loaded`);

    return loadedTextures;
}

function sortTexturesByWeight(textures: WokaTexture[]) {
    return textures.sort(function (a, b) {
        return a.weight - b.weight;
    });
}

run()
    .then(() => {
        for (const layer of Object.keys(loadedLayers)) {
            console.log("\n" + chalk.bold(`${layer.charAt(0).toUpperCase() + layer.slice(1)} parts rarity:`));
            console.table(sortTexturesByWeight(loadedLayers[layer]), ["name", "weight"]);
        }

        console.log("\n" + chalk.bold("Generated Wokas:"));
        console.table(wokasGenerated, ["edition", "dna"]);

        console.log(chalk.green("All files has been generated"));
    })
    .catch((err) => {
        console.error(chalk.red(err));
    });

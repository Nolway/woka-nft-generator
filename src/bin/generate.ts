import fs from "fs";
import chalk from "chalk";
import { Config, ConfigCollection, isConfig } from "../guards/ConfigGuards";
import { LoadedLayers, Woka, WokaTexture } from "../guards/WokaGuards";
import { configPath } from "../env";
import { layersDirPath } from "../env";
import { generateBuildDirectories } from "../utils/DirectoryUtils";
import { maxCombination } from "../utils/LayerUtils";
import { WokaGenerator } from "../generators/files/WokaGenerator";
import { MetadataGenerator } from "../generators/files/MetadataGenerator";
import { CropGenerator } from "../generators/files/CropGenerator";
import { AvatarGenerator } from "../generators/files/AvatarGenerator";

let loadedLayers: LoadedLayers;
const wokasGenerated: Woka[] = [];

async function run(): Promise<void> {
	if (!fs.existsSync(configPath)) {
		throw new Error("No config.ts fund! You can copy the config.dist.ts to config.ts");
	}

	const configFile = await import(configPath);
	const config = isConfig.parse(configFile.default);

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
	const metadataGenerator = new MetadataGenerator(config.blockchain);
	const cropGenerator = new CropGenerator(config.collection.crop);
	const avatarGenerator = new AvatarGenerator(config.collection);

	// Generate the Woka collection
	wokasGenerated.push(...wokaGenerator.generateCollection());

	for (const woka of wokasGenerated) {
		await wokaGenerator.generateTileset(woka);
		await wokaGenerator.exportLocal(woka);
		console.log(`Edition ${woka.edition} woka has been generated with DNA: ${woka.dna}`);

		const metadata = metadataGenerator.generate(woka);
		await metadataGenerator.exportLocal(metadata);
		console.log(`Edition ${woka.edition} metadata has been generated`);

		await cropGenerator.generate(woka);
		await cropGenerator.exportLocal(woka);
		console.log(`Edition ${woka.edition} crop has been created!`);

		const backgrounds = await avatarGenerator.getLocalBackgrounds();
		await avatarGenerator.generate(woka, backgrounds);
		await avatarGenerator.exportLocal(woka);
		console.log(`Edition ${woka.edition} avatar has been generated`);
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
	const files = await fs.promises.readdir(layerDirPath);
	const loadedTextures: WokaTexture[] = [];

	for (const file of files) {
		const filePath = layerDirPath + file;

		if (fs.statSync(filePath).isDirectory()) {
			continue;
		}

		const parts = file.split(".");

		if (parts[parts.length - 1] !== "png") {
			throw new Error(`${file} layer must be a PNG`);
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

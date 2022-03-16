import sharp from "sharp";
import fs from "fs";
import { PNG } from "pngjs";
import chalk from "chalk";
import sha1 from "sha1";
import {
	Config,
	ConfigBlockchain,
	ConfigCollectionBackground,
	ConfigCollectionCrop,
	ConfigCollectionRarity,
	isConfig,
} from "./guards/ConfigGuards";
import { isLayer, Layer, LoadedLayers, Woka, WokaPart, WokaParts } from "./guards/WokaGuards";
import { MetadataGenerator } from "./metadata-generators/MetadataGenerator";
import { EthereumMetadataGenerator } from "./metadata-generators/EthereumMetadataGenerator";
import { AvalancheMetadataGenerator } from "./metadata-generators/AvalancheMetadataGenerator";

sharp.cache(false);

const basePath = process.cwd();

const configPath = `${basePath}/src/config.ts`;

// Build directories
const buildDirPath = `${basePath}/build/`;
const wokasDirPath = `${buildDirPath}wokas/`;
export const dataDirPath = `${buildDirPath}data/`;
const cropsDirPath = `${buildDirPath}crops/`;
const avatarsDirPath = `${buildDirPath}avatars/`;

// Assets directories
const backgroundDirPath = `${basePath}/assets/backgrounds/`;
const layersDirPath = `${basePath}/assets/layers/`;

const loadedBackgrounds: string[] = [];
const loadedLayers: LoadedLayers = {
	body: [],
	eyes: [],
	hair: [],
	clothes: [],
	hat: [],
	accessory: [],
};

const wokasGenerated: Woka[] = [];

async function run(): Promise<void> {
	if (!fs.existsSync(configPath)) {
		throw new Error("No config.ts fund! You can copy the config.dist.ts to config.ts");
	}

	const configFile = await import(configPath);

	const config = isConfig.parse(configFile.default);

	if (fs.existsSync(buildDirPath)) {
		fs.rmSync(buildDirPath, { recursive: true, force: true });
	}

	checkBuildDirectories();

	await generate(config);
}

function checkBuildDirectories() {
	if (!fs.existsSync(buildDirPath)) {
		fs.mkdirSync(buildDirPath);
	}

	if (!fs.existsSync(wokasDirPath)) {
		fs.mkdirSync(wokasDirPath);
	}

	if (!fs.existsSync(cropsDirPath)) {
		fs.mkdirSync(cropsDirPath);
	}

	if (!fs.existsSync(avatarsDirPath)) {
		fs.mkdirSync(avatarsDirPath);
	}

	if (!fs.existsSync(dataDirPath)) {
		fs.mkdirSync(dataDirPath);
	}
}

async function generate(config: Config): Promise<void> {
	await loadLayers(config.collection.rarity);

	const max = maxCombination();

	console.log(`${max} combinations can be generated`);

	if (max < config.collection.size) {
		throw new Error(`You want to generate a collection of ${config.collection.size} Woka but you can only generate ${max}`);
	}

	await generateWokas(config);
	await generateCrops(config.collection.crop);
	await generateAvatars(config.collection.background);
}

async function loadLayers(config: ConfigCollectionRarity|undefined): Promise<void> {
	for (const layer of Object.keys(loadedLayers)) {
		await loadLayer(config, isLayer.parse(layer));
	}

	console.log(chalk.green("All layers assets has been loaded"));
}

async function loadLayer(config: ConfigCollectionRarity|undefined, layer: Layer): Promise<void> {
	const layerDirPath = layersDirPath + layer + "/";
	const files = await fs.promises.readdir(layerDirPath);

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

		if (config) {
			switch (config.method) {
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

		loadedLayers[layer].push({
			name,
			weight,
			file: filePath,
		});
	}

	console.log(`${layer} layer has been loaded`);
}

function maxCombination() {
	let max = 0;

	for (const layer of Object.keys(loadedLayers)) {
		const assetCount = loadedLayers[isLayer.parse(layer)].length;
		max = max === 0 ? assetCount : max * assetCount;
	}

	return max;
}

async function generateWokas(config: Config): Promise<void> {
	for (let i = 1; i <= config.collection.size; i++) {
		const woka = await generateWoka(i);
		await generateData(config.blockchain, i, woka);
	}

	console.log(chalk.green("All wokas has been generated"));
}

async function generateWoka(edition: number): Promise<Woka> {
	let woka: Woka | undefined;

	do {
		const parts: WokaParts = {
			body: getRandomPart(loadedLayers.body),
			eyes: getRandomPart(loadedLayers.eyes),
			hair: getRandomPart(loadedLayers.hair),
			clothes: getRandomPart(loadedLayers.clothes),
			hat: getRandomPart(loadedLayers.hat),
			accessory: getRandomPart(loadedLayers.accessory),
		};

		const tempDna = generateDna(parts);
		const sameDna = wokasGenerated.find((woka) => woka.dna === tempDna);

		if (!sameDna) {
			woka = {
				edition,
				dna: tempDna,
				parts,
			};
			wokasGenerated.push(woka);
		}
	} while (woka === undefined);

	await generateWokaFile(woka, edition);

	console.log(`Edition ${edition} woka has been generated with DNA: ${woka.dna}`);

	return woka;
}

function generateDna(parts: WokaParts): string {
	let composition = "";

	for (const layer of Object.keys(parts)) {
		composition += (composition === "" ? "" : "-") + parts[isLayer.parse(layer)].name;
	}

	return sha1(composition);
}

function getRandomPart(parts: WokaPart[]): WokaPart {
	if (parts.length < 1) {
		console.log(JSON.stringify(loadedLayers));
		return {
			name: "None",
			weight: 100,
			file: undefined,
		};
	}

	const weights: number[] = [];
	let i: number;

	for (i = 0; i < parts.length; i++) {
		weights[i] = parts[i].weight + (weights[i - 1] || 0);
	}

	const random = Math.random() * weights[weights.length - 1];

	for (i = 0; i < weights.length; i++) {
		if (weights[i] > random) break;
	}

	return parts[i];
}

async function generateWokaFile(woka: Woka, edition: number): Promise<void> {
	const filePath = wokasDirPath + edition + ".png";
	const layers: sharp.OverlayOptions[] = [];

	for (const layer of Object.keys(woka.parts)) {
		const partFile = woka.parts[isLayer.parse(layer)].file;

		if (!partFile) {
			continue;
		}

		layers.push({
			input: partFile,
		});
	}

	if (!fs.existsSync(filePath)) {
		const newFile = new PNG({
			width: 96,
			height: 128,
			filterType: 1,
		});

		fs.writeFileSync(filePath, PNG.sync.write(newFile));
	}

	try {
		const buffer = await sharp(filePath).composite(layers).toBuffer();
		await sharp(buffer).toFile(filePath);
	} catch (err) {
		throw new Error(`Error on generate ${filePath} woka`);
	}
}

async function generateData(config: ConfigBlockchain, edition: number, woka: Woka): Promise<void> {
	let generator: MetadataGenerator | undefined = undefined;

	switch (config.type) {
	case "ethereum":
		generator = new EthereumMetadataGenerator();
		break;
	case "avalanche":
		generator = new AvalancheMetadataGenerator();
		break;
	}

	if (!generator) {
		throw new Error(`Undefined metadata generator for ${config.type}`);
	}

	await generator.generate(config, woka);

	console.log(`Edition ${edition} metadata has been generated`);
}

async function generateAvatars(config: ConfigCollectionBackground|undefined): Promise<void> {
	// Search all backgrounds
	const backgroundFiles = await fs.promises.readdir(backgroundDirPath);

	backgroundFiles.forEach((file) => {
		const filePath = backgroundDirPath + file;

		if (fs.statSync(filePath).isDirectory()) {
			return;
		}

		loadedBackgrounds.push(filePath);
	});

	const cropFiles = await fs.promises.readdir(cropsDirPath);

	for (const file of sortNumFiles(cropFiles)) {
		const filePath = cropsDirPath + file;

		if (fs.statSync(filePath).isDirectory()) {
			continue;
		}

		const parts = file.split(".");

		if (parts[parts.length - 1] !== "png") {
			throw new Error(`${file} crop must be a png`);
		}

		await generateAvatar(config, file);
	}

	console.log(chalk.green("All avatars has been generated"));
}

async function generateCrops(config: ConfigCollectionCrop|undefined): Promise<void> {
	const files = await fs.promises.readdir(wokasDirPath);

	for (const file of sortNumFiles(files)) {
		const filePath = wokasDirPath + file;

		if (fs.statSync(filePath).isDirectory()) {
			continue;
		}

		const parts = file.split(".");

		if (parts[parts.length - 1] !== "png") {
			throw new Error(`${file} woka must be a PNG`);
		}

		await generateCrop(config, file);
	}

	console.log(chalk.green("All crops has been generated"));
}

async function generateCrop(config: ConfigCollectionCrop|undefined, file: string): Promise<void> {
	const sharpFile = sharp(wokasDirPath + file).extract({
		left: 32,
		top: 0,
		width: 32,
		height: 32,
	});

	if (config && config.size) {
		sharpFile.resize(config.size, config.size, {
			kernel: sharp.kernel.nearest,
		});
	}

	if (config && config.marging) {
		sharpFile.extend({
			top: config.marging.top,
			bottom: config.marging.bottom,
			left: config.marging.left,
			right: config.marging.right,
			background: { r: 0, g: 0, b: 0, alpha: 0 },
		});
	}

	await sharpFile.toFile(cropsDirPath + file);

	console.log(`Edition ${file} crop has been created!`);
}

async function generateAvatar(config: ConfigCollectionBackground|undefined, file: string): Promise<void> {
	if (config) {
		switch (config.method) {
			case "image": {
				if (loadedBackgrounds.length < 1) {
					throw new Error("You don't have any background in the assets folder");
				}

				await sharp(loadedBackgrounds[Math.floor(Math.random() * (loadedBackgrounds.length - 1))])
					.composite([{ input: cropsDirPath + file, gravity: "centre" }])
					.toFile(avatarsDirPath + file);
				break;
			}
			case "linked": {
				await sharp(backgroundDirPath + file)
					.composite([{ input: cropsDirPath + file, gravity: "centre" }])
					.toFile(avatarsDirPath + file);
				break;
			}
			case "color": {
				if (!config.color) {
					throw new Error("Undefined color property for \"color\" background method");
				}

				const background: sharp.Color = {
					r: undefined,
					g: undefined,
					b: undefined,
					alpha: undefined,
				};

				if (config.color.hex) {
					const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(config.color.hex);
					if (result) {
						background.r = parseInt(result[1], 16);
						background.g = parseInt(result[2], 16);
						background.b = parseInt(result[3], 16);
					}
				}

				if (config.color.alpha) {
					background.alpha = config.color.alpha;
				}

				await sharp(cropsDirPath + file)
					.removeAlpha()
					.flatten({ background })
					.toFile(avatarsDirPath + file);
				break;
			}
			case "none": {
				await sharp(cropsDirPath + file).toFile(avatarsDirPath + file);
				break;
			}
			}
	} else {
		await sharp(cropsDirPath + file).toFile(avatarsDirPath + file);
	}

	console.log(`Edition ${file} avatar has been generated`);
}

function sortNumFiles(files: string[]) {
	return files.sort(function (a, b) {
		return Number(a.split(".")[0]) - Number(b.split(".")[0]);
	});
}

run()
	.then(() => {
		for (const layer of Object.keys(loadedLayers)) {
			console.log("\n" + chalk.bold(`${layer.charAt(0).toUpperCase() + layer.slice(1)} parts rarity:`));
			console.table(loadedLayers[isLayer.parse(layer)], ["name", "weight"]);
		}

		console.log("\n" + chalk.bold("Generated Wokas:"));
		console.table(wokasGenerated, ["edition", "dna"]);

		console.log(chalk.green("All files has been generated"));
	})
	.catch((err) => {
		console.error(chalk.red(err));
	});

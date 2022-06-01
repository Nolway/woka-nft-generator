import { resolve } from "path";

export const configPath = resolve("src/config.ts");

// Build directories
export const buildDirPath = resolve("build");
export const wokasDirPath = `${buildDirPath}/wokas/`;
export const wokasUpscaleDirPath = `${buildDirPath}/wokas-upscale/`;
export const metadataDirPath = `${buildDirPath}/metadata/`;
export const cropsDirPath = `${buildDirPath}/crops/`;
export const avatarsDirPath = `${buildDirPath}/avatars/`;
export const cacheDirPath = `${buildDirPath}/hardhat-cache`;
export const artifactsDirPath = `${buildDirPath}/artifacts`;
export const hardhatConfigGeneratedPath = `${buildDirPath}/hardhat.config.json`;

// Assets directories
export const assetsDirPath = resolve("assets");
export const backgroundDirPath = `${assetsDirPath}/backgrounds/`;
export const layersDirPath = `${assetsDirPath}/layers/`;
export const layersUpscaleDirPath = `${assetsDirPath}/upscale-layers/`;
export const contractsDirPath = `${assetsDirPath}/contracts`;
export const wordsBindingPartsFilePath = `${assetsDirPath}/words.csv`;
export const fontFilePath = `${assetsDirPath}/font.otf`;

// Contract templates
export const ethContractTemplate = `${contractsDirPath}/EthContract.sol.tmpl`;

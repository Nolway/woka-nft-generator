import fs from "fs";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import { hardhatConfigGeneratedPath } from "./src/env";
import { HardhatUserConfig } from "hardhat/types";
import("@nahmii/hardhat-nvm");

if (!fs.existsSync(hardhatConfigGeneratedPath)) {
    throw new Error("No generated hardhat config fund!");
}

const configFile = fs.readFileSync(hardhatConfigGeneratedPath, { encoding: "utf-8" });

if (!configFile) {
    throw new Error("No content on hardhat generated config!");
}

const config: HardhatUserConfig = JSON.parse(configFile);

module.exports = config;

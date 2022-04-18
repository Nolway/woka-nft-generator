import fs from "fs";
import chalk from "chalk";
import { HardhatConfigGenerator } from "../generators/files/HardhatConfigGenerator";
import { getLocalConfig } from "../utils/ConfigUtils";
import { generateBuildDirectories } from "../utils/DirectoryUtils";
import { hardhatConfigGeneratedPath } from "../env";
async function run(): Promise<void> {
    const config = await getLocalConfig();
    const hardhatConfig = HardhatConfigGenerator.generate(config.blockchain);

    generateBuildDirectories();

    await fs.promises.writeFile(hardhatConfigGeneratedPath, JSON.stringify(hardhatConfig));
}

run()
    .then(() => {
        console.log(chalk.green("Hardhat configuration has been generated"));
    })
    .catch((err) => {
        console.error(chalk.red(err));
    });

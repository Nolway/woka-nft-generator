import fs from "fs";
import chalk from "chalk";
import { contractsDirPath, ethContractTemplate } from "../env";
import { getLocalConfig } from "../utils/ConfigUtils";

async function run(): Promise<void> {
    if (!fs.existsSync(ethContractTemplate)) {
        throw new Error("No EthContract.sol.tmpl fund!");
    }

    const config = await getLocalConfig();

    let fileContent = await fs.promises.readFile(ethContractTemplate, { encoding: "utf-8" });
    fileContent = fileContent.replace(/\${contractName}/, config.blockchain.compile.contract);
    fileContent = fileContent.replace(/\${cost}/, String(config.blockchain.compile.infos.cost));
    fileContent = fileContent.replace(/\${collectionCount}/, String(config.collection.size));
    fileContent = fileContent.replace(/\${maxMintAmount}/, String(config.blockchain.compile.infos.max));
    fileContent = fileContent.replace(/\${initialMintCount}/, String(config.blockchain.compile.infos.initial));
    fileContent = fileContent.replace(/\${firstReleaseDate}/, String(config.blockchain.compile.infos.firstReleaseDate));
    fileContent = fileContent.replace(
        /\${firstReleaseEndDate}/,
        String(config.blockchain.compile.infos.firstReleaseEndDate)
    );
    fileContent = fileContent.replace(
        /\${secondReleaseDate}/,
        String(config.blockchain.compile.infos.secondReleaseDate)
    );

    await fs.promises.writeFile(`${contractsDirPath}/${config.blockchain.compile.contract}.sol`, fileContent);
}

run()
    .then(() => {
        console.log(chalk.green("The contract has been generated"));
    })
    .catch((err) => {
        console.error(chalk.red(err));
    });

import chalk from "chalk";
import hre from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { getLocalConfig } from "../utils/ConfigUtils";

async function run(): Promise<void> {
    const config = await getLocalConfig();

    if (!config.blockchain.scripting || !config.blockchain.scripting.address) {
        throw Error("Undefined contract address on configuration");
    }

    const Contract = await hre.ethers.getContractFactory(config.blockchain.compile.contract);
    const contract = await Contract.attach(config.blockchain.scripting.address);

    try {
        await contract.setBaseURI(config.blockchain.compile.infos.metadata);
    } catch (err) {
        if (err instanceof Error) {
            throw Error(err.message);
        }
        console.error(err);
        throw Error();
    }
}

run()
    .then(() => {
        console.log(chalk.green("The metadata URI has been updated on contract"));
    })
    .catch((err) => {
        console.error(chalk.red(err));
    });

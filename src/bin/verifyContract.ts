import chalk from "chalk";
import hre from "hardhat";
import { getLocalConfig } from "../utils/ConfigUtils";

async function run(): Promise<void> {
    const config = await getLocalConfig();

    if (!config.blockchain.scripting || !config.blockchain.scripting.address) {
        throw Error("Undefined contract address on configuration");
    }

    if (!config.blockchain.scripting.scan || !config.blockchain.scripting.scan.key) {
        throw Error("Undefined scan key");
    }

    await hre.run("verify:verify", {
        address: config.blockchain.scripting.address,
        constructorArguments: [
            config.blockchain.compile.infos.name,
            config.blockchain.compile.infos.symbol,
            config.blockchain.compile.infos.metadata,
        ],
    });
}

run()
    .then(() => {
        console.log(chalk.green("The contract has been verified"));
    })
    .catch((err) => {
        console.error(chalk.red(err));
    });

import chalk from "chalk";
import { Contract } from "ethers";
import hre from "hardhat";
import { getLocalConfig } from "../utils/ConfigUtils";
import "@nomiclabs/hardhat-ethers";

let contracName = "";

async function run(): Promise<Contract> {
    await hre.run("compile");

    const config = await getLocalConfig();
    contracName = config.blockchain.compile.contract;

    const contract = await hre.ethers.getContractFactory(config.blockchain.compile.contract);
    const contractDeploy = await contract.deploy(
        config.blockchain.compile.infos.name,
        config.blockchain.compile.infos.symbol,
        config.blockchain.compile.infos.metadata
    );

    console.log("Deployement in progress... (please wait this action take some time)");

    await contractDeploy.deployed();

    return contractDeploy;
}

run()
    .then((contract) => {
        console.log(chalk.green(`The contract ${contracName} has been deployed to: ${contract.address}`));
    })
    .catch((err) => {
        console.error(chalk.red(err));
    });

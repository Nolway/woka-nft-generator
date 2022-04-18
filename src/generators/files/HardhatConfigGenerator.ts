import { HardhatUserConfig } from "hardhat/types/config";
import { artifactsDirPath, cacheDirPath, contractsDirPath } from "../../env";
import { ConfigBlockchain } from "../../guards/ConfigGuards";

export class HardhatConfigGenerator {
    public static generate(config: ConfigBlockchain): HardhatUserConfig {
        const hardhatConfig = {
            solidity: {
                version: "0.8.O",
            },
            paths: {
                sources: contractsDirPath,
                cache: cacheDirPath,
                artifacts: artifactsDirPath,
            },
            networks: {
                bsc_testnet: {
                    url: "https://data-seed-prebsc-1-s1.binance.org:8545",
                    chainId: 97,
                    gasPrice: 20000000000,
                    accounts: config.compile.accounts,
                },
                bsc: {
                    url: "https://bsc-dataseed.binance.org/",
                    chainId: 56,
                    gasPrice: 20000000000,
                    accounts: config.compile.accounts,
                },
                avash: {
                    url: "http://localhost:9650/ext/bc/C/rpc",
                    chainId: 43112,
                    accounts: config.compile.accounts,
                },
                fuji: {
                    url: "https://api.avax-test.network/ext/bc/C/rpc",
                    chainId: 43113,
                    accounts: config.compile.accounts,
                },
                avalanche: {
                    url: "https://api.avax.network/ext/bc/C/rpc",
                    chainId: 43114,
                    accounts: config.compile.accounts,
                },
                nahmii: {
                    url: "https://l2.nahmii.io/",
                    nvm: true,
                    gasPrice: 15000000,
                    accounts: config.compile.accounts,
                },
                nahmii_testnet: {
                    url: "https://l2.testnet.nahmii.io/",
                    nvm: true,
                    gasPrice: 15000000,
                    gasLimit: 15000000,
                    accounts: config.compile.accounts,
                },
                custom: {
                    url: config.url ?? "",
                    accounts: config.compile.accounts,
                },
            },
            defaultNetwork: config.url ? "custom" : config.type,
        };

        if (config.compile.solidity) {
            hardhatConfig.solidity = config.compile.solidity;
        }

        return hardhatConfig;
    }
}

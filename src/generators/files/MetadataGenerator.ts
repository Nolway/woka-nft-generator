import fs from "fs";
import { metadataDirPath } from "../../env";
import { ConfigBlockchain } from "../../guards/ConfigGuards";
import { Metadata } from "../../guards/MetadataGuards";
import { Woka } from "../../guards/WokaGuards";
import { EthereumGenerator } from "../blockchains/EthereumGenerator";
import { MetadataGenericGenerator } from "../MetadataGenericGenerator";

export class MetadataGenerator {
    constructor(private config: ConfigBlockchain) {}

    public generate(woka: Woka): Metadata {
        let generator: MetadataGenericGenerator;

        switch (this.config.type) {
            case "ethereum":
            case "ropsten":
            case "bsc":
            case "bsc_testnet":
            case "avalanche":
            case "avash":
            case "fuji":
            case "nahmii":
            case "nahmii_testnet":
                generator = new EthereumGenerator();
                break;
        }

        if (!generator) {
            throw new Error(`Unknown metadata generator for ${this.config.type}`);
        }

        return generator.generateMetadata(this.config, woka);
    }

    public static async exportLocal(metadata: Metadata) {
        await fs.promises.writeFile(`${metadataDirPath}${metadata.edition}.json`, JSON.stringify(metadata, null, 2));
    }
}

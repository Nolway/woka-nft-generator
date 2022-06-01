import fs from "fs";
import { metadataDirPath } from "../../env";
import { Config } from "../../guards/ConfigGuards";
import { Metadata, WordBindingPart } from "../../guards/MetadataGuards";
import { Woka } from "../../guards/WokaGuards";
import { getAllWordsBindingParts } from "../../utils/MetadataUtils";
import { EthereumGenerator } from "../blockchains/EthereumGenerator";
import { MetadataGenericGenerator } from "../MetadataGenericGenerator";

export class MetadataGenerator {
    private wordsBindingParts: WordBindingPart[];

    constructor(private readonly config: Config) {
        this.wordsBindingParts = getAllWordsBindingParts();
    }

    public generate(woka: Woka): Metadata {
        let generator: MetadataGenericGenerator;

        switch (this.config.blockchain.type) {
            case "ethereum":
                generator = new EthereumGenerator();
                break;
        }

        if (!generator) {
            throw new Error(`Unknown metadata generator for ${this.config.blockchain.type}`);
        }

        return generator.generateMetadata(this.config, this.wordsBindingParts, woka);
    }

    public static async exportLocal(metadata: Metadata) {
        await fs.promises.writeFile(`${metadataDirPath}${metadata.edition}.json`, JSON.stringify(metadata, null, 2));
    }
}

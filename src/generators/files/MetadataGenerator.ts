import fs from "fs";
import { parse } from "csv-parse/sync";
import { metadataDirPath, wordsBindingPartsFilePath } from "../../env";
import { Config } from "../../guards/ConfigGuards";
import { WordBindingPart, Metadata } from "../../guards/MetadataGuards";
import { Woka } from "../../guards/WokaGuards";
import { EthereumGenerator } from "../blockchains/EthereumGenerator";
import { MetadataGenericGenerator } from "../MetadataGenericGenerator";

export class MetadataGenerator {
    private wordsBindingParts: WordBindingPart[];
    private metadataAggregate: Metadata[] = [];

    constructor(private readonly config: Config) {
        this.wordsBindingParts = this.getAllWordsBindingParts();
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

    private getAllWordsBindingParts(): WordBindingPart[] {
        if (!fs.existsSync(wordsBindingPartsFilePath)) {
            return [];
        }

        const wordsCSV: unknown[] = parse(fs.readFileSync(wordsBindingPartsFilePath), {
            delimiter: ";",
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        const wordsVerified: WordBindingPart[] = [];

        for (let i = 0; i < wordsCSV.length; i++) {
            const isWordBinding = WordBindingPart.safeParse(wordsCSV[i]);

            if (!isWordBinding.success) {
                console.error("Cannot read this line", wordsCSV[i], isWordBinding.error.issues);
                continue;
            }

            wordsVerified.push(isWordBinding.data);
        }

        return wordsVerified;
    }

    public async exportLocal(metadata: Metadata) {
        this.metadataAggregate.push(metadata);
        await fs.promises.writeFile(`${metadataDirPath}${metadata.edition}.json`, JSON.stringify(metadata, null, 2));
    }

    public async exportAggregate() {
        await fs.promises.writeFile(`${metadataDirPath}metadata.json`, JSON.stringify(this.metadataAggregate, null, 2));
    }
}

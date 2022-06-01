import { Config } from "../../guards/ConfigGuards";
import { EthereumMetadata, WordBindingPart } from "../../guards/MetadataGuards";
import { Woka } from "../../guards/WokaGuards";
import { formatStringWithVariables, generateAttributes } from "../../utils/MetadataUtils";
import { MetadataGenericGenerator } from "../MetadataGenericGenerator";

export class EthereumGenerator implements MetadataGenericGenerator {
    public generateMetadata(config: Config, wordsBindingParts: WordBindingPart[], woka: Woka): EthereumMetadata {
        const name = formatStringWithVariables(config.blockchain.metadata.name, config, woka);
        const description = formatStringWithVariables(config.blockchain.metadata.description, config, woka);

        return {
            name,
            description,
            image: `${config.blockchain.metadata.image}${woka.edition}.png`,
            woka: `${config.blockchain.metadata.woka}${woka.edition}.png`,
            dna: woka.dna,
            edition: woka.edition,
            attributes: generateAttributes(woka.layers),
        };
    }
}

import { Config } from "../../guards/ConfigGuards";
import { EthereumMetadata, WordBindingPart } from "../../guards/MetadataGuards";
import { Woka } from "../../guards/WokaGuards";
import { generateAttributes, getRarestRarityLabel, getWordsByWoka } from "../../utils/MetadataUtils";
import { MetadataGenericGenerator } from "../MetadataGenericGenerator";

export class EthereumGenerator implements MetadataGenericGenerator {
    public generateMetadata(config: Config, wordsBindingParts: WordBindingPart[], woka: Woka): EthereumMetadata {
        let name = config.blockchain.metadata.name;
        let description = config.blockchain.metadata.description;
        const wordsBinding = getWordsByWoka(wordsBindingParts, woka);

        const rarestRarityLabel = config.collection?.rarity?.labels
            ? getRarestRarityLabel(woka, config.collection.rarity.labels)
            : "";

        name = name.replace(/{edition}/g, woka.edition.toString());
        name = name.replace(/{binding}/g, wordsBinding);
        name = name.replace(/{rarity}/g, rarestRarityLabel);

        description = description.replace(/{edition}/g, woka.edition.toString());
        description = description.replace(/{binding}/g, wordsBinding);
        description = description.replace(/{rarity}/g, rarestRarityLabel);

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

import { ConfigBlockchain } from "../../guards/ConfigGuards";
import { EthereumMetadata } from "../../guards/MetadataGuards";
import { Woka } from "../../guards/WokaGuards";
import { generateAttributes } from "../../utils/MetadataUtils";
import { MetadataGenericGenerator } from "../MetadataGenericGenerator";

export class EthereumGenerator implements MetadataGenericGenerator {
    public generateMetadata(config: ConfigBlockchain, woka: Woka): EthereumMetadata {
        let namePrefix = "";
        let nameSuffix = "";

        if (config.metadata.name) {
            namePrefix = config.metadata.name.prefix ?? "";
            nameSuffix = config.metadata.name.suffix ?? "";
        }

        return {
            name: `${namePrefix}${woka.edition}${nameSuffix}`,
            description: config.metadata.description,
            image: `${config.metadata.image}${woka.edition}.png`,
            woka: `${config.metadata.woka}${woka.edition}.png`,
            dna: woka.dna,
            edition: woka.edition,
            attributes: generateAttributes(woka.layers),
        };
    }
}

import fs from "fs";
import { dataDirPath } from "..//generate";
import { ConfigBlockchain } from "../guards/ConfigGuards";
import { EthereumMetadata } from "../guards/MetadataGuards";
import { Woka } from "../guards/WokaGuards";
import { generateAttributes } from "../utils/MetadataUtils";
import { MetadataGenerator } from "./MetadataGenerator";

export class EthereumMetadataGenerator implements MetadataGenerator {
    async generate(config: ConfigBlockchain, woka: Woka): Promise<void> {
        let namePrefix = "";
        let nameSuffix = "";

        if (config.metadata.name) {
            namePrefix = config.metadata.name.prefix ?? "";
            nameSuffix = config.metadata.name.suffix ?? "";
        }

        const metadata: EthereumMetadata = {
            name: `${namePrefix}${woka.edition}${nameSuffix}`,
            description: config.metadata.description,
            image: `${config.metadata.image}${woka.edition}.png`,
            dna: woka.dna,
            edition: woka.edition,
            attributes: generateAttributes(woka.parts),
        };

        await fs.promises.writeFile(`${dataDirPath}${woka.edition}.json`, JSON.stringify(metadata, null, 2));
    }
}

import fs from "fs";
import { dataDirPath } from "..//generate";
import { ConfigBlockchain } from "../guards/ConfigGuards";
import { EthereumMetadata } from "../guards/MetadataGuards";
import { Woka } from "../guards/WokaGuards";
import { generateAttributes } from "../utils/MetadataUtils";
import { MetadataGenerator } from "./MetadataGenerator";

export class EthereumMetadataGenerator implements MetadataGenerator {
    async generate(config: ConfigBlockchain, woka: Woka): Promise<void> {
        const metadata: EthereumMetadata = {
            name: `${config.metadata.name.prefix}${woka.edition}${config.metadata.name.suffix}`,
            description: config.metadata.description,
            image: `${config.metadata.image}${woka.edition}.png`,
            dna: woka.dna,
            edition: woka.edition,
            attributes: generateAttributes(woka.parts),
        };

        await fs.promises.writeFile(`${dataDirPath}${woka.edition}.json`, JSON.stringify(metadata, null, 2));
    }
}

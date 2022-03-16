import fs from "fs";
import { dataDirPath } from "../../env";
import { ConfigBlockchain } from "../../guards/ConfigGuards";
import { Metadata } from "../../guards/MetadataGuards";
import { Woka } from "../../guards/WokaGuards";
import { AvalancheMetadataGenerator } from "../metadata/AvalancheMetadataGenerator";
import { EthereumMetadataGenerator } from "../metadata/EthereumMetadataGenerator";
import { MetadataGenericGenerator } from "../metadata/MetadataGenericGenerator";

export class MetadataGenerator {
	constructor(private config: ConfigBlockchain) {}

	public generate(woka: Woka): Metadata {
		let generator: MetadataGenericGenerator | undefined;

		switch (this.config.type) {
		case "ethereum":
			generator = new EthereumMetadataGenerator();
			break;
		case "avalanche":
			generator = new AvalancheMetadataGenerator();
			break;
		}

		if (!generator) {
			throw new Error(`Undefined metadata generator for ${this.config.type}`);
		}

		return generator.generate(this.config, woka);
	}

	public async exportLocal(metadata: Metadata) {
		await fs.promises.writeFile(`${dataDirPath}${metadata.edition}.json`, JSON.stringify(metadata, null, 2));
	}
}

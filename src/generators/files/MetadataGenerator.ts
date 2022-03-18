import fs from "fs";
import { metadataDirPath } from "../../env";
import { ConfigBlockchain } from "../../guards/ConfigGuards";
import { Metadata } from "../../guards/MetadataGuards";
import { Woka } from "../../guards/WokaGuards";
import { AvalancheMetadataGenerator } from "../metadata/AvalancheMetadataGenerator";
import { EthereumMetadataGenerator } from "../metadata/EthereumMetadataGenerator";
import { MetadataGenericGenerator } from "../metadata/MetadataGenericGenerator";

export class MetadataGenerator {
	constructor(private config: ConfigBlockchain) {}

	public generate(woka: Woka): Metadata {
		let generator: MetadataGenericGenerator;

		switch (this.config.type) {
		case "ethereum":
			generator = new EthereumMetadataGenerator();
			break;
		case "avalanche":
			generator = new AvalancheMetadataGenerator();
			break;
		}

		if (!generator) {
			throw new Error(`Unknown metadata generator for ${this.config.type}`);
		}

		return generator.generate(this.config, woka);
	}

	public static async exportLocal(metadata: Metadata) {
		await fs.promises.writeFile(`${metadataDirPath}${metadata.edition}.json`, JSON.stringify(metadata, null, 2));
	}
}

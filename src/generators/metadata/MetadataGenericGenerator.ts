import { ConfigBlockchain } from "../../guards/ConfigGuards";
import { Metadata } from "../../guards/MetadataGuards";
import { Woka } from "../../guards/WokaGuards";

export interface MetadataGenericGenerator {
    generate(config: ConfigBlockchain, woka: Woka): Metadata;
}

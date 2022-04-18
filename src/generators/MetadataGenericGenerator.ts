import { ConfigBlockchain } from "../guards/ConfigGuards";
import { Metadata } from "../guards/MetadataGuards";
import { Woka } from "../guards/WokaGuards";

export type MetadataGenericGenerator = {
    generateMetadata(config: ConfigBlockchain, woka: Woka): Metadata;
}

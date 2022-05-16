import { Config } from "../guards/ConfigGuards";
import { Metadata, WordBindingPart } from "../guards/MetadataGuards";
import { Woka } from "../guards/WokaGuards";

export type MetadataGenericGenerator = {
    generateMetadata(config: Config, wordsBindingParts: WordBindingPart[], woka: Woka): Metadata;
};

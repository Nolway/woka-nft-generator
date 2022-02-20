import { ConfigBlockchain } from "src/guards/ConfigGuards";
import { Woka } from "src/guards/WokaGuards";

export interface MetadataGenerator {
    generate(config: ConfigBlockchain, woka: Woka): Promise<void>;
}

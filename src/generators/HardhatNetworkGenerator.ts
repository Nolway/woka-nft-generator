import { HardhatNetworkConfig } from "hardhat/types/config";
import { ConfigBlockchain } from "../guards/ConfigGuards";

export type HardhatNetworkGenerator = {
    generateNetwork(config: ConfigBlockchain): HardhatNetworkConfig;
}

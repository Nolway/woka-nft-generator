import fs from "fs";
import { configPath } from "../env";
import { Config, isConfig } from "../guards/ConfigGuards";

export async function getLocalConfig(): Promise<Config> {
    if (!fs.existsSync(configPath)) {
		throw new Error("No config.ts fund! You can copy the config.dist.ts to config.ts");
	}

	const configFile = await import(configPath);
	return isConfig.parse(configFile.default);
}

import fs from "fs";
import chalk from "chalk";
import { removeBuildDirectory } from "../utils/DirectoryUtils";
import { buildDirPath } from "../env";

if (fs.existsSync(buildDirPath)) {
	removeBuildDirectory();
	console.log(chalk.green("Build folder has been removed"));
} else {
	console.log(chalk.red("Build folder doesn't exist"));
}

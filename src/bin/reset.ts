import fs from "fs";
import chalk from "chalk";
import { removeBuildDirectory } from "../utils/DirectoryUtils";

if (fs.existsSync("build")) {
	removeBuildDirectory();
	console.log(chalk.green("Build folder has been removed"));
} else {
	console.log(chalk.red("Build folder doesn't exist"));
}

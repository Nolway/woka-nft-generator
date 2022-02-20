import fs from "fs";
import chalk from "chalk";

if (fs.existsSync("build")) {
    fs.rmSync("build", { recursive: true, force: true });
    console.log(chalk.green("Build folder has been removed"));
} else {
    console.log(chalk.red("Build folder doesn't exist"));
}

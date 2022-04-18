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

export function getLocalConfigSync(): Config {
    if (!fs.existsSync(configPath)) {
        throw new Error("No config.ts fund! You can copy the config.dist.ts to config.ts");
    }

    const configFile = fs.readFileSync(configPath, { encoding: "utf-8" });
    const removeCommentConfig = removeCodeComments(configFile); // Remove comments
    const removeBreakLinesConfig = removeCommentConfig.replace(/(\r\n|\n|\r)/gm, ""); // Remove brealines
    const removeSpacesConfig = removeBreakLinesConfig.replace(/\s/g, ""); // Remove spaces
    const matchConfigs = removeSpacesConfig.match(/\s*={.*}/); // Match config

    if (!matchConfigs || matchConfigs.length < 1) {
        throw new Error("Undefined config on config.ts");
    }

    const configString = matchConfigs[0].substring(1); // Remove the first char
    const changeKeyToStringConfig = configString.replace(
        /({|,)(?:\s*)(?:')?([A-Za-z_$\\.][A-Za-z0-9_ \-\\.$]*)(?:')?(?:\s*):/g,
        "$1\"$2\":"
    ); // Key to string
    const removeTraillingCommaConfig = changeKeyToStringConfig.replace(/,(?!\s*?[{["\w])|(?<=[{[]\s*?),/g, ""); // Remove trailling commas

    const config = JSON.parse(removeTraillingCommaConfig);

    return isConfig.parse(config);
}

export function removeCodeComments(code: string) {
    let inQuoteChar = null;
    let inBlockComment = false;
    let inLineComment = false;
    let inRegexLiteral = false;
    let newCode = "";
    for (let i = 0; i < code.length; i++) {
        if (!inQuoteChar && !inBlockComment && !inLineComment && !inRegexLiteral) {
            if (code[i] === "\"" || code[i] === "'" || code[i] === "`") {
                inQuoteChar = code[i];
            } else if (code[i] === "/" && code[i + 1] === "*") {
                inBlockComment = true;
            } else if (code[i] === "/" && code[i + 1] === "/") {
                inLineComment = true;
            } else if (code[i] === "/" && code[i + 1] !== "/") {
                inRegexLiteral = true;
            }
        } else {
            if (
                inQuoteChar &&
                ((code[i] === inQuoteChar && code[i - 1] != "\\") || (code[i] === "\n" && inQuoteChar !== "`"))
            ) {
                inQuoteChar = null;
            }
            if (inRegexLiteral && ((code[i] === "/" && code[i - 1] !== "\\") || code[i] === "\n")) {
                inRegexLiteral = false;
            }
            if (inBlockComment && code[i - 1] === "/" && code[i - 2] === "*") {
                inBlockComment = false;
            }
            if (inLineComment && code[i] === "\n") {
                inLineComment = false;
            }
        }
        if (!inBlockComment && !inLineComment) {
            newCode += code[i];
        }
    }
    return newCode;
}

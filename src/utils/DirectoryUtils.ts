import fs from "fs";
import { avatarsDirPath, buildDirPath, cropsDirPath, metadataDirPath, wokasDirPath } from "../env";

export function removeBuildDirectory() {
    if (fs.existsSync(buildDirPath)) {
        fs.rmSync(buildDirPath, { recursive: true, force: true });
    }
}

export function generateBuildDirectories() {
    if (!fs.existsSync(buildDirPath)) {
        fs.mkdirSync(buildDirPath);
    }

    if (!fs.existsSync(wokasDirPath)) {
        fs.mkdirSync(wokasDirPath);
    }

    if (!fs.existsSync(cropsDirPath)) {
        fs.mkdirSync(cropsDirPath);
    }

    if (!fs.existsSync(avatarsDirPath)) {
        fs.mkdirSync(avatarsDirPath);
    }

    if (!fs.existsSync(metadataDirPath)) {
        fs.mkdirSync(metadataDirPath);
    }
}

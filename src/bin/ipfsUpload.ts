import fs from "fs";
import chalk from "chalk";
import { getLocalConfig } from "../utils/ConfigUtils";
import { avatarsDirPath, buildDirPath, metadataDirPath } from "../env";
import { FileBuffer, UploadResult } from "../guards/UploaderGuard";
import { UploadManager } from "../uploaders/UploadManager";
import { isMetadata, Metadata } from "../guards/MetadataGuards";
import { MetadataGenerator } from "../generators/files/MetadataGenerator";
import { z } from "zod";

let metadataHash: UploadResult | undefined = undefined;

async function run() {
    const config = await getLocalConfig();

    if (!fs.existsSync(buildDirPath)) {
        throw new Error("Undefined build folder");
    }

    if (!fs.existsSync(avatarsDirPath)) {
        throw new Error("Undefined avatars folder");
    }

    if (!fs.existsSync(metadataDirPath)) {
        throw new Error("Undefined metadata folder");
    }

    const avatars = sortFilesByName(await fs.promises.readdir(avatarsDirPath)).filter(
        (fileName) => !fs.statSync(avatarsDirPath + fileName).isDirectory()
    );

    const metadata = sortFilesByName(await fs.promises.readdir(metadataDirPath)).filter(
        (fileName) => !fs.statSync(metadataDirPath + fileName).isDirectory()
    );

    if (avatars.length !== metadata.length) {
        throw new Error("Avatars folder and metadata folder don't have the same count of file");
    }

    const avatarBuffers: FileBuffer[] = [];

    for (const avatar of avatars) {
        avatarBuffers.push({
            name: avatar,
            buffer: await fs.promises.readFile(avatarsDirPath + avatar),
        });
    }

    const avatarHash = await UploadManager.upload(config.ipfs, avatarBuffers, config.ipfs.folders.avatars);

    console.log(chalk.green("All avatars have been uploaded"));
    console.log(chalk.green(`The avatars folder IPFS hash is: ${avatarHash.hash}`));

    const metadataBuffers: FileBuffer[] = [];

    for (const data of metadata) {
        const edition = data.split(".")[0];
        const rawData = fs.readFileSync(metadataDirPath + data);

        let jsonData: Metadata;

        // Convert Buffer to String then a JSON object and check if it's a Metadata object
        try {
            jsonData = isMetadata.parse(JSON.parse(rawData.toString()));
        } catch (err) {
            if (err instanceof z.ZodError) {
                console.log(err.issues);
            }
            throw new Error("Error on parsing metadata");
        }

        jsonData.image = `ipfs://${avatarHash}/${config.ipfs.folders.avatars}/${edition}.png`;

        MetadataGenerator.exportLocal(jsonData);

        console.log(`Metadata of Woka edition ${edition} has been updated`);

        metadataBuffers.push({
            name: data,
            buffer: Buffer.from(JSON.stringify(jsonData)),
        });
    }

    console.log(chalk.green("All metadata files has been updated with the new IPFS hash on image property"));

    metadataHash = await UploadManager.upload(config.ipfs, metadataBuffers, config.ipfs.folders.metadata);

    console.log(chalk.green("All files have been uploaded"));
}

function sortFilesByName(files: string[]) {
    return files.sort(function (a, b) {
        return Number(a.split(".")[0]) - Number(b.split(".")[0]);
    });
}

run()
    .then(() => {
        console.log(chalk.green(`The metadata folder IPFS hash is: ${metadataHash?.hash}`));
        console.log(
            chalk.yellow(
                `You need to add the following value on blockchain.compile.metadata configuration key to push the smart contract: ipfs://${metadataHash?.hash}/`
            )
        );
    })
    .catch((err) => {
        console.error(chalk.red(err));
    });

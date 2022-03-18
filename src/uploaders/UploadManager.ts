import { ConfigIpfs } from "../guards/ConfigGuards";
import { FileBuffer, UploadResult } from "../guards/UploaderGuard";
import { GenericUploader } from "./GenericUploader";
import { MoralisUploader } from "./MoralisUploader";
import { PinataUploader } from "./PinataUploader";

export class UploadManager {
    public static async upload(config: ConfigIpfs, files: FileBuffer[], folder: string): Promise<UploadResult> {
        let uploader: GenericUploader;

        switch(config.service) {
            case "pinata":
                uploader = new PinataUploader();
                break;
            case "moralis":
                uploader = new MoralisUploader();
                break;
        }

        if (!uploader) {
			throw new Error(`Unknown uploader service for ${config.service}`);
		}

        return uploader.upload(config, files, folder);
    }
}

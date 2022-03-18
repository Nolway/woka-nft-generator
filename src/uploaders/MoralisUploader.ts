import { ConfigIpfsMoralis } from "../guards/ConfigGuards";
import { FileBuffer, UploadResult } from "../guards/UploaderGuard";
import { GenericUploader } from "./GenericUploader";

export class MoralisUploader implements GenericUploader {

    public async upload(config: ConfigIpfsMoralis, files: FileBuffer[], folder: string): Promise<UploadResult> {
        return {
            hash: "",
        };
    }
}
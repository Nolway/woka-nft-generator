import { ConfigIpfs } from "../guards/ConfigGuards";
import { FileBuffer, UploadResult } from "../guards/UploaderGuard";

export type GenericUploader = {
    upload(config: ConfigIpfs, files: FileBuffer[], folder: string): Promise<UploadResult>;
}

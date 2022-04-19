import axios from "axios";
import FormData from "form-data";
import { ConfigIpfsPinata } from "../guards/ConfigGuards";
import { FileBuffer, isPinataUploaderResult, UploadResult } from "../guards/UploaderGuard";
import { GenericUploader } from "./GenericUploader";

export class PinataUploader implements GenericUploader {
    private readonly apiUrl = "https://api.pinata.cloud";

    public async upload(config: ConfigIpfsPinata, files: FileBuffer[], folder: string): Promise<UploadResult> {
        const data = new FormData();

        for (const file of files) {
            data.append("file", file.buffer, { filename: file.name, filepath: `${folder}/${file.name}` });
        }

        const result = await axios.post(`${this.apiUrl}/pinning/pinFileToIPFS`, data, {
            maxBodyLength: Infinity,
            headers: {
                "Content-Type": `multipart/form-data; boundary=${data.getBoundary()}`,
                pinata_api_key: config.auth.key,
                pinata_secret_api_key: config.auth.secret,
            },
        });

        const pinataResult = isPinataUploaderResult.parse(result.data);

        return {
            hash: pinataResult.IpfsHash,
        };
    }
}

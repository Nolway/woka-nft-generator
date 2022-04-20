import axios from "axios";
import { ConfigIpfsMoralis } from "../guards/ConfigGuards";
import { FileBuffer, isMoralisUploaderResult, UploadResult } from "../guards/UploaderGuard";
import { GenericUploader } from "./GenericUploader";

export class MoralisUploader implements GenericUploader {
    private readonly apiUrl = "https://deep-index.moralis.io/api/v2";

    public async upload(config: ConfigIpfsMoralis, files: FileBuffer[]): Promise<UploadResult> {
        const data = [];

        for (const file of files) {
            data.push({
                path: `${file.name}`,
                content: file.buffer.toString("base64"),
            });
        }

        const result = await axios.post(`${this.apiUrl}/ipfs/uploadFolder`, data, {
            maxBodyLength: Infinity,
            headers: {
                "X-API-KEY": config.auth.key,
                "Content-Type": "application/json",
                accept: "application/json",
            },
        });

        const moralisResult = isMoralisUploaderResult.parse(result.data);

        return {
            hash: moralisResult[0].path.split("/")[4],
        };
    }
}

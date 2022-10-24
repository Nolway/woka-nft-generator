import { z } from "zod";

export const FileBuffer = z.object({
    name: z.string(),
    buffer: z.instanceof(Buffer),
});
export type FileBuffer = z.infer<typeof FileBuffer>;

export const UploadResult = z.object({
    hash: z.string(),
});
export type UploadResult = z.infer<typeof UploadResult>;

export const PinataUploaderResult = z.object({
    IpfsHash: z.string(),
});
export type PinataUploaderResult = z.infer<typeof PinataUploaderResult>;

export const MoralisUploaderResult = z.array(
    z.object({
        path: z.string(),
    })
);
export type MoralisUploaderResult = z.infer<typeof MoralisUploaderResult>;

import { z } from "zod";

export const isFileBuffer = z.object({
    name: z.string(),
    buffer: z.instanceof(Buffer),
});
export type FileBuffer = z.infer<typeof isFileBuffer>;

export const isUploadResult = z.object({
    hash: z.string(),
});
export type UploadResult = z.infer<typeof isUploadResult>;

export const isPinataUploaderResult = z.object({
    IpfsHash: z.string(),
});
export type PinataUploaderResult = z.infer<typeof isPinataUploaderResult>;

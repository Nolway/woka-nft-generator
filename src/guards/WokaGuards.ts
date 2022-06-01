import { z } from "zod";

export const isWokaTexture = z.object({
    name: z.string(),
    weight: z.number().nonpositive(),
    file: z.string().optional(),
    upscaleFile: z.string().optional(),
});
export type WokaTexture = z.infer<typeof isWokaTexture>;

export const isWokaLayers = z.record(isWokaTexture);
export type WokaLayers = z.infer<typeof isWokaLayers>;

export const isWoka = z.object({
    edition: z.number().positive(),
    dna: z.string(),
    layers: isWokaLayers,
    tileset: z.instanceof(Buffer).optional(),
    upscaleTileset: z.instanceof(Buffer).optional(),
    crop: z.instanceof(Buffer).optional(),
    avatar: z.instanceof(Buffer).optional(),
});
export type Woka = z.infer<typeof isWoka>;

export const isLoadedLayers = z.record(z.array(isWokaTexture));
export type LoadedLayers = z.infer<typeof isLoadedLayers>;

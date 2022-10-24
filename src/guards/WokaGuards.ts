import { z } from "zod";

export const WokaTexture = z.object({
    name: z.string(),
    weight: z.number().nonpositive(),
    file: z.instanceof(Buffer).optional(),
});
export type WokaTexture = z.infer<typeof WokaTexture>;

export const WokaLayers = z.record(WokaTexture);
export type WokaLayers = z.infer<typeof WokaLayers>;

export const Woka = z.object({
    edition: z.number().positive(),
    dna: z.string(),
    layers: WokaLayers,
    tileset: z.instanceof(Buffer).optional(),
    crop: z.instanceof(Buffer).optional(),
    avatar: z.instanceof(Buffer).optional(),
});
export type Woka = z.infer<typeof Woka>;

export const LoadedLayers = z.record(z.array(WokaTexture));
export type LoadedLayers = z.infer<typeof LoadedLayers>;

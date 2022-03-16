import { z } from "zod";

export const isWokaPart = z.object({
    name: z.string(),
    weight: z.number().nonpositive(),
	file: z.string().optional(),
});
export type WokaPart = z.infer<typeof isWokaPart>;

export const isLayer = z.enum(["body", "eyes", "hair", "clothes", "hat", "accessory"]);
export type Layer = z.infer<typeof isLayer>;

export const isWokaParts = z.object({
	body: isWokaPart,
	eyes: isWokaPart,
	hair: isWokaPart,
	clothes: isWokaPart,
	hat: isWokaPart,
	accessory: isWokaPart,
});
export type WokaParts = z.infer<typeof isWokaParts>;

export const isWoka = z.object({
	edition: z.number().positive(),
	dna: z.string(),
	parts: isWokaParts,
});
export type Woka = z.infer<typeof isWoka>;

export const isLoadedLayers = z.object({
	body: z.array(isWokaPart),
	eyes: z.array(isWokaPart),
	hair: z.array(isWokaPart),
	clothes: z.array(isWokaPart),
	hat: z.array(isWokaPart),
	accessory: z.array(isWokaPart),
});
export type LoadedLayers = z.infer<typeof isLoadedLayers>;

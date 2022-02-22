import * as tg from "generic-type-guard";

export const isWokaPart = new tg.IsInterface()
	.withProperties({
		name: tg.isString,
		weight: tg.isNumber,
	})
	.withOptionalProperties({
		file: tg.isString,
	})
	.get();

export type WokaPart = tg.GuardedType<typeof isWokaPart>;

export type Layer = "body" | "eyes" | "hair" | "clothes" | "hat" | "accessory";

export function isLayer(layer: string): layer is Layer {
	return ["body", "eyes", "hair", "clothes", "hat", "accessory"].includes(layer);
}

export const isWokaParts = new tg.IsInterface()
	.withProperties({
		body: isWokaPart,
		eyes: isWokaPart,
		hair: isWokaPart,
		clothes: isWokaPart,
		hat: isWokaPart,
		accessory: isWokaPart,
	})
	.get();

export type WokaParts = tg.GuardedType<typeof isWokaParts>;

export const isWoka = new tg.IsInterface()
	.withProperties({
		edition: tg.isNumber,
		dna: tg.isString,
		parts: isWokaParts,
	})
	.get();

export type Woka = tg.GuardedType<typeof isWoka>;

export const isLoadedLayers = new tg.IsInterface()
	.withProperties({
		body: tg.isArray(isWokaPart),
		eyes: tg.isArray(isWokaPart),
		hair: tg.isArray(isWokaPart),
		clothes: tg.isArray(isWokaPart),
		hat: tg.isArray(isWokaPart),
		accessory: tg.isArray(isWokaPart),
	})
	.get();

export type LoadedLayers = tg.GuardedType<typeof isLoadedLayers>;

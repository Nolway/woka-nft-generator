import { LoadedLayers } from "../guards/WokaGuards";

export function maxCombination(layers: LoadedLayers) {
	let max = 0;

	for (const layer of Object.keys(layers)) {
		const assetCount = layers[layer].length;
		max = max === 0 ? assetCount : max * assetCount;
	}

	return max;
}

import { MetadataAttribute } from "../guards/MetadataGuards";
import { WokaLayers } from "../guards/WokaGuards";

export function generateAttributes(parts: WokaLayers): MetadataAttribute[] {
	const attributes: MetadataAttribute[] = [];

	for (const layer of Object.keys(parts)) {
		const part = parts[layer];

		attributes.push({
			trait_type: layer.toLowerCase().charAt(0).toUpperCase() + layer.slice(1),
			value: part.name,
		});
	}

	return attributes;
}

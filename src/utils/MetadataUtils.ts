import { MetadataAttribute } from "../guards/MetadataGuards";
import { isLayer, WokaParts } from "../guards/WokaGuards";

export function generateAttributes(parts: WokaParts): MetadataAttribute[] {
    const attributes: MetadataAttribute[] = [];

    for (const layer of Object.keys(parts)) {
        const part = parts[isLayer.parse(layer)];

        attributes.push({
            trait_type: layer.toLowerCase().charAt(0).toUpperCase() + layer.slice(1),
            value: part.name,
        });
    }

    return attributes;
}

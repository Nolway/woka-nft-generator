import { ConfigCollectionRarityLabel } from "../guards/ConfigGuards";
import { MetadataAttribute, WordBindingPart } from "../guards/MetadataGuards";
import { Woka, WokaLayers } from "../guards/WokaGuards";

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

export function getWordsByWoka(wordsBindingParts: WordBindingPart[], woka: Woka): string {
    let formattedString = "";

    for (const layer in woka.layers) {
        const binding = wordsBindingParts.find(
            (currentBinding) => currentBinding.layer === layer && currentBinding.part === woka.layers[layer].name
        );

        if (!binding) {
            continue;
        }

        formattedString += (formattedString === "" ? "" : " ") + binding.word;
    }

    return formattedString;
}

export function getRarestRarityLabel(woka: Woka, rarityLabels: ConfigCollectionRarityLabel[]): string {
    let lowerWeight: number | undefined;

    for (const layer of Object.values(woka.layers)) {
        if (!lowerWeight) {
            lowerWeight = layer.weight;
        } else if (lowerWeight > layer.weight) {
            lowerWeight = layer.weight;
        }
    }

    if (!lowerWeight) {
        return "";
    }

    const rarityLabel = rarityLabels.find((currentLabel) => currentLabel.weight === lowerWeight);

    return rarityLabel ? rarityLabel.label : "";
}

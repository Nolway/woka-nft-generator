import fs from "fs";
import { parse } from "csv-parse/sync";
import { wordsBindingPartsFilePath } from "../env";
import { Config, ConfigCollectionRarityLabel } from "../guards/ConfigGuards";
import { isWordBindingPart, MetadataAttribute, WordBindingPart } from "../guards/MetadataGuards";
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

export function getWordsByWoka(woka: Woka): string {
    let formattedString = "";

    for (const layer in woka.layers) {
        const binding = getAllWordsBindingParts().find(
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

let wordsVerifiedCache: WordBindingPart[] | undefined;

export const getAllWordsBindingParts = (): WordBindingPart[] => {
    if (wordsVerifiedCache) {
        return wordsVerifiedCache;
    }
    if (!fs.existsSync(wordsBindingPartsFilePath)) {
        return [];
    }

    const wordsCSV: unknown[] = parse(fs.readFileSync(wordsBindingPartsFilePath), {
        delimiter: ";",
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    const wordsVerified: WordBindingPart[] = [];

    for (let i = 0; i < wordsCSV.length; i++) {
        const isWordBinding = isWordBindingPart.safeParse(wordsCSV[i]);

        if (!isWordBinding.success) {
            console.error("Cannot read this line", wordsCSV[i], isWordBinding.error.issues);
            continue;
        }

        wordsVerified.push(isWordBinding.data);
    }

    wordsVerifiedCache = wordsVerified;
    return wordsVerified;
};

export async function getAccessorySide(name: string) {
    const part = getAllWordsBindingParts().find(
        (currentBinding) => currentBinding.layer === "ACCESSORY" && currentBinding.part === name
    );

    return part?.side ?? "front";
}

export function formatStringWithVariables(input: string, config: Config, woka: Woka): string {
    const wordsBinding = getWordsByWoka(woka);
    let formattedInput = input;

    const rarestRarityLabel = config.collection?.rarity?.labels
        ? getRarestRarityLabel(woka, config.collection.rarity.labels)
        : "";

    formattedInput = formattedInput.replace(/{edition}/g, woka.edition.toString());
    formattedInput = formattedInput.replace(/{binding}/g, wordsBinding);
    formattedInput = formattedInput.replace(/{rarity}/g, rarestRarityLabel);

    return formattedInput.trim();
}

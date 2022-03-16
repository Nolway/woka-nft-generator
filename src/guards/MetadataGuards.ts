import { z } from "zod";

export const isMetadataAttribute = z.object({
    trait_type: z.string(),
    value: z.string(),
});
export type MetadataAttribute = z.infer<typeof isMetadataAttribute>;

export const isEthereumMetadata = z.object({
    name: z.string(),
    description: z.string(),
    image: z.string(),
    dna: z.string(),
    edition: z.number(),
    attributes: z.array(isMetadataAttribute),
});
export type EthereumMetadata = z.infer<typeof isEthereumMetadata>;

export const isAvalancheMetadata = z.object({
    name: z.string(),
    description: z.string(),
    image: z.string(),
    dna: z.string(),
    edition: z.number(),
    attributes: z.array(isMetadataAttribute),
});
export type AvalancheMetadata = z.infer<typeof isAvalancheMetadata>;

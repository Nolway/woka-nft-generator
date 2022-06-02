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
    woka: z.string(),
    dna: z.string(),
    edition: z.number(),
    attributes: z.array(isMetadataAttribute),
});
export type EthereumMetadata = z.infer<typeof isEthereumMetadata>;

export const isMetadata = isEthereumMetadata;
export type Metadata = z.infer<typeof isMetadata>;

export const isWordBindingPart = z.object({
    layer: z.string(),
    part: z.string(),
    word: z.string(),
    side: z.string().optional(),
});
export type WordBindingPart = z.infer<typeof isWordBindingPart>;

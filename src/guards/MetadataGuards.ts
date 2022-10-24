import { z } from "zod";

export const MetadataAttribute = z.object({
    trait_type: z.string(),
    value: z.string(),
});
export type MetadataAttribute = z.infer<typeof MetadataAttribute>;

export const EthereumMetadata = z.object({
    name: z.string(),
    description: z.string(),
    image: z.string(),
    woka: z.string(),
    dna: z.string(),
    edition: z.number(),
    attributes: z.array(MetadataAttribute),
});
export type EthereumMetadata = z.infer<typeof EthereumMetadata>;

export const Metadata = EthereumMetadata;
export type Metadata = z.infer<typeof Metadata>;

export const WordBindingPart = z.object({
    layer: z.string(),
    part: z.string(),
    word: z.string(),
});
export type WordBindingPart = z.infer<typeof WordBindingPart>;

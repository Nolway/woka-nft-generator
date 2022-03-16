import { z } from "zod";

export const isConfigCollectionBackgroundColor = z.object({
    hex: z.string(),
    alpha: z.number().lte(0).gte(1),
});
export type ConfigCollectionBackgroundColor = z.infer<typeof isConfigCollectionBackgroundColor>;

export const isConfigCollectionBackground = z.object({
    method: z.enum(["image", "linked", "color", "none"]),
    color: isConfigCollectionBackgroundColor.optional(),
});
export type ConfigCollectionBackground = z.infer<typeof isConfigCollectionBackground>;

export const isConfigCollectionRarityEdges = z.object({
    min: z.number().positive(),
    max: z.number().positive(),
});
export type ConfigCollectionRarityEdges = z.infer<typeof isConfigCollectionRarityEdges>;

export const isConfigCollectionRarity = z.object({
    method: z.enum(["random", "delimiter", "none"]),
    edges: isConfigCollectionRarityEdges.optional(),
});
export type ConfigCollectionRarity = z.infer<typeof isConfigCollectionRarity>;

export const isConfigCollectionCropMarging = z.object({
    left: z.number().positive(),
    right: z.number().positive(),
    top: z.number().positive(),
    bottom: z.number().positive(),
});
export type ConfigCollectionCropMarging = z.infer<typeof isConfigCollectionCropMarging>;

export const isConfigCollectionCrop = z.object({
    size: z.number().positive(),
    marging: isConfigCollectionCropMarging.optional(),
});
export type ConfigCollectionCrop = z.infer<typeof isConfigCollectionCrop>;

export const isConfigCollection = z.object({
    size: z.number().positive(),
    crop: isConfigCollectionCrop.optional(),
    rarity: isConfigCollectionRarity.optional(),
    background: isConfigCollectionBackground.optional(),
});
export type ConfigCollection = z.infer<typeof isConfigCollection>;

export const isConfigBlockchainMetadataName = z.object({
    prefix: z.string().optional(),
    suffix: z.string().optional(),
});
export type ConfigBlockchainMetadataName = z.infer<typeof isConfigBlockchainMetadataName>;

export const isConfigBlockchainAvalancheMetadata = z.object({
    name: isConfigBlockchainMetadataName.optional(),
    description: z.string(),
    image: z.string(),
});
export type ConfigBlockchainAvalancheMetadata = z.infer<typeof isConfigBlockchainAvalancheMetadata>;

export const isConfigBlockchainAvalanche = z.object({
    type: z.enum(['avalanche']),
    metadata: isConfigBlockchainAvalancheMetadata,
});
export type ConfigBlockchainAvalanche = z.infer<typeof isConfigBlockchainAvalanche>;

export const isConfigBlockchainEthereumMetadata = z.object({
    name: isConfigBlockchainMetadataName.optional(),
    description: z.string(),
    image: z.string(),
});
export type ConfigBlockchainEthereumMetadata = z.infer<typeof isConfigBlockchainEthereumMetadata>;

export const isConfigBlockchainEthereum = z.object({
    type: z.enum(['ethereum']),
    metadata: isConfigBlockchainEthereumMetadata,
});
export type ConfigBlockchainEthereum = z.infer<typeof isConfigBlockchainEthereum>;

export const isConfigBlockchain = z.union([isConfigBlockchainEthereum, isConfigBlockchainAvalanche]);
export type ConfigBlockchain = z.infer<typeof isConfigBlockchain>;

export const isConfig = z.object({
    blockchain: isConfigBlockchain,
    collection: isConfigCollection,
});
export type Config = z.infer<typeof isConfig>;

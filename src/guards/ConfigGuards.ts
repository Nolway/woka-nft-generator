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

export const isConfigCollectionLayerConstraintLinkedTextures = z.object({
    on: z.string(),
    with: z.string(),
});
export type isConfigCollectionLayerConstraintLinkedTextures = z.infer<
    typeof isConfigCollectionLayerConstraintLinkedTextures
>;

export const isConfigCollectionLayerConstraintLinked = z.object({
    layer: z.string(),
    textures: z.array(isConfigCollectionLayerConstraintLinkedTextures),
});
export type isConfigCollectionLayerConstraintLinked = z.infer<typeof isConfigCollectionLayerConstraintLinked>;

export const isConfigCollectionLayerConstraints = z.object({
    linked: isConfigCollectionLayerConstraintLinked.optional(),
    with: z.array(z.string()).optional(),
    without: z.array(z.string()).optional(),
});
export type ConfigCollectionLayerConstraints = z.infer<typeof isConfigCollectionLayerConstraints>;

export const isConfigCollectionLayerSkip = z.object({
    allow: z.boolean(),
    value: z.string(),
    rarity: z.number().positive(),
});
export type ConfigCollectionLayerSkip = z.infer<typeof isConfigCollectionLayerSkip>;

export const isConfigCollectionLayer = z.object({
    name: z.string(),
    skip: isConfigCollectionLayerSkip.optional(),
    constraints: isConfigCollectionLayerConstraints.optional(),
});
export type ConfigCollectionLayer = z.infer<typeof isConfigCollectionLayer>;

export const isConfigCollection = z.object({
    size: z.number().positive(),
    layers: z.array(isConfigCollectionLayer),
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

export const isConfigBlockchainEthereumMetadata = z.object({
    name: isConfigBlockchainMetadataName.optional(),
    description: z.string(),
    image: z.string(),
});
export type ConfigBlockchainEthereumMetadata = z.infer<typeof isConfigBlockchainEthereumMetadata>;

export const isConfigBlockchainEthereumCompile = z.object({
    solidity: z.optional(
        z.object({
            version: z.union([z.string().regex(/^(\d+\.)?(\d+\.)?(\*|\d+)$/), z.literal("")]),
            compilers: z.optional(z.unknown()),
            settings: z.optional(z.unknown()),
        })
    ),
    contract: z.string().regex(/([A-Z][a-z0-9]+)((\d)|([A-Z0-9][a-z0-9]+))*([A-Z])?/),
    infos: z.object({
        name: z.string(),
        symbol: z.string(),
        metadata: z.string(),
        cost: z.number(),
        max: z.number().gte(0),
        initial: z.number().gte(0),
    }),
    accounts: z.union([
        z.string().array(),
        z.object({
            mnemonic: z.string(),
            path: z.string().optional(),
            initialIndex: z.number().optional(),
            count: z.number().optional(),
            passphrase: z.string().optional(),
        }),
    ]),
});
export type ConfigBlockchainEthereumCompile = z.infer<typeof isConfigBlockchainEthereumCompile>;

export const isConfigBlockchainEthereum = z.object({
    type: z.literal("ethereum"),
    network: z.enum(["bsc", "bsc_testnet", "avalanche", "avash", "fuji", "nahmii", "nahmii_testnet"]),
    metadata: isConfigBlockchainEthereumMetadata,
    compile: isConfigBlockchainEthereumCompile,
});
export type ConfigBlockchainEthereum = z.infer<typeof isConfigBlockchainEthereum>;

export const isConfigBlockchainEthereumUnknown = z.object({
    type: z.literal("ethereum"),
    network: z.string(),
    url: z.string(),
    metadata: isConfigBlockchainEthereumMetadata,
    compile: isConfigBlockchainEthereumCompile,
});
export type ConfigBlockchainEthereumUnknown = z.infer<typeof isConfigBlockchainEthereumUnknown>;

export const isConfigBlockchain = z.union([isConfigBlockchainEthereum, isConfigBlockchainEthereumUnknown]);
export type ConfigBlockchain = z.infer<typeof isConfigBlockchain>;

export const isConfigIpfsFolders = z.object({
    avatars: z.string(),
    metadata: z.string(),
});
export type ConfigIpfsFolders = z.infer<typeof isConfigIpfsFolders>;

export const isConfigIpfsMoralisAuth = z.object({
    key: z.string(),
});
export type ConfigIpfsMoralisAuth = z.infer<typeof isConfigIpfsMoralisAuth>;

export const isConfigIpfsMoralis = z.object({
    service: z.literal("moralis"),
    auth: isConfigIpfsMoralisAuth,
    folders: isConfigIpfsFolders,
});
export type ConfigIpfsMoralis = z.infer<typeof isConfigIpfsMoralis>;

export const isConfigIpfsPinataAuth = z.object({
    key: z.string(),
    secret: z.string(),
});
export type ConfigIpfsPinataAuth = z.infer<typeof isConfigIpfsPinataAuth>;

export const isConfigIpfsPinata = z.object({
    service: z.literal("pinata"),
    auth: isConfigIpfsPinataAuth,
    folders: isConfigIpfsFolders,
});
export type ConfigIpfsPinata = z.infer<typeof isConfigIpfsPinata>;

export const isConfigIpfs = z.union([isConfigIpfsPinata, isConfigIpfsMoralis]);
export type ConfigIpfs = z.infer<typeof isConfigIpfs>;

export const isConfig = z.object({
    blockchain: isConfigBlockchain,
    ipfs: isConfigIpfs,
    collection: isConfigCollection,
});
export type Config = z.infer<typeof isConfig>;

import { z } from "zod";

export const isConfigCollectionBackgroundParametersCropPositionXY = z.object({
    left: z.number().gte(0),
    top: z.number().gte(0),
});
export type ConfigCollectionBackgroundParametersCropPositionXY = z.infer<
    typeof isConfigCollectionBackgroundParametersCropPositionXY
>;

export const isConfigCollectionBackgroundParametersCropPositionGravity = z.enum([
    "centre",
    "north",
    "east",
    "south",
    "west",
    "northeast",
    "southeast",
    "southwest",
    "northwest",
]);
export type ConfigCollectionBackgroundParametersCropPositionGravity = z.infer<
    typeof isConfigCollectionBackgroundParametersCropPositionGravity
>;

export const isConfigCollectionBackgroundParameters = z.object({
    crop: z.object({
        position: z.union([
            isConfigCollectionBackgroundParametersCropPositionGravity,
            isConfigCollectionBackgroundParametersCropPositionXY,
        ]),
    }),
    name: z
        .object({
            font: z.string().optional(),
            size: z.number(),
            color: z.string().optional(),
            position: isConfigCollectionBackgroundParametersCropPositionXY,
        })
        .optional(),
});
export type ConfigCollectionBackgroundParameters = z.infer<typeof isConfigCollectionBackgroundParameters>;

export const isConfigCollectionBackgroundParametersColor = z.object({
    hex: z.string(),
    alpha: z.number().gte(0),
});
export type ConfigCollectionBackgroundParametersColor = z.infer<typeof isConfigCollectionBackgroundParametersColor>;

export const isConfigCollectionMethodBackgroundColor = z.object({
    method: z.literal("color"),
    parameters: isConfigCollectionBackgroundParameters.merge(
        z.object({
            color: isConfigCollectionBackgroundParametersColor.optional(),
        })
    ),
});
export type ConfigCollectionMethodBackgroundColor = z.infer<typeof isConfigCollectionMethodBackgroundColor>;

export const isConfigCollectionMethodBackground = z.union([
    z.object({
        method: z.enum(["image", "linked", "rarity", "none"]),
        parameters: isConfigCollectionBackgroundParameters.optional(),
    }),
    isConfigCollectionMethodBackgroundColor,
]);
export type ConfigCollectionMethodBackground = z.infer<typeof isConfigCollectionMethodBackground>;

export const isConfigCollectionRarityEdges = z.object({
    min: z.number().positive(),
    max: z.number().positive(),
});
export type ConfigCollectionRarityEdges = z.infer<typeof isConfigCollectionRarityEdges>;

export const isConfigCollectionRarityLabel = z.object({
    weight: z.number(),
    label: z.string(),
});
export type ConfigCollectionRarityLabel = z.infer<typeof isConfigCollectionRarityLabel>;

export const isConfigCollectionRarity = z.object({
    method: z.enum(["random", "delimiter", "none"]),
    edges: isConfigCollectionRarityEdges.optional(),
    labels: isConfigCollectionRarityLabel.array().optional(),
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

export const isConfigCollectionLayerConstraintsWithWithout = z.object({
    with: z.record(z.string(), z.union([z.literal("*"), z.string().array()])).optional(),
    without: z.record(z.string(), z.union([z.literal("*"), z.string().array()])).optional(),
});

export const isConfigCollectionLayerConstraints = z
    .object({
        linked: isConfigCollectionLayerConstraintLinked.optional(),
        parts: z.record(z.string(), isConfigCollectionLayerConstraintsWithWithout).optional(),
    })
    .merge(isConfigCollectionLayerConstraintsWithWithout);
export type ConfigCollectionLayerConstraints = z.infer<typeof isConfigCollectionLayerConstraints>;

export const isConfigCollectionLayerSkip = z.object({
    allow: z.boolean(),
    value: z.string(),
    rarity: z.number().gte(0),
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
    background: isConfigCollectionMethodBackground.optional(),
});
export type ConfigCollection = z.infer<typeof isConfigCollection>;

export const isConfigBlockchainEthereumMetadata = z.object({
    name: z.string(),
    description: z.string(),
    image: z.string(),
    woka: z.string(),
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
    scripting: z
        .object({
            address: z.string(),
            scan: z
                .object({
                    key: z.string(),
                })
                .optional(),
        })
        .optional(),
});
export type ConfigBlockchainEthereum = z.infer<typeof isConfigBlockchainEthereum>;

export const isConfigBlockchainEthereumUnknown = isConfigBlockchainEthereum.extend({
    network: z.string(),
    url: z.string(),
});
export type ConfigBlockchainEthereumUnknown = z.infer<typeof isConfigBlockchainEthereumUnknown>;

export const isConfigBlockchain = z.union([isConfigBlockchainEthereum, isConfigBlockchainEthereumUnknown]);
export type ConfigBlockchain = z.infer<typeof isConfigBlockchain>;

export const isConfigIpfsFolders = z.object({
    wokas: z.string(),
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

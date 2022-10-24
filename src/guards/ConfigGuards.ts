import { z } from "zod";

export const ConfigCollectionBackgroundParametersCropPositionXY = z.object({
    left: z.number().gte(0),
    top: z.number().gte(0),
});
export type ConfigCollectionBackgroundParametersCropPositionXY = z.infer<
    typeof ConfigCollectionBackgroundParametersCropPositionXY
>;

export const ConfigCollectionBackgroundParametersCropPositionGravity = z.enum([
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
    typeof ConfigCollectionBackgroundParametersCropPositionGravity
>;

export const ConfigCollectionBackgroundParameters = z.object({
    crop: z.object({
        position: z.union([
            ConfigCollectionBackgroundParametersCropPositionGravity,
            ConfigCollectionBackgroundParametersCropPositionXY,
        ]),
    }),
});
export type ConfigCollectionBackgroundParameters = z.infer<typeof ConfigCollectionBackgroundParameters>;

export const ConfigCollectionBackgroundParametersColor = z.object({
    hex: z.string(),
    alpha: z.number().gte(0),
});
export type ConfigCollectionBackgroundParametersColor = z.infer<typeof ConfigCollectionBackgroundParametersColor>;

export const ConfigCollectionMethodBackgroundColor = z.object({
    method: z.literal("color"),
    parameters: ConfigCollectionBackgroundParameters.merge(
        z.object({
            color: ConfigCollectionBackgroundParametersColor.optional(),
        })
    ),
});
export type ConfigCollectionMethodBackgroundColor = z.infer<typeof ConfigCollectionMethodBackgroundColor>;

export const ConfigCollectionMethodBackground = z.union([
    z.object({
        method: z.enum(["image", "linked", "rarity", "none"]),
        parameters: ConfigCollectionBackgroundParameters.optional(),
    }),
    ConfigCollectionMethodBackgroundColor,
]);
export type ConfigCollectionMethodBackground = z.infer<typeof ConfigCollectionMethodBackground>;

export const ConfigCollectionRarityEdges = z.object({
    min: z.number().positive(),
    max: z.number().positive(),
});
export type ConfigCollectionRarityEdges = z.infer<typeof ConfigCollectionRarityEdges>;

export const ConfigCollectionRarityLabel = z.object({
    weight: z.number(),
    label: z.string(),
});
export type ConfigCollectionRarityLabel = z.infer<typeof ConfigCollectionRarityLabel>;

export const ConfigCollectionRarity = z.object({
    set: z.enum(["all", "collection-size"]),
    method: z.enum(["random", "delimiter", "none"]),
    edges: ConfigCollectionRarityEdges.optional(),
    labels: ConfigCollectionRarityLabel.array().optional(),
});
export type ConfigCollectionRarity = z.infer<typeof ConfigCollectionRarity>;

export const ConfigCollectionCropMarging = z.object({
    left: z.number().positive(),
    right: z.number().positive(),
    top: z.number().positive(),
    bottom: z.number().positive(),
});
export type ConfigCollectionCropMarging = z.infer<typeof ConfigCollectionCropMarging>;

export const ConfigCollectionCrop = z.object({
    size: z.number().positive(),
    marging: ConfigCollectionCropMarging.optional(),
});
export type ConfigCollectionCrop = z.infer<typeof ConfigCollectionCrop>;

export const ConfigCollectionLayerConstraintLinkedTextures = z.object({
    on: z.string(),
    with: z.string(),
});
export type ConfigCollectionLayerConstraintLinkedTextures = z.infer<
    typeof ConfigCollectionLayerConstraintLinkedTextures
>;

export const ConfigCollectionLayerConstraintLinked = z.object({
    layer: z.string(),
    textures: z.array(ConfigCollectionLayerConstraintLinkedTextures),
});
export type ConfigCollectionLayerConstraintLinked = z.infer<typeof ConfigCollectionLayerConstraintLinked>;

export const ConfigCollectionLayerConstraintsWithWithout = z.object({
    with: z.record(z.string(), z.union([z.literal("*"), z.string().array()])).optional(),
    without: z.record(z.string(), z.union([z.literal("*"), z.string().array()])).optional(),
});

export const ConfigCollectionLayerConstraints = z
    .object({
        linked: ConfigCollectionLayerConstraintLinked.optional(),
        parts: z.record(z.string(), ConfigCollectionLayerConstraintsWithWithout).optional(),
    })
    .merge(ConfigCollectionLayerConstraintsWithWithout);
export type ConfigCollectionLayerConstraints = z.infer<typeof ConfigCollectionLayerConstraints>;

export const ConfigCollectionLayerSkip = z.object({
    allow: z.boolean(),
    value: z.string(),
    rarity: z.number().gte(0),
});
export type ConfigCollectionLayerSkip = z.infer<typeof ConfigCollectionLayerSkip>;

export const ConfigCollectionLayer = z.object({
    name: z.string(),
    skip: ConfigCollectionLayerSkip.optional(),
    constraints: ConfigCollectionLayerConstraints.optional(),
});
export type ConfigCollectionLayer = z.infer<typeof ConfigCollectionLayer>;

export const ConfigCollection = z.object({
    size: z.number().positive(),
    layers: z.array(ConfigCollectionLayer),
    crop: ConfigCollectionCrop.optional(),
    rarity: ConfigCollectionRarity.optional(),
    background: ConfigCollectionMethodBackground.optional(),
});
export type ConfigCollection = z.infer<typeof ConfigCollection>;

export const ConfigBlockchainEthereumMetadata = z.object({
    name: z.string(),
    description: z.string(),
    image: z.string(),
    woka: z.string(),
});
export type ConfigBlockchainEthereumMetadata = z.infer<typeof ConfigBlockchainEthereumMetadata>;

export const ConfigBlockchainEthereumCompile = z.object({
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
export type ConfigBlockchainEthereumCompile = z.infer<typeof ConfigBlockchainEthereumCompile>;

export const ConfigBlockchainEthereum = z.object({
    type: z.literal("ethereum"),
    network: z.enum(["bsc", "bsc_testnet", "avalanche", "avash", "fuji"]),
    metadata: ConfigBlockchainEthereumMetadata,
    compile: ConfigBlockchainEthereumCompile,
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
export type ConfigBlockchainEthereum = z.infer<typeof ConfigBlockchainEthereum>;

export const ConfigBlockchainEthereumUnknown = ConfigBlockchainEthereum.extend({
    network: z.string(),
    url: z.string(),
});
export type ConfigBlockchainEthereumUnknown = z.infer<typeof ConfigBlockchainEthereumUnknown>;

export const ConfigBlockchain = z.union([ConfigBlockchainEthereum, ConfigBlockchainEthereumUnknown]);
export type ConfigBlockchain = z.infer<typeof ConfigBlockchain>;

export const ConfigIpfsFolders = z.object({
    wokas: z.string(),
    avatars: z.string(),
    metadata: z.string(),
});
export type ConfigIpfsFolders = z.infer<typeof ConfigIpfsFolders>;

export const ConfigIpfsMoralisAuth = z.object({
    key: z.string(),
});
export type ConfigIpfsMoralisAuth = z.infer<typeof ConfigIpfsMoralisAuth>;

export const ConfigIpfsMoralis = z.object({
    service: z.literal("moralis"),
    auth: ConfigIpfsMoralisAuth,
    folders: ConfigIpfsFolders,
});
export type ConfigIpfsMoralis = z.infer<typeof ConfigIpfsMoralis>;

export const ConfigIpfsPinataAuth = z.object({
    key: z.string(),
    secret: z.string(),
});
export type ConfigIpfsPinataAuth = z.infer<typeof ConfigIpfsPinataAuth>;

export const ConfigIpfsPinata = z.object({
    service: z.literal("pinata"),
    auth: ConfigIpfsPinataAuth,
    folders: ConfigIpfsFolders,
});
export type ConfigIpfsPinata = z.infer<typeof ConfigIpfsPinata>;

export const ConfigIpfs = z.union([ConfigIpfsPinata, ConfigIpfsMoralis]);
export type ConfigIpfs = z.infer<typeof ConfigIpfs>;

export const Config = z.object({
    blockchain: ConfigBlockchain,
    ipfs: ConfigIpfs,
    collection: ConfigCollection,
});
export type Config = z.infer<typeof Config>;

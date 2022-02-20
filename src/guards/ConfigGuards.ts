import * as tg from "generic-type-guard";

export const isConfigCollectionBackgroundColor = new tg.IsInterface()
    .withProperties({
        hex: tg.isString,
        alpha: tg.isFloat,
    })
    .get();

export type ConfigCollectionBackgroundColor = tg.GuardedType<typeof isConfigCollectionBackgroundColor>;

export const isConfigCollectionBackground = new tg.IsInterface()
    .withProperties({
        method: tg.isSingletonStringUnion("image", "linked", "color", "none"),
    })
    .withOptionalProperties({
        color: isConfigCollectionBackgroundColor,
    })
    .get();

export type ConfigCollectionBackground = tg.GuardedType<typeof isConfigCollectionBackground>;

export const isConfigCollectionRarityEdges = new tg.IsInterface()
    .withProperties({
        min: tg.isFiniteNumber,
        max: tg.isFiniteNumber,
    })
    .get();

export type ConfigCollectionRarityEdges = tg.GuardedType<typeof isConfigCollectionRarityEdges>;

export const isConfigCollectionRarity = new tg.IsInterface()
    .withProperties({
        method: tg.isSingletonStringUnion("random", "delimiter", "none"),
    })
    .withOptionalProperties({
        edges: isConfigCollectionRarityEdges,
    })
    .get();

export type ConfigCollectionRarity = tg.GuardedType<typeof isConfigCollectionRarity>;

export const isConfigCollectionCropMarging = new tg.IsInterface()
    .withOptionalProperties({
        left: tg.isFiniteNumber,
        right: tg.isFiniteNumber,
        top: tg.isFiniteNumber,
        bottom: tg.isFiniteNumber,
    })
    .get();

export type ConfigCollectionCropMarging = tg.GuardedType<typeof isConfigCollectionCropMarging>;

export const isConfigCollectionCrop = new tg.IsInterface()
    .withOptionalProperties({
        size: tg.isFiniteNumber,
        marging: isConfigCollectionCropMarging,
    })
    .get();

export type ConfigCollectionCrop = tg.GuardedType<typeof isConfigCollectionCrop>;

export const isConfigCollection = new tg.IsInterface()
    .withProperties({
        size: tg.isFiniteNumber,
        crop: isConfigCollectionCrop,
        rarity: isConfigCollectionRarity,
        background: isConfigCollectionBackground,
    })
    .get();

export type ConfigCollection = tg.GuardedType<typeof isConfigCollection>;

export const isConfigBlockchainMetadataName = new tg.IsInterface()
    .withOptionalProperties({
        prefix: tg.isString,
        suffix: tg.isString,
    })
    .get();

export type ConfigBlockchainMetadataName = tg.GuardedType<typeof isConfigBlockchainMetadataName>;

export const isConfigBlockchainAvalancheMetadata = new tg.IsInterface()
    .withProperties({
        name: isConfigBlockchainMetadataName,
        description: tg.isString,
        image: tg.isString,
    })
    .get();

export type ConfigBlockchainAvalancheMetadata = tg.GuardedType<typeof isConfigBlockchainAvalancheMetadata>;

export const isConfigBlockchainEthereumMetadata = new tg.IsInterface()
    .withProperties({
        name: isConfigBlockchainMetadataName,
        description: tg.isString,
        image: tg.isString,
    })
    .get();

export type ConfigBlockchainEthereumMetadata = tg.GuardedType<typeof isConfigBlockchainEthereumMetadata>;

export const isConfigBlockchain = new tg.IsInterface()
    .withProperties({
        type: tg.isSingletonStringUnion("ethereum", "avalanche"),
        metadata: tg.isUnion(isConfigBlockchainEthereumMetadata, isConfigBlockchainAvalancheMetadata),
    })
    .get();

export type ConfigBlockchain = tg.GuardedType<typeof isConfigBlockchain>;

export const isConfig = new tg.IsInterface()
    .withProperties({
        blockchain: isConfigBlockchain,
        collection: isConfigCollection,
    })
    .get();

export type Config = tg.GuardedType<typeof isConfig>;

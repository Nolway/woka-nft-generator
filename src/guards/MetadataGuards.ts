import * as tg from "generic-type-guard";

export const isMetadataAttribute = new tg.IsInterface()
    .withProperties({
        trait_type: tg.isString,
        value: tg.isString,
    })
    .get();

export type MetadataAttribute = tg.GuardedType<typeof isMetadataAttribute>;

export const isEthereumMetadata = new tg.IsInterface()
    .withProperties({
        name: tg.isString,
        description: tg.isString,
        image: tg.isString,
        dna: tg.isString,
        edition: tg.isNumber,
        attributes: tg.isArray(isMetadataAttribute),
    })
    .get();

export type EthereumMetadata = tg.GuardedType<typeof isEthereumMetadata>;

export const isAvalancheMetadata = new tg.IsInterface()
    .withProperties({
        name: tg.isString,
        description: tg.isString,
        image: tg.isString,
        dna: tg.isString,
        edition: tg.isNumber,
        attributes: tg.isArray(isMetadataAttribute),
    })
    .get();

export type AvalancheMetadata = tg.GuardedType<typeof isAvalancheMetadata>;

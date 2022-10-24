import { Config } from "./guards/ConfigGuards";

const config: Config = {
    blockchain: {
        type: "ethereum", // ethereum|solana
        network: "avalanche", // Preset network (bsc|bsc_testnet|avalanche|avash|fuji) or name for custom
        // Need for a unknown network or an external service.
        // If you want deploy to ropsten or ethereum mainnet, please use an Alchemy URL (https://docs.alchemy.com/alchemy/tutorials/hello-world-smart-contract#step-1-connect-to-the-ethereum-network)
        // url: "https://eth-mainnet.alchemyapi.io/v2/api_key"
        compile: {
            solidity: {
                // Optional: Hardhat Solidity config (https://hardhat.org/config/#solidity-configuration)
                version: "0.8.13",
            },
            contract: "ExampleContract", // Name of the contract to compile
            infos: {
                name: "Awesome Woka", // Name of the collection
                symbol: "AW", // Symbol of the collection
                metadata: "ipfs://mylink/", // Metadata base URL with a / at end
                cost: 0.1, // Mint cost of each NFT on eth
                max: 10, // Max NFT mint by mint
                initial: 2, // Count of NFT to mint on minting contract
            },
            accounts: [
                // Accounts used to compile, must be a private wallet key or advcanced authetication
                "account secret",
            ],
        },
        scripting: {
            // Optional: Need to use scripts using a existing deployed contract
            address: "contract address", // Contract address
            scan: {
                // Optional: Needs for scan verify on the blockchain explorer
                key: "api key", // API key from Etherscan
            },
        },
        metadata: {
            /* Ethereum */
            /**
             * Generate the NFT name with variables
             * edition: Edition number.
             * binding: Bind parts files from assets/words.csv (columns must be separated by ;) file to words.
             * rarity: Rarest part rarity label.
             */
            name: "My awesome Woka edition {edition} wow !",
            description: "Awesome Woka edition {edition}", // Description of your NFTs (variables can be used like in the name)
            image: "ipfs://mylink/", // Base URI to your avatar files
            woka: "ipfs://mylink/", // Base URI to your woka files
        },
    },
    ipfs: {
        service: "pinata", // pinata|moralis
        auth: {
            key: "YOUR API KEY",
            secret: "YOUR SECRET API KEY",
        },
        folders: {
            // Folders where the files will be uploads
            wokas: "wokas",
            avatars: "avatars",
            metadata: "metadata",
        },
    },
    collection: {
        size: 10, // Number of NFTs to be created
        layers: [
            // Layers used to generate the collection in order
            {
                name: "Body", // Attribute generated on metadata & folder name on assets/layers/
            },
            {
                name: "Eyes",
            },
            {
                name: "Hair",
                skip: {
                    // Optional: Define a none value (required if have constraint)
                    allow: true,
                    value: "None",
                    rarity: 50,
                },
            },
            {
                name: "Clothes",
            },
            {
                name: "Hat",
                skip: {
                    allow: true,
                    value: "None",
                    rarity: 10,
                },
                // constraints: {
                //     linked: {
                //         // Optional: Use the layer texture of an other layer by name
                //         layer: "Hair",
                //         textures: [
                //             {
                //                 on: "Redhead",
                //                 with: "Crown",
                //             },
                //         ],
                //     },
                //     with: {
                //         // Optional: Use the layer only if has all parts required
                //         Hair: "*",
                //     },
                //     without: {
                //         // Optional: Use the layer only if has all parts not required is none
                //         Accessory: ["Mage Stick"],
                //     },
                //     parts: {
                //         Tinfoil: {
                //             with: {
                //                 // Optional: Use the layer only if has all parts required
                //                 Hair: "*",
                //             },
                //             without: {
                //                 // Optional: Use the layer only if has all parts not required is none
                //                 Accessory: ["Mage Stick"],
                //             },
                //         },
                //     },
                // },
            },
            {
                name: "Accessory", // Attribute generated on metadata & folder name on assets/layers/
                skip: {
                    allow: true,
                    value: "None",
                    rarity: 500,
                },
            },
        ],
        crop: {
            size: 512, // Optional: Resize of Woka in pixels to stick it above background (must be smaller than the background)
            marging: {
                // Optional: Add a margin to the woka in pixel
                left: 64,
                right: 64,
                top: 64,
                bottom: 64,
            },
        },
        rarity: {
            /**
             * Give a rarity to a part.
             * A table will be displayed after the generation to known how rare a part is.
             */
            /**
             * all: affects the percentage of rarity on the combination set that can be generated.
             * collection-size: affects the percentage on the maximum value to generate.
             */
            set: "collection-size",
            /**
             * random: Allow random rarity to all parts.
             * delimiter: Allow a rarity by a # in the file name (example: my-body-is-ready#50.png),
             *  if a file doesn't have a delimiter, the rarity will be set to 100.
             * none: Don't give a rarity.
             */
            method: "delimiter",
            /* random */
            edges: {
                // Only on random & optional: Delimit the rarity
                min: 1, // Min rarity, cannot be under 1
                max: 100, // Max rarity
            },
            // Optional: Labels by weight
            labels: [
                {
                    weight: 10,
                    label: "Rare",
                },
                {
                    weight: 30,
                    label: "Uncommon",
                },
                {
                    weight: 50,
                    label: "Common",
                },
            ],
        },
        background: {
            /**
             * Optional: Method for adding a background (transparent by default)
             * none: Transparent background.
             * image: Get a random background from the backgrounds folder.
             * linked: Use the background with the same name in the backgrounds folder.
             * color: Use a color.
             * rarity: Use the background related to the rarest part (background names must match with the rarity weight).
             */
            method: "image",
            /*parameters: {
                crop: {
                    // Position of the crop on background (can be a position or points top/left)
                    position: "centre",
                },
                color: { // Only if is color method
                    hex: "#EACCFF",
                    alpha: 1,
                },
            },*/
        },
    },
};

export default config;

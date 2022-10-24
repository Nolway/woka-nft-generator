<h1>Woka NFT Generator 🧙‍♂️</h1>
<p>
  <a href="LICENSE.txt" target="_blank">
    <img alt="License: AGPL--3.0" src="https://img.shields.io/badge/License-AGPL--3.0-yellow.svg" />
  </a>
</p>

Easily generate your NFT collection from Wokas !

## Requirements

-   Node 18.11 <
-	Yarn 1.22 <

## Install

```sh
yarn install
cp src/config.dist.ts src/config.ts
```

## Demo

Use the command below, after which the **/build** folder will appear with all the assets and metadata needed to create an NFT collection.

```sh
yarn run generate-collection
```

## Usage

Delete all sample assets in the sub-directories of **/assets** folder and place your assets in the corresponding directories by layers.

Configure the **/src/config.ts** file as needs :

```ts
import { Config } from "./guards/ConfigGuards";

const config: Config = {
    blockchain: {
        type: "ethereum", // ethereum|ropsten|bsc|bsc_testnet|avalanche
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
                // Accounts used to compile
                "account secret",
            ],
        },
        metadata: {
            /* Ethereum */
            // Optional: Manage the NFT name
            name: {
                prefix: "My awesome Woka edition ", // Optional: NFT name prefix
                suffix: " wow !", // Optional: NFT name suffix
            },
            description: "Awesome Woka", // Description of your NFT
            image: "ipfs://mylink/", // Base URI to your avatar files
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
                constraints: {
                    /*linked: { // Optional: Use the layer texture of an other layer by name
                            layer: "Hair",
                            textures: [
                                {
                                    on: "Redhead",
                                    with: "Crown",
                                }
                            ],
                    },
                    with: [ // Optional: Use the layer only if has all parts required
                        "Hair"
                    ],
                    without: [ // Optional: Use the layer only if has all parts not required is none
                        "Hair"
                    ],*/
                },
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
             *
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
        },
        background: {
            /**
             * Optional: Method for adding a background (transparent by default)
             * none: Transparent background.
             * image: Get a random background from the backgrounds folder.
             * linked: Use the background with the same name in the backgrounds folder.
             * color: Use a color.
             */
            method: "image",
            /*color: {
                hex: "#EACCFF",
                alpha: 1,
            },*/
        },
    },
};

export default config;
```

Generate your collection with the next command :

```sh
yarn run generate-collection
```

All files needed for an NFT collection are generated in the **/build** folder.


After that you can upload all avatars and metadata on a IPFS node with :

```sh
yarn run ipfs-upload
```

Don't forget to copy/paste the hash URL to your configuration on **blockchain.compile.infos.metadata** key !

Now you can generate your contract from the template on the **assets/contracts** folder :

```sh
yarn run generate-contract
```

You need to build the configuration of Hardhat to deploy your contract :

```sh
yarn run generate-hardhat-config
```

Finnaly, you can deploy your contract :

```sh
yarn run deploy-contract
```

If you want to delete all the generated assets, you can do this:

```sh
yarn run reset
```

## Author

👤 **Nolway (Alexis Faizeau)**

-   Website: [alexis-faizeau.com](https://www.alexis-faizeau.com)
-   Github: [@Nolway](https://github.com/Nolway)
-   LinkedIn: [@alexis-faizeau](https://linkedin.com/in/alexis-faizeau)

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2022 [Nolway(Alexis Faizeau)](https://github.com/Nolway).<br />
This project is [AGPL--3.0](LICENSE.txt) licensed.

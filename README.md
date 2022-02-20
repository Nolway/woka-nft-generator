<h1>Woka NFT Generator 🧙‍♂️</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="LICENSE.txt" target="_blank">
    <img alt="License: AGPL--3.0" src="https://img.shields.io/badge/License-AGPL--3.0-yellow.svg" />
  </a>
</p>

Easily generate your NFT collection from Wokas !

## Requirements

-   Node 16.14 <

## Install

```sh
yarn install
cp src/config.dist.ts src/config.ts
```

## Demo

Use the command below, after which the **/build** folder will appear with all the assets and metadata needed to create an NFT collection.

```sh
yarn run generate
```

## Usage

Delete all sample assets in the sub-directories of **/assets** folder and place your assets in the corresponding directories by layers.

Configure the **/src/config.ts** file as needs :

```ts
import { Config } from "./guards/ConfigGuards";

const config: Config = {
    blockchain: {
        type: "ethereum", // ethereum|solana
        metadata: {
            /* Ethereum */
            // Optional: Manage the NFT name
            name: {
                prefix: "My awesome Woka edition ", // Optional: NFT name prefix
                suffix: " wow !", // Optional: NFT name suffix
            },
            description: "Awesome Woka", // Description of your NFT
            image: "ipfs://mylink/", // Base URI to your avatar files
            /* Avalanche */
            /*
            name: {
                prefix: "My awesome Woka edition ",
                suffix: " wow !",
            },
            description: "Awesome Woka",
            image: "ipfs://mylink/",
            */
        },
    },
    collection: {
        size: 10, // Number of NFTs to be created
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
yarn run generate
```

All files needed for an NFT collection are generated in the **/build** folder.

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

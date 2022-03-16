import { Config } from "./guards/ConfigGuards";

const config: Config = {
	blockchain: {
		type: "ethereum", // ethereum|avalanche
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

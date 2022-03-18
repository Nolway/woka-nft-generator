import sharp from "sharp";
import fs from "fs";
import { avatarsDirPath, backgroundDirPath } from "../../env";
import { ConfigCollection } from "../../guards/ConfigGuards";
import { Woka } from "../../guards/WokaGuards";

sharp.cache(false);

export class AvatarGenerator {
	constructor(private config: ConfigCollection) {}

	public async generate(woka: Woka, backgrounds: Buffer[]): Promise<void> {
		if (!woka.crop) {
			throw new Error(`Undefined crop on woka edition ${woka.edition}`);
		}

		if (this.config.background) {
			switch (this.config.background.method) {
			case "image": {
				if (backgrounds.length < 1) {
					throw new Error("You don't have any background in the assets folder");
				}

				woka.avatar = await sharp(backgrounds[Math.floor(Math.random() * (backgrounds.length - 1))])
					.composite([{ input: woka.crop, gravity: "centre" }])
					.toBuffer();
				break;
			}
			case "linked": {
				woka.avatar = await sharp(backgrounds[woka.edition - 1])
					.composite([{ input: woka.crop, gravity: "centre" }])
					.toBuffer();
				break;
			}
			case "color": {
				if (!this.config.background.color) {
					throw new Error("Undefined color property for \"color\" background method");
				}

				const background: sharp.Color = {
					r: undefined,
					g: undefined,
					b: undefined,
					alpha: undefined,
				};

				if (this.config.background.color.hex) {
					const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
						this.config.background.color.hex
					);
					if (result) {
						background.r = parseInt(result[1], 16);
						background.g = parseInt(result[2], 16);
						background.b = parseInt(result[3], 16);
					}
				}

				if (this.config.background.color.alpha) {
					background.alpha = this.config.background.color.alpha;
				}

				woka.avatar = await sharp(woka.crop).removeAlpha().flatten({ background }).toBuffer();
				break;
			}
			case "none": {
				woka.avatar = woka.crop;
				break;
			}
			}
		} else {
			woka.avatar = woka.crop;
		}
	}

	public async getLocalBackgrounds(): Promise<Buffer[]> {
		const loadedBackgrounds: Buffer[] = [];

		const backgroundFiles = await fs.promises.readdir(backgroundDirPath);

		for (const file of backgroundFiles) {
			const filePath = backgroundDirPath + file;

			if (fs.statSync(filePath).isDirectory()) {
				continue;
			}

			loadedBackgrounds.push(await sharp(filePath).toBuffer());
		}

		return loadedBackgrounds;
	}

	public static async exportLocal(woka: Woka): Promise<void> {
		if (!woka.avatar) {
			throw new Error(`Undefined avatar on woka edition ${woka.edition}`);
		}

		await sharp(woka.avatar).toFile(avatarsDirPath + woka.edition + ".png");
	}
}

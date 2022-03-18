import sharp from "sharp";
import { cropsDirPath } from "../../env";
import { ConfigCollectionCrop } from "../../guards/ConfigGuards";
import { Woka } from "../../guards/WokaGuards";

sharp.cache(false);

export class CropGenerator {
	constructor(private config: ConfigCollectionCrop | undefined) {}

	public async generate(woka: Woka): Promise<void> {
		if (!woka.tileset) {
			throw new Error(`Undefined tileset on woka edition ${woka.edition}`);
		}

		const sharpFile = sharp(woka.tileset).extract({
			left: 32,
			top: 0,
			width: 32,
			height: 32,
		});

		if (!this.config) {
			woka.crop = await sharpFile.toBuffer();
			return;
		}

		if (this.config.size) {
			sharpFile.resize(this.config.size, this.config.size, {
				kernel: sharp.kernel.nearest,
			});
		}

		if (this.config.marging) {
			sharpFile.extend({
				top: this.config.marging.top,
				bottom: this.config.marging.bottom,
				left: this.config.marging.left,
				right: this.config.marging.right,
				background: { r: 0, g: 0, b: 0, alpha: 0 },
			});
		}

		woka.crop = await sharpFile.toBuffer();
	}

	public static async exportLocal(woka: Woka): Promise<void> {
		if (!woka.crop) {
			throw new Error(`Undefined crop on woka edition ${woka.edition}`);
		}

		await sharp(woka.crop).toFile(cropsDirPath + woka.edition + ".png");
	}
}

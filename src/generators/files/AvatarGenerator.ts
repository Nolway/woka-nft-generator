import sharp from "sharp";
import fs from "fs";
import { avatarsDirPath, backgroundDirPath } from "../../env";
import {
    ConfigCollection,
    isConfigCollectionBackgroundParametersCropPositionGravity,
    isConfigCollectionBackgroundParametersCropPositionXY,
} from "../../guards/ConfigGuards";
import { Woka } from "../../guards/WokaGuards";
import { CropPosition } from "../../guards/AvatarGuard";
import path from "path";

sharp.cache(false);

export class AvatarGenerator {
    private readonly cropPosition: CropPosition;

    constructor(private config: ConfigCollection) {
        this.cropPosition = this.getCropPosition();
    }

    private getCropPosition(): CropPosition {
        if (!this.config?.background?.parameters?.crop?.position) {
            return {
                gravity: "centre",
            };
        }

        const configCropPosition = this.config.background.parameters.crop.position;

        const isCropPositionXY = isConfigCollectionBackgroundParametersCropPositionXY.safeParse(configCropPosition);
        const isCropPositionGravity =
            isConfigCollectionBackgroundParametersCropPositionGravity.safeParse(configCropPosition);

        if (isCropPositionXY.success) {
            return {
                ...isCropPositionXY.data,
            };
        }

        if (isCropPositionGravity.success) {
            return {
                gravity: isCropPositionGravity.data,
            };
        }

        throw new Error("Unknown crop position");
    }

    public async generate(woka: Woka, backgrounds: Map<string, Buffer>): Promise<void> {
        if (!woka.crop) {
            throw new Error(`Undefined crop on woka edition ${woka.edition}`);
        }

        if (this.config.background) {
            const cropOverlay = {
                input: woka.crop,
                ...this.cropPosition,
            };

            switch (this.config.background.method) {
                case "image": {
                    if (backgrounds.size < 1) {
                        throw new Error("You don't have any background in the assets folder");
                    }

                    woka.avatar = await sharp(
                        [...backgrounds.values()][Math.floor(Math.random() * (backgrounds.size - 1))]
                    )
                        .composite([cropOverlay])
                        .toBuffer();
                    break;
                }
                case "linked": {
                    woka.avatar = await sharp([...backgrounds.values()][woka.edition - 1])
                        .composite([cropOverlay])
                        .toBuffer();
                    break;
                }
                case "color": {
                    if (!this.config?.background?.parameters?.color) {
                        throw new Error("Undefined color property for \"color\" background method");
                    }

                    const background: sharp.Color = {
                        r: undefined,
                        g: undefined,
                        b: undefined,
                        alpha: undefined,
                    };

                    if (this.config.background.parameters.color.hex) {
                        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
                            this.config.background.parameters.color.hex
                        );
                        if (result) {
                            background.r = parseInt(result[1], 16);
                            background.g = parseInt(result[2], 16);
                            background.b = parseInt(result[3], 16);
                        }
                    }

                    if (this.config.background.parameters.color.alpha) {
                        background.alpha = this.config.background.parameters.color.alpha;
                    }

                    woka.avatar = await sharp(woka.crop).removeAlpha().flatten({ background }).toBuffer();
                    break;
                }
                case "rarity": {
                    let higherWeight = -1;
                    for (const layer of Object.values(woka.layers)) {
                        if (higherWeight < layer.weight) {
                            higherWeight = layer.weight;
                        }
                    }

                    const background = backgrounds.get(higherWeight.toString());

                    if (background) {
                        woka.avatar = await sharp(background).composite([cropOverlay]).toBuffer();
                    } else {
                        woka.avatar = woka.crop;
                    }

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

    public async getLocalBackgrounds(): Promise<Map<string, Buffer>> {
        const loadedBackgrounds: Map<string, Buffer> = new Map<string, Buffer>();

        const backgroundFiles = await fs.promises.readdir(backgroundDirPath);

        for (const file of backgroundFiles) {
            const filePath = backgroundDirPath + file;

            if (fs.statSync(filePath).isDirectory()) {
                continue;
            }

            loadedBackgrounds.set(path.parse(file).name, await sharp(filePath).toBuffer());
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

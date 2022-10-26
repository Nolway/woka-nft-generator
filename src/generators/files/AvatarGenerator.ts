import fs from "fs";
import { avatarsDirPath, backgroundDirPath } from "../../env";
import {
    ConfigCollection,
    ConfigCollectionBackgroundParametersCropPositionGravity,
    ConfigCollectionBackgroundParametersCropPositionXY,
} from "../../guards/ConfigGuards";
import { Woka } from "../../guards/WokaGuards";
import { CropPosition } from "../../guards/AvatarGuard";
import path from "path";
import sharp, { Sharp } from "sharp";
import sharpGif from "sharp-gif2";

sharp.cache(false);

export class AvatarGenerator {
    private readonly cropPosition: CropPosition;

    constructor(private config: ConfigCollection) {
        this.cropPosition = this.getCropPosition();
    }

    private getCropPosition(): CropPosition {
        if (!this.config.avatar.background?.parameters?.crop?.position) {
            return {
                gravity: "centre",
            };
        }

        const configCropPosition = this.config.avatar.background.parameters.crop.position;

        const isCropPositionXY = ConfigCollectionBackgroundParametersCropPositionXY.safeParse(configCropPosition);
        const isCropPositionGravity =
            ConfigCollectionBackgroundParametersCropPositionGravity.safeParse(configCropPosition);

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
        switch (this.config.avatar.type) {
            case "image":
                await this.generateImage(woka, backgrounds);
                break;
            case "gif":
                await this.generateGif(woka, backgrounds);
                break;
        }
    }

    private async generateImage(woka: Woka, backgrounds: Map<string, Buffer>) {
        if (!woka.crop) {
            throw new Error(`Undefined crop on woka edition ${woka.edition}`);
        }

        if (this.config.avatar.background) {
            const cropOverlay = {
                input: woka.crop,
                ...this.cropPosition,
            };

            switch (this.config.avatar.background.method) {
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
                    if (!this.config.avatar.background?.parameters?.color) {
                        throw new Error("Undefined color property for \"color\" background method");
                    }

                    const background: sharp.Color = {
                        r: undefined,
                        g: undefined,
                        b: undefined,
                        alpha: undefined,
                    };

                    if (this.config.avatar.background.parameters.color.hex) {
                        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
                            this.config.avatar.background.parameters.color.hex
                        );
                        if (result) {
                            background.r = parseInt(result[1], 16);
                            background.g = parseInt(result[2], 16);
                            background.b = parseInt(result[3], 16);
                        }
                    }

                    if (this.config.avatar.background.parameters.color.alpha) {
                        background.alpha = this.config.avatar.background.parameters.color.alpha;
                    }

                    woka.avatar = await sharp(woka.crop).removeAlpha().flatten({ background }).toBuffer();
                    break;
                }
                case "rarity": {
                    let lowerWeight: number | undefined;

                    for (const layer of Object.values(woka.layers)) {
                        if (!lowerWeight) {
                            lowerWeight = layer.weight;
                        } else if (lowerWeight > layer.weight) {
                            lowerWeight = layer.weight;
                        }
                    }

                    if (!lowerWeight) {
                        woka.avatar = woka.crop;
                        break;
                    }

                    const background = backgrounds.get(lowerWeight.toString());

                    woka.avatar = background
                        ? (woka.avatar = await sharp(background).composite([cropOverlay]).toBuffer())
                        : woka.crop;

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

    private async generateGif(woka: Woka, backgrounds: Map<string, Buffer>) {
        if (!woka.tileset) {
            throw new Error(`Undefined tileset on woka edition ${woka.edition}`);
        }

        if (this.config.avatar.type !== "gif") {
            throw new Error("Avatar type isn't gif");
        }

        const avatarSize = this.config.avatar.size;

        let widthCounter = 3;
        let heightCounter = 4;

        const resizedTileset = sharp(woka.tileset).resize(avatarSize * widthCounter, avatarSize * heightCounter, {
            kernel: sharp.kernel.nearest,
        });

        let background: Sharp | undefined;
        let backgroundColor: sharp.RGBA | undefined;

        if (this.config.avatar.background) {
            switch (this.config.avatar.background.method) {
                case "image": {
                    if (backgrounds.size < 1) {
                        throw new Error("You don't have any background in the assets folder");
                    }

                    background = sharp([...backgrounds.values()][Math.floor(Math.random() * (backgrounds.size - 1))]);
                    break;
                }
                case "linked": {
                    background = sharp([...backgrounds.values()][woka.edition - 1]);
                    break;
                }
                case "color": {
                    if (!this.config.avatar.background?.parameters?.color) {
                        throw new Error("Undefined color property for \"color\" background method");
                    }

                    const backgroundSharp: sharp.RGBA = {
                        r: undefined,
                        g: undefined,
                        b: undefined,
                        alpha: undefined,
                    };

                    if (this.config.avatar.background.parameters.color.hex) {
                        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
                            this.config.avatar.background.parameters.color.hex
                        );
                        if (result) {
                            backgroundSharp.r = parseInt(result[1], 16);
                            backgroundSharp.g = parseInt(result[2], 16);
                            backgroundSharp.b = parseInt(result[3], 16);
                        }
                    }

                    if (this.config.avatar.background.parameters.color.alpha) {
                        backgroundSharp.alpha = this.config.avatar.background.parameters.color.alpha;
                    }

                    backgroundColor = backgroundSharp;
                    break;
                }
                case "rarity": {
                    let lowerWeight: number | undefined;

                    for (const layer of Object.values(woka.layers)) {
                        if (!lowerWeight) {
                            lowerWeight = layer.weight;
                        } else if (lowerWeight > layer.weight) {
                            lowerWeight = layer.weight;
                        }
                    }

                    if (!lowerWeight) {
                        break;
                    }

                    const backgroundFounded = backgrounds.get(lowerWeight.toString());

                    if (backgroundFounded) {
                        background = sharp(backgroundFounded);
                    }
                    break;
                }
            }
        }

        const frames: Sharp[] = [];

        heightCounter--;

        while (heightCounter !== -1) {
            widthCounter--;

            let frame = resizedTileset.extract({
                left: widthCounter * avatarSize,
                top: heightCounter * avatarSize,
                width: avatarSize,
                height: avatarSize,
            });

            if (background) {
                frame = background.composite([{ input: await frame.toBuffer(), gravity: "centre" }]);
            } else if (backgroundColor) {
                frame.removeAlpha().flatten({ background: backgroundColor }).toBuffer();
            }

            frames.unshift(sharp(await frame.toBuffer()));

            if (widthCounter === 0) {
                heightCounter--;
                widthCounter = 3;
            }
        }

        woka.avatar = await sharpGif
            .createGif({
                delay: 200,
                transparent: Boolean(!background && !backgroundColor),
                format: "rgba4444",
                maxColors: background ? 256 : 512,
            })
            .addFrame(frames)
            .toBuffer();
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

    public async exportLocal(woka: Woka): Promise<void> {
        if (!woka.avatar) {
            throw new Error(`Undefined avatar on woka edition ${woka.edition}`);
        }

        await sharp(woka.avatar, { animated: this.config.avatar.type === "gif" }).toFile(
            avatarsDirPath + woka.edition + "." + (this.config.avatar.type === "image" ? "png" : "gif")
        );
    }
}

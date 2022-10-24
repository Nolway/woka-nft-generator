import { z } from "zod";
import { ConfigCollectionBackgroundParametersCropPositionGravity } from "./ConfigGuards";

export const CropPosition = z.union([
    z.object({
        left: z.number().gte(0),
        top: z.number().gte(0),
    }),
    z.object({
        gravity: ConfigCollectionBackgroundParametersCropPositionGravity,
    }),
]);
export type CropPosition = z.infer<typeof CropPosition>;

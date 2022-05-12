import { z } from "zod";
import { isConfigCollectionBackgroundParametersCropPositionGravity } from "./ConfigGuards";

export const isCropPosition = z.union([
    z.object({
        left: z.number().gte(0),
        top: z.number().gte(0),
    }),
    z.object({
        gravity: isConfigCollectionBackgroundParametersCropPositionGravity,
    }),
]);
export type CropPosition = z.infer<typeof isCropPosition>;

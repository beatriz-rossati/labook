import z from "zod"

export interface RatePostInputDTO {
    token: string,
    postId: string,
    like: boolean
}

export type RatePostOutputDTO = undefined

export const RatePostSchema = z.object({
    token: z.string().min(1),
    postId: z.string().min(1),
    like: z.boolean()
}).transform(data => data as RatePostInputDTO)
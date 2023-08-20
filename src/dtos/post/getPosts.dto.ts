import z from "zod"
import { PostResponse } from "../../models/Posts"

export interface GetPostsInputDTO {
    token: string
}

export type GetPostsOutputDTO = PostResponse[]

export const GetPostsSchema = z.object({
    token: z.string().min(1)
}).transform(data => data as GetPostsInputDTO)
import { PostDatabase } from "../database/PostDatabase";
import { CreatePostInputDTO, CreatePostOutputDTO } from "../dtos/post/createPost.dto";
import { DeletePostInputDTO, DeletePostOutputDTO } from "../dtos/post/deletePost.dto";
import { EditPostInputDTO, EditPostOutputDTO } from "../dtos/post/editPost.dto";
import { GetPostsInputDTO, GetPostsOutputDTO } from "../dtos/post/getPosts.dto";
import { RatePostInputDTO, RatePostOutputDTO } from "../dtos/post/likeDislikePost.dto";
import { ForbiddenError } from "../errors/ForbiddenError";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { RatingDB, POST_LIKES, Post } from "../models/Posts";
import { USER_ROLES } from "../models/User";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export class PostBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager
    ) { }

    createPost = async (input: CreatePostInputDTO): Promise<CreatePostOutputDTO> => {

        const { content, token } = input

        const payload = this.tokenManager.getPayload(token)
        if (!payload) {
            throw new UnauthorizedError()
        }

        const id = this.idGenerator.generate()

        const post = new Post(
            id,
            content,
            0,
            0,
            new Date().toISOString(),
            new Date().toISOString(),
            payload.id,
            payload.name
        )

        await this.postDatabase.insertPost(post.toPostDB())

        return "Post criado com sucesso!"
    }

    getPosts = async (input: GetPostsInputDTO): Promise<GetPostsOutputDTO> => {
        const { token } = input

        const payload = this.tokenManager.getPayload(token)
        if (!payload) {
            throw new UnauthorizedError()
        }

        const postsJoinUserDB = await this.postDatabase.getPosts()

        const posts = postsJoinUserDB.map((postJoinUser) => {
            const post = new Post(
                postJoinUser.id,
                postJoinUser.content,
                postJoinUser.likes,
                postJoinUser.dislikes,
                postJoinUser.created_at,
                postJoinUser.updated_at,
                postJoinUser.creator_id,
                postJoinUser.creator_name
            )
            return post.toPostResponse()
        })
        return posts;
    }

    editPost = async (input: EditPostInputDTO): Promise<EditPostOutputDTO> => {

        const { content, token, idToEdit } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {
            throw new UnauthorizedError()
        }

        const postDB = await this.postDatabase.findPostById(idToEdit)

        if (!postDB) {
            throw new NotFoundError("Não existe post com esse id")
        }
        if (payload.id !== postDB.creator_id) {
            throw new ForbiddenError("Você só pode editar seu próprio post.")
        }

        const post = new Post(
            postDB.id,
            postDB.content,
            postDB.likes,
            postDB.dislikes,
            postDB.created_at,
            postDB.updated_at,
            postDB.creator_id,
            payload.name
        )

        post.setContent(content)

        const updatedPostDB = post.toPostDB()
        await this.postDatabase.updatePost(updatedPostDB)

        return "Post editado."
    }

    deletePost = async (input: DeletePostInputDTO): Promise<DeletePostOutputDTO> => {

        const { token, idToDelete } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {
            throw new UnauthorizedError()
        }

        const postDB = await this.postDatabase.findPostById(idToDelete)

        if (!postDB) {
            throw new NotFoundError("Não existe post com esse id")
        }
        if (payload.role !== USER_ROLES.ADMIN) {
            if (payload.id !== postDB.creator_id) {
                throw new ForbiddenError("Só o autor do post ou um admin pode um post.")
            }
        }

        await this.postDatabase.deletePostById(idToDelete)

        return "Post deletado."
    }

    ratePost = async (input: RatePostInputDTO): Promise<RatePostOutputDTO> => {

        const { token, postId, like } = input

        const payload = this.tokenManager.getPayload(token)

        if (!payload) {
            throw new UnauthorizedError()
        }

        const postDBWithCreator =
            await this.postDatabase.findPostByIdJoinUser(postId)


        if (!postDBWithCreator) {
            throw new NotFoundError("Não existe post com esse Id")
        }

        const post = new Post(
            postDBWithCreator.id,
            postDBWithCreator.content,
            postDBWithCreator.likes,
            postDBWithCreator.dislikes,
            postDBWithCreator.created_at,
            postDBWithCreator.updated_at,
            postDBWithCreator.creator_id,
            postDBWithCreator.creator_name
        )

        const ratingDB: RatingDB = {
            user_id: payload.id,
            post_id: postId,
            like: like ? 1 : 0
        }

        const ratingExists = await this.postDatabase.findRating(ratingDB)

        if (!ratingExists){
            await this.postDatabase.insertRating(ratingDB)
            like ? post.addLike() : post.addDislike()
        } else {
            if (ratingExists === POST_LIKES.ALREADY_LIKED) {
                if (like) {
                    await this.postDatabase.removeRating(ratingDB)
                    post.removeLike()
                } else {
                    await this.postDatabase.updateRating(ratingDB)
                    post.removeLike()
                    post.addDislike()
                }
            } else if (ratingExists === POST_LIKES.ALREADY_DISLIKED) {
                if (like === false) {
                    await this.postDatabase.removeRating(ratingDB)
                    post.removeDislike()
                } else {
                    await this.postDatabase.updateRating(ratingDB)
                    post.removeDislike()
                    post.addLike()
                }
            }
        }

        await this.postDatabase.updatePost(post.toPostDB())

        return undefined
    }
}


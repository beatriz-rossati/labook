import { RatingDB, POST_LIKES, PostDB, PostDBJoin } from "../models/Posts";
import { BaseDatabase } from "./BaseDatabase";
import { UserDatabase } from "./UserDatabase";

export class PostDatabase extends BaseDatabase {

    static TABLE_POSTS = "posts"
    static TABLE_RATINGS = "likes_dislikes"

    insertPost = async (postDB: PostDB): Promise<void> => {
        await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .insert(postDB)
    }

    getPosts = async (): Promise<PostDBJoin[]> => {
        const result: PostDBJoin[] = await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .select(
                `${PostDatabase.TABLE_POSTS}.id`,
                `${PostDatabase.TABLE_POSTS}.creator_id`,
                `${PostDatabase.TABLE_POSTS}.content`,
                `${PostDatabase.TABLE_POSTS}.likes`,
                `${PostDatabase.TABLE_POSTS}.dislikes`,
                `${PostDatabase.TABLE_POSTS}.created_at`,
                `${PostDatabase.TABLE_POSTS}.updated_at`,
                `${UserDatabase.TABLE_USERS}.name as creator_name`
            )
            .join(
                `${UserDatabase.TABLE_USERS}`,
                `${PostDatabase.TABLE_POSTS}.creator_id`,
                "=",
                `${UserDatabase.TABLE_USERS}.id`
            )

        return result
    }

    findPostById = async (id: string): Promise<PostDB | undefined> => {
        const [result] = await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .select()
            .where({ id })

        return result as PostDB | undefined
    }

    updatePost = async (postDB: PostDB): Promise<void> => {
        await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .update(postDB)
            .where({ id: postDB.id })
    }

    deletePostById = async (id: string): Promise<void> => {
        await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .delete()
            .where({ id })
    }

    findPostByIdJoinUser = async (id: string): Promise<PostDBJoin | undefined> => {

        const [result]: Array<PostDBJoin | undefined> = await BaseDatabase
            .connection(PostDatabase.TABLE_POSTS)
            .select(
                `${PostDatabase.TABLE_POSTS}.id`,
                `${PostDatabase.TABLE_POSTS}.creator_id`,
                `${PostDatabase.TABLE_POSTS}.content`,
                `${PostDatabase.TABLE_POSTS}.likes`,
                `${PostDatabase.TABLE_POSTS}.dislikes`,
                `${PostDatabase.TABLE_POSTS}.created_at`,
                `${PostDatabase.TABLE_POSTS}.updated_at`,
                `${UserDatabase.TABLE_USERS}.name as creator_name`
            )
            .join(
                `${UserDatabase.TABLE_USERS}`,
                `${PostDatabase.TABLE_POSTS}.creator_id`,
                "=",
                `${UserDatabase.TABLE_USERS}.id`
            )
            .where({ [`${PostDatabase.TABLE_POSTS}.id`] : id })

        return result
    }

    findRating = async (ratingDB: RatingDB)
        : Promise<POST_LIKES | undefined> => {

        const [result]: Array<RatingDB | undefined> = await BaseDatabase
            .connection(PostDatabase.TABLE_RATINGS)
            .select()
            .where({
                user_id: ratingDB.user_id,
                post_id: ratingDB.post_id
            })

        if (result === undefined) {
            return undefined
        } else if (result.like === 1) {
            return POST_LIKES.ALREADY_LIKED
        } else {
            return POST_LIKES.ALREADY_DISLIKED
        }
    }

    removeRating = async (likeDislikeDB: RatingDB)
        : Promise<void> => {
        await BaseDatabase
            .connection(PostDatabase.TABLE_RATINGS)
            .delete()
            .where({
                user_id: likeDislikeDB.user_id,
                post_id: likeDislikeDB.post_id
            })
    }

    updateRating = async (likeDislikeDB: RatingDB): Promise<void> => {
        await BaseDatabase
            .connection(PostDatabase.TABLE_RATINGS)
            .update(likeDislikeDB)
            .where({
                user_id: likeDislikeDB.user_id,
                post_id: likeDislikeDB.post_id
            })
    }

    insertRating = async (likeDislikeDB: RatingDB): Promise<void> => {
        await BaseDatabase
            .connection(PostDatabase.TABLE_RATINGS)
            .insert(likeDislikeDB)
    }
}
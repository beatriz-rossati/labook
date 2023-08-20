export interface PostDB {
    id: string,
    creator_id: string,
    content: string,
    likes: number,
    dislikes: number,
    created_at: string,
    updated_at: string
}

export interface PostDBJoin {
    id: string,
    creator_id: string,
    content: string,
    likes: number,
    dislikes: number,
    created_at: string,
    updated_at: string
    creator_name: string
}

export interface PostResponse {
    id: string,
    content: string,
    likes: number,
    dislikes: number,
    createdAt: string,
    updatedAt: string
    creator: {
        id: string,
        name: string
    }
}

export interface RatingDB {
    user_id: string,
    post_id: string,
    like: number
}

export enum POST_LIKES {
    ALREADY_LIKED = "Already liked",
    ALREADY_DISLIKED = "Already disliked"
}

export class Post {
    constructor(
        private id: string,
        private content: string,
        private likes: number,
        private dislikes: number,
        private createdAt: string,
        private updatedAt: string,
        private creatorId: string,
        private creatorName: string
    ) { }

    getId(): string {
        return this.id
    }
    setId(value: string): void {
        this.id = value
    }

    getContent(): string {
        return this.content
    }
    setContent(value: string): void {
        this.content = value
    }

    getLikes(): number {
        return this.likes
    }
    setLikes(value: number): void {
        this.likes = value
    }
    addLike = (): void => {
        this.likes++
    }
    removeLike = (): void => {
        this.likes--
    }

    getDislikes(): number {
        return this.dislikes
    }
    setDislikes(value: number): void {
        this.dislikes = value
    }
    addDislike = (): void => {
        this.dislikes++
    }
    removeDislike = (): void => {
        this.dislikes--
    }

    getCreatedAt(): string {
        return this.createdAt
    }
    setCreatedAt(value: string): void {
        this.createdAt = value
    }

    getUpdatedAt(): string {
        return this.updatedAt
    }
    setUpdatedAt(value: string): void {
        this.updatedAt = value
    }

    getCreatorId(value: string) {
        return this.creatorId
    }
    setCreatorId(value: string): void {
        this.creatorId
    }

    getCreatorName(value: string) {
        return this.creatorName
    }
    setCreatorName(value: string): void {
        this.creatorName
    }

    toPostDB(): PostDB {
        return {
            id: this.id,
            creator_id: this.creatorId,
            content: this.content,
            likes: this.likes,
            dislikes: this.dislikes,
            created_at: this.createdAt,
            updated_at: this.updatedAt
        }
    }

    toPostResponse(): PostResponse {
        return {
            id: this.id,
            content: this.content,
            likes: this.likes,
            dislikes: this.dislikes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            creator: {
                id: this.creatorId,
                name: this.creatorName
            }
        }
    }
}
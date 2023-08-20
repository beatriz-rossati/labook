import { UserDB } from "../models/User";
import { BaseDatabase } from "./BaseDatabase";

export class UserDatabase extends BaseDatabase {
    static TABLE_USERS = "users"

    insertUser = async (userDB: UserDB): Promise<void> => {
        await BaseDatabase
            .connection(UserDatabase.TABLE_USERS)
            .insert(userDB)
    }

    findUserByEmail = async (email: string
    ): Promise<UserDB | undefined> => {
        const [userDB]: Array<UserDB | undefined> = await BaseDatabase
            .connection(UserDatabase.TABLE_USERS)
            .select()
            .where({ email })

        return userDB
    }
}
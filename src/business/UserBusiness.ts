import { UserDatabase } from "../database/UserDatabase";
import { LoginInputDTO, LoginOutputDTO } from "../dtos/user/login.dto";
import { SignupInputDTO, SignupOutputDTO } from "../dtos/user/signup.dto";
import { NotFoundError } from "../errors/NotFoundError";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { TokenPayload, USER_ROLES, User } from "../models/User";
import { HashManager } from "../services/HashManager";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export class UserBusiness {
    constructor(
        private userDatabase: UserDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager,
        private hashManager: HashManager
    ) { }

    signup = async (input: SignupInputDTO): Promise<SignupOutputDTO> => {
        const { name, email, password } = input
        const id = this.idGenerator.generate()

        const hashedPassword = await this.hashManager.hash(password)

        const user = new User(
            id,
            name,
            email,
            hashedPassword,
            USER_ROLES.NORMAL,
            new Date().toISOString()
        )

        await this.userDatabase.insertUser(user.toUserDB())

        const payload: TokenPayload = {
            id: user.getId(),
            name: user.getName(),
            role: user.getRole()
        }

        const output: SignupOutputDTO = {
            token: this.tokenManager.createToken(payload)
        }
        return output
    }

    login = async (input: LoginInputDTO): Promise<LoginOutputDTO> => {

        const { email, password } = input

        const userDB = await this.userDatabase.findUserByEmail(email)

        if (!userDB) {
            throw new NotFoundError("Esse e-mail não está cadastrado")
        }

        const user = new User(
            userDB.id,
            userDB.name,
            userDB.email,
            userDB.password,
            userDB.role,
            userDB.created_at
        )

        const checkPassword = await this.hashManager.compare(password, user.getPassword())

        if (!checkPassword) {
            throw new UnauthorizedError("Senha inválida")
        }

        const payload: TokenPayload = {
            id: user.getId(),
            name: user.getName(),
            role: user.getRole()
        }

        const output: LoginOutputDTO = {
            token: this.tokenManager.createToken(payload)
        }

        return output
    }
}
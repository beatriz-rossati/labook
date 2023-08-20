import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv'
import { userRouter } from './router/userRouter';
import { postRouter } from './router/postRouter';

dotenv.config()

const app = express();

app.use(cors());
app.use(express.json());

app.listen(Number(process.env.PORT || 3003), () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`)
});

app.use("/posts", postRouter)
app.use("/users", userRouter)

app.get('/healthcheck', (req: Request, res: Response) => {

    res.status(200).send("It's alive!")
});
import express from 'express'
import cors from 'cors'
import { corsConfig } from './config/cors'
import { connectToMongo } from './config/db'
import 'dotenv/config'
import router from './router'
connectToMongo();

const app = express();

app.use(cors(corsConfig));

app.use(express.json());

app.use('/', router)

export default app
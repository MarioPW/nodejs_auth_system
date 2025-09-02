import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './Auth/controller';

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRouter)

app.get('/', (req, res) => {
    res.send('Server Running');
});

export default app
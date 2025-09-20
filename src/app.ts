import express from 'express';
import cookieParser from 'cookie-parser';
import { authRouter } from './Auth/controller';
import { loggingMiddleware } from './middleware/loggingMiddleware';
import rateLimit from 'express-rate-limit';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(loggingMiddleware);
app.use('/auth', authRouter)


const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

app.get('/', (req, res) => {
    res.send('Server Running');
});

export default app
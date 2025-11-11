import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import songRouter from './src/routes/songRoute.js';
import { connect } from 'mongoose';
import connectDB from './src/config/mongodb.js';
import connectCloudinary from './src/config/cloudinary.js';
import albumRouter from './src/routes/albumRoute.js';
import userRouter from './src/routes/userRoute.js';
import artistRouter from './src/routes/artistRoute.js';
import playlistRouter from './src/routes/playlistRoute.js';
import moodRouter from './src/routes/moodRoute.js';
import genreRouter from './src/routes/genreRoute.js';
// Config app
const app = express();
const port = process.env.PORT || 4000;

// Connect DB & Cloudinary
connectDB();
connectCloudinary();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 👈 thêm dòng này

// Init routes

app.use("/api/song", songRouter);
app.use("/api/album", albumRouter);
app.use("/api/user", userRouter);
app.use("/api/artist", artistRouter);
app.use("/api/playlist", playlistRouter);
app.use("/api/mood", moodRouter);
app.use("/api/genre", genreRouter);
app.get('/', (req, res) => res.send("API working..."));

app.listen(port, () => console.log(`Server start on port ${port}`));
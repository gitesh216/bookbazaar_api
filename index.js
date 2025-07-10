import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';


dotenv.config();

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended:true}))  // For converting form data into Js objects for easy access
app.use(cookieParser()); 

app.use(
  cors({
    origin: process.env.BASE_URL,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ['Content-Type', "Authorization"]
  })
);

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res. send("Hello world");
})

app.listen(PORT, () => {
    console.log(`Server is 🏃‍♂️‍➡️running on http://localhost:${PORT}`);
});


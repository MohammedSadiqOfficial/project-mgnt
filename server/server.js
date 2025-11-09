import 'dotenv/config';
import express from 'express';
import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
const app = express();
app.use(express.json());
app.use(cors());
// Use Clerk middleware 
app.use(clerkMiddleware())


app.get('/', (req, res) => {
    res.send('Server is running');
});
app.use("/api/inngest", serve({ client: inngest, functions }));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

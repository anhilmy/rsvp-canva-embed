import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import mongoose from "mongoose";

import websiteRoutes from "./routes/websites";
import guestRoutes from "./routes/guests";
import rsvpRoutes from "./routes/rsvp";
import wishRoutes from "./routes/wishes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:8080",
        credentials: true,
    })
);
app.use(express.json());

// Routes
app.use("/api/websites", websiteRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/rsvp", rsvpRoutes);
app.use("/api/wishes", wishRoutes);

// Health check
app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
    try {
        const mongoUri =
            process.env.MONGODB_URI || "mongodb://localhost:27017/rsvp-wishes";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();

export default app;

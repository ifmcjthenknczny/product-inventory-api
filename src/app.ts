import cors from "cors";
import express, { Request, Response } from "express";
import morgan from "morgan";
import compression from "compression";
import productRoutes from "./routes/product.route";
import orderRoutes from "./routes/order.route";
import { dbConnect } from "./config/database.config";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());
app.use(morgan("dev"));
app.use(compression());

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.all("*", (req: Request, res: Response) => {
    res.status(404).json({ error: "Page not found." });
});

if (process.env.NODE_ENV !== "test") {
    app.listen(process.env.PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`Server listening on port http://localhost:${process.env.PORT}`);
    });

    dbConnect().catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Database connection failed:", err);
        process.exit(1);
    });
}

export default app;

import cors from "cors";
import express, {Request, Response} from "express";
import morgan from "morgan";
import compression from "compression";
import productRoutes from './routes/product.route'
import orderRoutes from './routes/order.route'
import { connectDB } from "./config/database.config";
import { errorHandler } from "./middleware/errorHandler";

// TODO: db connection
// TODO: linter and format

const app = express();
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());
app.use(morgan("dev"));
app.use(compression());
app.use(errorHandler)

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.all("*", (req: Request, res: Response) => {
	res.status(404).json({ success: false, message: "404 not found!" });
  });

export default app;

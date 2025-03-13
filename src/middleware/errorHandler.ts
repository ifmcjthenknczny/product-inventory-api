import { Request, Response } from "express";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (err: any, req: Request, res: Response) => {
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        error: err.message || "Internal Server Error",
    });
};

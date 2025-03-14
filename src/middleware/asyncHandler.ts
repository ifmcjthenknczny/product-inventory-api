import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = (handler: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await handler(req, res, next);
        } catch (e) {
            const { message, statusCode = 400 } = e as {
                message: string;
                statusCode: number;
            };
            res.status(statusCode).json({ error: message });
        }
    };
};

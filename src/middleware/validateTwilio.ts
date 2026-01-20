import { Request, Response, NextFunction } from "express";
import twilio from "twilio";

export function validateTwilio(
    req: Request,
    res: Response,
    next: NextFunction
): void | Response {

    if (process.env.NODE_ENV !== "production") {
        return next();
    }

    const signature = req.headers["x-twilio-signature"] as string | undefined;

    if (!signature) {
        return res.status(403).send("Missing Twilio signature");
    }

    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

    const isValid = twilio.validateRequest(
        process.env.TWILIO_AUTH_TOKEN!,
        signature,
        url,
        req.body
    );

    if (!isValid) {
        return res.status(403).send("Invalid Twilio signature");
    }

    next();
}

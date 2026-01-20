import { Request, Response, NextFunction } from "express";
import twilio from "twilio";

export function validateTwilio(
    req: Request,
    res: Response,
    next: NextFunction
): void | Response {
    // Optional: allow local dev without signature headaches
    if (process.env.NODE_ENV !== "production") return next();

    const signature = req.header("X-Twilio-Signature");
    if (!signature) return res.status(403).send("Missing Twilio signature");

    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken) return res.status(500).send("Missing TWILIO_AUTH_TOKEN");

    // IMPORTANT: build URL exactly like Twilio hit it
    const proto = req.header("x-forwarded-proto") ?? req.protocol;
    const host = req.header("host");
    const url = `${proto}://${host}${req.originalUrl}`;

    const isValid = twilio.validateRequest(authToken, signature, url, req.body);

    if (!isValid) return res.status(403).send("Invalid Twilio signature");

    next();
}

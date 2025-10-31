import type { Request } from "express";

export function getUserIP(req: Request) {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded?.split(",")[0];
    return ip || req.socket.remoteAddress || "127.0.0.1";
}
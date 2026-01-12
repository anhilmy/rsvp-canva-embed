import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      isAdmin?: boolean;
    }
  }
}

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  // Basic auth: "Basic base64(password)"
  // Or Bearer: "Bearer password"
  let password: string | undefined;

  if (authHeader.startsWith('Basic ')) {
    const base64 = authHeader.slice(6);
    password = Buffer.from(base64, 'base64').toString('utf-8');
  } else if (authHeader.startsWith('Bearer ')) {
    password = authHeader.slice(7);
  }

  if (!password || password !== config.adminPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.isAdmin = true;
  next();
}

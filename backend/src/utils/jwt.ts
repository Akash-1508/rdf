import jwt, { SignOptions } from "jsonwebtoken";

// JWT Secret - must be in .env file
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment variables. Please add it to .env file");
}

// JWT Expiry - must be in .env file
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
if (!JWT_EXPIRES_IN) {
  throw new Error("JWT_EXPIRES_IN is not set in environment variables. Please add it to .env file");
}

// Type assertion after validation
const JWT_SECRET_VALUE: string = JWT_SECRET;
const JWT_EXPIRES_IN_VALUE: string = JWT_EXPIRES_IN;

// Payload interface for JWT token
export interface JWTPayload {
  userId: string;
  email: string;
  mobile: string;
  name: string;
  role: number; // UserRoleCode
  iat?: number; // Issued at (auto added by jwt)
  exp?: number; // Expiry (auto added by jwt)
}

/**
 * Generate JWT token with user data
 */
export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET_VALUE, {
    expiresIn: JWT_EXPIRES_IN_VALUE,
  } as SignOptions);
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_VALUE) as unknown as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token");
    }
    throw new Error("Token verification failed");
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer " prefix
}


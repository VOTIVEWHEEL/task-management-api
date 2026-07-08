import { Request, Response } from 'express';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { createUser, findUserByEmail, verifyPassword } from '../services/user.service';
import { signAccessToken } from '../utils/jwt';
import { revokeToken } from '../services/token.service';
import { assertValidEmail, assertValidPassword } from '../utils/validate';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  assertValidEmail(email);
  assertValidPassword(password);

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await createUser(email, password);
  res.status(201).json({ user });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  assertValidEmail(email);
  if (typeof password !== 'string' || password.length === 0) {
    throw new ApiError(400, 'Password is required');
  }

  const user = await findUserByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const validPassword = await verifyPassword(user, password);
  if (!validPassword) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const { token, expiresAt } = signAccessToken(user.id);
  res.json({
    token,
    expiresAt,
    user: { id: user.id, email: user.email },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  // requireAuth has already validated the token and attached these
  const jti = req.tokenJti as string;

  // Revoke until the token's natural expiry so it can't be reused.
  // We don't have the exact exp here without re-decoding, so re-derive it
  // from the Authorization header for accuracy.
  const authHeader = req.headers.authorization as string;
  const token = authHeader.slice('Bearer '.length);
  const jwt = await import('jsonwebtoken');
  const decoded = jwt.decode(token) as { exp: number };
  const expiresAt = new Date(decoded.exp * 1000);

  await revokeToken(jti, expiresAt);
  res.json({ message: 'Logged out successfully' });
});

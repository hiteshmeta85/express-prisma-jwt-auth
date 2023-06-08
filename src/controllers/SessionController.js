import bcrypt from 'bcrypt';
import { db } from '../utils/db.js';
import { generateAccessToken, generateTokens } from '../utils/jwt.js';
import { findUserByEmail, findUserById } from '../services/UserServices.js';
import exclude from '../services/Misc.js';
import jwt from 'jsonwebtoken';

const SessionController = {
  loginWithEmailAndPassword: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          message: 'You must provide an email and a password.',
          data: null,
        });
      }

      const existingUser = await findUserByEmail(email);

      if (!existingUser) {
        return res.status(403).json({
          message: 'Invalid login credentials.',
          data: null,
        });
      }

      if (!existingUser.is_verified) {
        // todo: User is not verified, send verification email

        return res.status(401).json({
          message:
            'Email verification required. Please check your email for further instructions.',
          data: null,
        });
      }

      const validPassword = await bcrypt.compare(
        password,
        existingUser.password
      );

      if (!validPassword) {
        return res.status(403).json({
          message: 'Invalid login credentials.',
          data: null,
        });
      }

      const { accessToken, refreshToken } = generateTokens(existingUser);

      const existingUserWithoutPassword = exclude(existingUser, ['password']);

      return res.status(200).json({
        message: 'Authenticated.',
        data: {
          user: existingUserWithoutPassword,
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal server error.',
        data: null,
      });
    }
  },

  loginWithEmailAndOTP: async (req, res) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          message: 'You must provide an email and an OTP.',
          data: null,
        });
      }

      const existingUser = await findUserByEmail(email);

      if (!existingUser) {
        return res.status(403).json({
          message: 'Invalid login credentials.',
          data: null,
        });
      }

      if (!existingUser.is_verified) {
        // todo: User is not verified, send verification email

        return res.status(401).json({
          message:
            'Email verification required. Please check your email for further instructions.',
          data: null,
        });
      }

      const otpFromDb = await db.otp.findFirst({
        where: {
          userId: existingUser.id,
          type: 'login',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpFromDb) {
        return res.status(403).json({
          message: 'Invalid OTP.',
          data: null,
        });
      }

      if (otpFromDb.code !== otp) {
        return res.status(403).json({
          message: 'Invalid OTP.',
          data: null,
        });
      }

      if (otpFromDb.expiresAt < Date.now()) {
        db.otp.update({
          where: {
            id: otpFromDb.id,
          },
          data: {
            code: null,
          },
        });

        return res.status(403).json({
          message: 'OTP has expired.',
          data: null,
        });
      }

      await db.otp.update({
        where: {
          id: otpFromDb.id,
        },
        data: {
          code: null,
        },
      });

      const { accessToken, refreshToken } = generateTokens(existingUser);

      const existingUserWithoutPassword = exclude(existingUser, ['password']);

      res.status(200).json({
        message: 'Authenticated.',
        data: {
          user: existingUserWithoutPassword,
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal server error.',
        data: null,
      });
    }
  },

  generateOTP: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message: 'You must provide an email.',
          data: null,
        });
      }

      const existingUser = await findUserByEmail(email);

      if (!existingUser) {
        return res.status(403).json({
          message: 'Invalid login credentials.',
          data: null,
        });
      }

      if (!existingUser.is_verified) {
        // todo: User is not verified, send verification email

        return res.status(401).json({
          message:
            'Email verification required. Please check your email for further instructions.',
          data: null,
        });
      }

      const otpFromDb = await db.otp.findFirst({
        where: {
          userId: existingUser.id,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (otpFromDb && otpFromDb.expiresAt > Date.now()) {
        return res.status(403).json({
          message: 'OTP already generated. Wait for it to expire.',
          data: null,
        });
      }

      // todo: add otp client
      const otp = Math.floor(1000 + Math.random() * 9000).toString();

      await db.otp.create({
        data: {
          code: otp,
          userId: existingUser.id,
          expiresAt: new Date(Date.now() + 60 * 1000),
          type: 'login',
        },
      });

      return res.status(200).json({
        message: 'OTP generated.',
        data: {
          otp,
        },
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal server error.',
        data: null,
      });
    }
  },

  show: (req, res) => {
    res.status(200).json({
      message: 'Authenticated',
      errors: null,
    });
  },

  generateAccessToken: async (req, res) => {
    try {
      const refreshToken = req.body.refreshToken;

      if (!refreshToken) {
        return res.status(403).json({
          message: 'Invalid refresh token.',
          data: null,
        });
      }

      const userId = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET,
        (err, decoded) => {
          if (err) {
            return null;
          }

          return decoded.userId;
        }
      );

      if (userId === null) {
        return res.status(403).json({
          message: 'Invalid refresh token.',
          data: null,
        });
      }

      const user = await findUserById(userId);

      if (!user) {
        return res.status(403).json({
          message: 'Invalid refresh token.',
          data: null,
        });
      }

      const accessToken = generateAccessToken(user);

      return res.status(200).json({
        message: 'Access token generated.',
        data: {
          accessToken,
        },
      });
    } catch (err) {
      return res.status(500).json({
        message: 'Internal server error.',
        data: null,
      });
    }
  },
};

export default SessionController;

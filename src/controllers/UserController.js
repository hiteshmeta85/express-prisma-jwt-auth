import { db } from '../utils/db.js';
import bcrypt from 'bcrypt';
import { generateTokens } from '../utils/jwt.js';
import { findUserByEmail, findUserById } from '../services/UserServices.js';
import exclude from '../services/Misc.js';

const UserController = {
  create: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: 'You must provide an email and a password.',
          data: null,
        });
      }

      const existingUser = await findUserByEmail(email);

      if (existingUser) {
        return res.status(400).json({
          message: 'Email already in use.',
          data: null,
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await db.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      const userWithoutPassword = exclude(user, ['password']);

      const { accessToken, refreshToken } = generateTokens(userWithoutPassword);

      return res.status(201).json({
        message: 'User created.',
        data: {
          user: userWithoutPassword,
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

  show: async (req, res) => {
    try {
      const { userId } = req.payload;

      const user = await findUserById(userId);

      const userWithoutPassword = exclude(user, ['password']);

      return res.status(200).json({
        message: 'User found.',
        data: {
          user: userWithoutPassword,
        },
      });
    } catch (err) {
      res.status(500).json({
        message: 'Internal server error.',
        data: null,
      });
    }
  },
};

export default UserController;

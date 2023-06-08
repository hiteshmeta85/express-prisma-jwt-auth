import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import env from 'dotenv';
import isAuthenticated from './middleware/isAuthenticated.js';
import SessionController from './controllers/SessionController.js';
import UserController from './controllers/UserController.js';

env.config({
  path: './.env',
});

const app = express();
const router = express.Router();

const port = process.env.API_PORT || 4000;

const main = async () => {
  app.use(bodyParser.json());
  app.use(
    cors({
      origin: process.env.FRONTEND_SERVER,
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  router.get('/', (req, res) => {
    res.send('Hello World!');
  });

  router.get('/session', isAuthenticated, SessionController.show);
  router.post(
    '/session/login-with-email-and-password',
    SessionController.loginWithEmailAndPassword
  );
  router.post('/session/generate-otp', SessionController.generateOTP);
  router.post(
    '/session/generate-access-token',
    SessionController.generateAccessToken
  );
  router.post(
    '/session/login-with-email-and-otp',
    SessionController.loginWithEmailAndOTP
  );

  router.post('/user/create', UserController.create);
  router.get('/user/profile', isAuthenticated, UserController.show);

  app.use('/api', router);

  app.listen(port, () =>
    // eslint-disable-next-line no-console
    console.log(`App listening on port ${port}`)
  );
};

main();

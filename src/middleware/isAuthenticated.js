import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).send({
      data: null,
      message: 'UnAuthenticated',
    });
  }

  try {
    const accessToken = authorization.split(' ')[1];
    req.payload = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    return res.status(401).send({
      data: null,
      message: 'UnAuthenticated',
    });
  }

  return next();
};

import jwt from 'jsonwebtoken';

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  const userData = user.toPublicJSON ? user.toPublicJSON() : user;

  res.status(statusCode).json({
    success: true,
    token,
    user: userData,
  });
};

export default generateToken;

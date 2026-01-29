export const setResponseHeader = (req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.removeHeader("Vary");
  res.removeHeader("Access-Control-Allow-Credentials");

  next();
};

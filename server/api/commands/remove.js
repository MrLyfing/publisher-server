module.exports = (req, res, next) => {
  res.json({ test: res.locals.record })
}

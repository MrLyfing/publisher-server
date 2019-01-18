const { getRecords } = require('@server/dns')
const { responseJSON } = require('@server/utils')

module.exports = async (req, res, next) => {
  try {
    const records = await getRecords(record => record.type === 'A')
    responseJSON(res, 200, '', { records })
  } catch (err) {
    next(err)
  }
}

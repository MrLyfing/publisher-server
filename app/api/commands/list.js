const { getAllRecords } = require('@app/dns')
const { responseJSON } = require('@app/utils')

module.exports = async (req, res, next) => {
  try {
    const records = (await getAllRecords()).filter(
      // Filter out root domain name
      record => record.type === 'A' && record.name !== '@'
    )
    responseJSON(res, 200, '', { records })
  } catch (err) {
    next(err)
  }
}

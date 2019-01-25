const fs = require('fs')
const boom = require('boom')

const { responseJSON } = require('@/utils')
const { updateRecord } = require('@/dns')
const { NGINX } = require('@/config')

module.exports = async (req, res, next) => {
  const { A, records } = res.locals
  const { name } = req.body // new name

  if (!name) {
    next(boom.badData('Invalid data'))
  } else {
    const record = records.find(
      record => record.type === 'A' && record.name === name
    )
    if (record) {
      // Conflict name with an existing record.
      next(
        boom.conflict(
          `It seems that a record with the name ${name} already exists.`
        )
      )
    } else {
      try {
        await updateRecord(A.id, { name })
        fs.renameSync(
          `${NGINX.SUB_DOMAINS_FOLDER}/${A.name}`,
          `${NGINX.SUB_DOMAINS_FOLDER}/${name}`
        )
        console.log(
          `[API|UPDATE] - Rename folder to ${NGINX.SUB_DOMAINS_FOLDER}/${name}`
        )
        responseJSON(res, 200, `Subdomain ${A.name} was renamed to ${name}`)
      } catch (err) {
        next(err)
      }
    }
  }
}

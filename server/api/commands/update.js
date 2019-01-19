const fs = require('fs')
const boom = require('boom')

const { responseJSON } = require('@server/utils')
const { updateRecord } = require('@server/dns')
const { NGINX, ROOT_DOMAIN_NAME } = require('@server/config')

module.exports = async (req, res, next) => {
  const { A, CNAME, records } = res.locals
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
        await updateRecord(CNAME.id, {
          name: `www.${name}`,
          data: `${name}.${ROOT_DOMAIN_NAME}.`
        })
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

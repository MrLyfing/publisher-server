const { removeRecord } = require('@server/dns')
const { deleteFolder } = require('@common/utils')
const { NGINX } = require('@server/config')

const { responseJSON } = require('@server/utils')

module.exports = async (req, res, next) => {
  const { A } = res.locals

  try {
    await removeRecord(A.id)
    deleteFolder(`${NGINX.SUB_DOMAINS_FOLDER}/${A.name}`)
    console.log(
      `[API|REMOVE] - Remove folder ${NGINX.SUB_DOMAINS_FOLDER}/${A.name}`
    )
    responseJSON(res, 200, `Subdomain ${A.name} has been deleted`)
  } catch (err) {
    next(err)
  }
}

const { Router } = require('express')
const { responseJSON } = require('@server/utils')
const push = require('@server/api/push')
const update = require('@server/api/update')

const router = Router()

router.get('/', (_, res) => {
  responseJSON(res, 200, 'Welcome on the static-publisher API')
})

router.post('/push', push)
router.post('/update', update)

module.exports = router

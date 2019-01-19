const { Router } = require('express')
const boom = require('boom')

const { responseJSON } = require('@server/utils')
const { push, update, list, remove } = require('@server/api/commands')
const { lookupSubdomain } = require('@server/middlewares')
const { ACCESS_TOKEN } = require('@server/config')

const router = Router()

router.get('/', (req, res) => {
  responseJSON(res, 200, 'Welcome on the static-publisher API')
})

router.use((req, res, next) => {
  const token = req.headers['x-access-token']
  if (token) {
    if (token !== ACCESS_TOKEN) next(boom.unauthorized('Incorrect token'))
    else next()
  } else {
    next(boom.unauthorized('Missing token'))
  }
})

router.post('/push', push)
router.get('/list', list)
router.put('/update/:subdomain', lookupSubdomain, update)
router.delete('/remove/:subdomain', lookupSubdomain, remove)

module.exports = router

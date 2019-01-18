const { Router } = require('express')
const { responseJSON } = require('@server/utils')
const { push, update, list, remove } = require('@server/api/commands')

const router = Router()

router.get('/', (req, res) => {
  responseJSON(res, 200, 'Welcome on the static-publisher API')
})

router.post('/push', push)
router.get('/list', list)
router.put('/update/:subdomain', update)
router.delete('/delete/:subdomain', remove)

module.exports = router

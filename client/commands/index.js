const { VERSION, COMMANDS } = require('@client/constants')
const push = require('./push')
const list = require('./list')
const update = require('./update')
const remove = require('./remove')

/* All commands must use async */
module.exports = {
  [COMMANDS.HELP]: async () => {
    console.log('Help section')
  },
  [COMMANDS.VERSION]: async () => {
    console.log(`v${VERSION}`)
  },
  [COMMANDS.PUSH]: push,
  [COMMANDS.LIST]: list,
  [COMMANDS.UPDATE]: update,
  [COMMANDS.REMOVE]: remove
}

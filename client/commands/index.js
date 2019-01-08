const { VERSION, COMMANDS } = require('@client/constants')
const push = require('./push')

/* All commands must use async */
module.exports = {
  [COMMANDS.HELP]: async () => {
    console.log('Help section')
  },
  [COMMANDS.VERSION]: async () => {
    console.log(`v${VERSION}`)
  },
  [COMMANDS.PUSH]: push
}

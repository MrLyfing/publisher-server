const { VERSION, COMMANDS } = require('@client/constants')

/* All commands must use async */
module.exports = {
  [COMMANDS.HELP]: async (args) => {
    console.log('Help section')
  },
  [COMMANDS.VERSION]: async (args) => {
    console.log(`v${VERSION}`)
  },
  [COMMANDS.PUSH]: require('./push')
}
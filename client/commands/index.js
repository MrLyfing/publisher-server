const { VERSION, COMMANDS } = require('@client/constants')
const push = require('./push')

/* All commands must use async */
module.exports = {
  [COMMANDS.HELP]: async args => {
    console.log('Help section')
  },
  [COMMANDS.VERSION]: async args => {
    console.log(`v${VERSION}`, args)
  },
  [COMMANDS.PUSH]: push
}

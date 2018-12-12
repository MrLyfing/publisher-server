const { VERSION, COMMANDS } = require('@client/constants')

module.exports = {
  [COMMANDS.HELP]: (args) => {
    console.log('Help section')
  },
  [COMMANDS.VERSION]: (args) => {
    console.log(`v${VERSION}`)
  },
  [COMMANDS.PUSH]: require('./push')
}
const { VERSION, COMMANDS } = require('./constants')

module.exports = {
  [COMMANDS.HELP]: () => {

  },
  [COMMANDS.VERSION]: () => {
    console.log(`v${VERSION}`)
  },
  [COMMANDS.PUSH]: () => {
  }
}
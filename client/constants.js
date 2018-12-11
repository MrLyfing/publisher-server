const COMMANDS = {
  HELP: 'help',
  VERSION: 'version',
  PUSH: 'push'
}

const VERSION = require('../package.json').version

module.exports = {
  VERSION,
  COMMANDS
}
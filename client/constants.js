const { version } = require('@root/package.json')

module.exports = {
  VERSION: version,
  COMMANDS: {
    HELP: 'help',
    VERSION: 'version',
    PUSH: 'push',
    LIST: 'list',
    UPDATE: 'update',
    REMOVE: 'remove'
  }
}

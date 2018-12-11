const { COMMANDS } = require('./constants')
const action = require('./commands')
const minimist = require('minimist')

const args = minimist(process.argv.slice(2))

let cmd = args._[0] || COMMANDS.HELP

if (args.v || args.version) {
  cmd = COMMANDS.VERSION
}
else if (args.h || args.help || !Object.values(COMMANDS).includes(cmd)) {
  cmd = COMMANDS.HELP
}

console.log(`running ${cmd} command`)
console.dir(args)
// Run commands
action[cmd](args)

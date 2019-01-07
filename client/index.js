#!/usr/bin/env node
require('module-alias/register')

const minimist = require('minimist')
const { COMMANDS } = require('./constants')
const action = require('./commands')

const args = minimist(process.argv.slice(2))

let cmd = args._[0] || COMMANDS.HELP

if (args.v || args.version) {
  cmd = COMMANDS.VERSION
} else if (args.h || args.help || !Object.values(COMMANDS).includes(cmd)) {
  // TODO: Implement generic error handler
  cmd = COMMANDS.HELP
}

console.log(`running ${cmd} command`)
console.dir(args)

action[cmd](args)
  .then(() => {
    console.log('success')
  })
  .catch(err => {
    // At top level code, .then/catch is to handle the final result or falling-through errors.
    console.log('fail')
    console.log(err)
    action[COMMANDS.HELP](args)
  })

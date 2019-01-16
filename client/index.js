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
  cmd = COMMANDS.HELP
}

console.log(`> Running ${cmd.toUpperCase()} command`)
console.log('> Command args', args)
console.log('\n')

action[cmd](args)
  .then(() => {
    console.log('success')
  })
  .catch(err => {
    // At top level code, .then/catch must be used to handle the final result or falling-through errors.
    console.error('catch', err)
    action[COMMANDS.HELP](args)
  })

#!/usr/bin/env babel-node

require('./helper')
let fs = require('fs').promise
let argv = require('yargs').argv

async function touch(filePath) {
  try {
    let fd = await fs.open(filePath, 'r+')
    fs.futimes(fd, new Date(), new Date)
  } catch (e) {
    process.stdout.write('There is no file like your file path!\n')
  }
}

touch(argv._[0])

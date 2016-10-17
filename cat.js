#!/usr/bin/env babel-node

require('./helper')
let fs = require('fs').promise
let argv = require('yargs').argv

async function cat(filePath) {
  if (filePath) {
    let fileData = await fs.readFile(filePath)
    process.stdout.write(fileData)
  }
}

cat(argv._[0])

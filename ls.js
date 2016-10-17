#!/usr/bin/env babel-node

require('./helper')
let fs = require('fs').promise
let path = require('path')
let {dir, R} = require('yargs')
  .default('dir', () => {
    return (process.argv[2] && (process.argv[2] !== '-R')) ? process.argv[2] : __dirname
  })
  .default('R', false)
  .argv

let Promise = require('songbird')

let filesList = []

async function ls(rootPath, isRecursive) {
  let fileNames = await fs.readdir(rootPath)

  return fileNames.map((fileName) => {
    let filePath = path.join(rootPath, fileName)

    return rdPromise(filePath).then((stats) => {
      if (isRecursive && stats.isDirectory()) {
        return Promise.all(ls(filePath, isRecursive))
      }
      if(!stats.isDirectory()) {
        return Promise.resolve(filePath)
      }
    })
  })
}

function rdPromise(file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) {
        return reject(err)
      }

      return resolve(stats)
    })
  })
}

function traverseArray(list) {
  list.forEach((item) => {
    if (item) {
      if (typeof item === 'string') {
        process.stdout.write(item + '\n')
      } else {
        traverseArray(item)
      }
    }
  })
}

function main() {
  rdPromise(dir).then((stats) => {
    if (stats.isDirectory()) {
      let filePromise = Promise.all(ls(dir, R)).then((filePaths) => {
        filesList = filesList.concat(filePaths)
      }).then(() => {
        traverseArray(filesList)
      })
    }
  }).catch((err) => {

  })
}

main()

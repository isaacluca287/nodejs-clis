#!/usr/bin/env babel-node

require('./helper')
let fs = require('fs').promise
let argv = require('yargs').argv
let Promise = require('songbird')

function mkdir(filePath) {
  if (filePath) {
    checkDirPromise(filePath).then((stats) => {
      process.stdout.write("mkdir: cannot create directory ‘" + filePath + "’: File exists\n")
    }).catch((err) => {
      let fileParents = filePath.split('/')
      let newFilePath = ''

      fileParents.map((file) => {

        checkDirPromise(newFilePath)
          .then((stats) => {})
          .catch((err) => {
            newFilePath += (file + '/')
            let createDirs = createDirPromise(newFilePath)
              .then((dirs) => {})
              .catch((err) => {})
          })
      })
    })
  } else {
    process.stdout.write('mkdir: missing operand\n')
  }
}

function checkDirPromise (file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) {
        return reject(err)
      }

      return resolve(stats)
    })
  })
}

function createDirPromise (file) {
  return new Promise((resolve, reject) => {
    fs.mkdir(file, (err, dirs) => {
      if (err) {
        return reject(err)
      }

      return resolve (dirs)
    })
  })
}

mkdir(argv._[0])

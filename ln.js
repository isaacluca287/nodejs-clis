#!/usr/bin/env babel-node

require('./helper')
let fs = require('fs').promise
let argv = require('yargs').argv

let Promise = require('songbird')

async function ln(target, path) {
  if (target && path) {
    checkDirPromise(target)
      .then((stats) => {
        if (stats.isDirectory()) {
          process.stdout.write("ln: ‘" + target + "’: hard link not allowed for directory\n")
        } else {
          let targetFilePath = target.split('/')

          checkSymlinkPromise(path)
            .then((stats) => {

              if (!stats.isDirectory()) {
                process.stdout.write("ln: failed to create hard link ‘" + path + "’: File exists\n")
              } else {
                path += '/' + targetFilePath[targetFilePath.length - 1]
                checkSymlinkPromise(path)
                  .then((stats) => {
                    process.stdout.write("ln: failed to create hard link ‘" + path + "’: File exists\n")
                  })
                  .catch((err) => {
                    symlinkPromise(target, path)
                      .then((symlinks) => {})
                      .catch((err) => {})
                  })
              }
            })
            .catch((err) => {
              symlinkPromise(target, path)
                .then((symlinks) => {})
                .catch((err) => {})
            })
        }
      })
      .catch((err) => {
        process.stdout.write("ln: failed to access ‘" + target + "’: No such file or directory\n")
      })
  } else {
    if (!target && !path) {
      process.stdout.write('ln: missing file operand\n')
    } else {
      process.stdout.write("ln: failed to create hard link ‘" + target + "’: File exists\n")
    }
  }
}

function symlinkPromise(target, path) {
  return new Promise((resolve, reject) => {
    fs.symlink(target, path, (err, symlinks) => {
      if (err) {
        return reject(err)
      }

      resolve(symlinks)
    })
  })
}

function checkDirPromise(dir) {
  return new Promise((resolve, reject) => {
    fs.stat(dir, (err, stats) => {
      if (err) {
        return reject(err)
      }

      return resolve(stats)
    })
  })
}

function checkSymlinkPromise(dir) {
  return new Promise((resolve, reject) => {
    fs.lstat(dir, (err, lstats) => {
      if (err) {
        return reject(err)
      }

      return resolve(lstats)
    })
  })
}

ln(argv._[0], argv._[1])

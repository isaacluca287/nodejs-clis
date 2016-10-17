#!/usr/bin/env babel-node

require('./helper')
let fs = require('fs').promise
let argv = require('yargs').argv
let path = require('path')
let Promise = require('songbird')

let filesList = []
let dirsList = []

function rm(filePath) {
  if (filePath) {

    checkDirPromise(filePath)
      .then((stats) => {
        if (!stats.isDirectory()) {
          deleteFilePromise(filePath)
            .then((files) => {})
            .catch((err) => {
              console.log(err)
            })
        } else {
          
          let paths = []
          let filePathPromise = Promise.all(getAllFile(filePath)).then((filePaths) => {
            paths = filesList.concat(filePaths)
          }).then(() => {
            traverseArray(paths)
            dirsList.push(filePath)

            if (filesList.length === 0) {
              dirsList.map((dir) => {
                deleteDirPromise(dir)
                  .then((dirs) => {})
                  .catch((err) => {})
              })
            } else {
              filesList.map((file) => {
                deleteFilePromise(file)
                  .then((files) => {
                    dirsList.map((dir) => {
                      deleteDirPromise(dir)
                        .then((dirs) => {})
                        .catch((err) => {})
                    })
                  })
                  .catch((err) => {
                    console.log(err)
                  })
              })
            }
          })
        }
      })
      .catch((err) => {
        process.stdout.write("rm: cannot remove ‘" + filePath + "’: No such file or directory\n")
      })
  } else {
    process.stdout.write('rm: missing operand\n')
  }
}

async function getAllFile(rootPath) {
  let fileNames = await fs.readdir(rootPath)

  return fileNames.map((fileName) => {
    let filePath = path.join(rootPath, fileName)

    return checkDirPromise(filePath).then((stats) => {
      if(!stats.isDirectory()) {
        return Promise.resolve(filePath)
      }

      dirsList.unshift(filePath)
      return Promise.all(getAllFile(filePath))
    })
  })
}

function traverseArray(list) {
  list.forEach((item) => {
    if (item) {
      if (typeof item === 'string') {
        filesList.push(item)
      } else {
        traverseArray(item)
      }
    }
  })
}

function checkDirPromise(file) {
  return new Promise((resolve, reject) => {
    fs.lstat(file, (err, stats) => {
      if (err) {
        return reject(err)
      }

      return resolve(stats)
    })
  })
}

function deleteFilePromise(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err, files) => {
      if (err) {
        return reject(err)
      }

      return resolve(files)
    })
  })
}

function deleteDirPromise(dir) {
  return new Promise((resolve, reject) => {
    fs.rmdir(dir, (err, dirs) => {
      if (err) {
        return reject(err);
      }

      return resolve(dirs)
    })
  })
}

rm(argv._[0])

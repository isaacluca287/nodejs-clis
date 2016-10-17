#!/usr/bin/env babel-node

require('./helper')
let fs = require('fs').promise
let argv = require('yargs').argv
let path = require('path')

let Promise = require('songbird')

async function grep(containStr, filePath) {
  if (!containStr) {
    process.stdout.write("Usage: ./grep [OPTION]... PATTERN [FILE]...")
  } else {
    if (filePath) {
      try {
        let fileData = await fs.readFile(filePath, 'utf8')
        let lines = fileData.split('\n')

        lines = lines.filter((line) => {
          return line.includes(containStr)
        })

        lines.forEach((line) => {
          process.stdout.write(line + '\n')
        })
      } catch (err) {
        // File not exist
        let filesList = []

        let filePromise = Promise.all(getFileList('./')).then((files) => {
          filesList = filesList.concat(files)
        }).then(() => {
          let newRex = new RegExp(filePath)
          filesList = filesList.filter((file) => {
            return !(!file) && (newRex.test(file))
          })

          filesList.map((file) => {
            let promiseFiles = []
            Promise.all(rfPromise(file, containStr)).then((data) => {
              promiseFiles = promiseFiles.concat(data)
            }).then(() => {
              process.stdout.write(file + ':\n')

              promiseFiles.forEach((file) => {
                process.stdout.write('  ' + file + ':\n')
              })

              process.stdout.write('\n')
            })
          })
        })
      }
    }
  }
}

async function getFileList(rootPath) {
  let fileNames = await fs.readdir(rootPath)

  return fileNames.map((fileName) => {
    let filePath = path.join(rootPath, fileName)

    return rdPromise(filePath).then((stats) => {
      if(!stats.isDirectory()) {
        return Promise.resolve(filePath)
      }
    })
  })
}

function rdPromise(file) {
  return new Promise((resolve, reject) => {
    fs.lstat(file, (err, stats) => {
      if (err) {
        return reject(err)
      }

      return resolve(stats)
    })
  })
}

async function rfPromise(file, containStr) {
  let fileData = await fs.readFile(file, 'utf8')
  let lines = fileData.split('\n')

  lines = lines.filter((line) => {
    return line.includes(containStr)
  })
  return lines;
  // lines.forEach((line) => {
  //   process.stdout.write(line + '\n')
  // })
}

function main() {
  grep(argv._[0], argv._[1])
  // let filePromise = Promise.all(getFileList(__dirname)).then(console.log)
}

main()

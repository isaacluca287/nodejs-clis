#!/usr/bin/env node

require('./helper')

function echo() {
  if (process.argv[2]) {
    process.stdout.write(process.argv[2] + '\n')
  } else {
    process.stdout.write('\n')
  }
}

echo()

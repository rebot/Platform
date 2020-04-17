const fs = require('fs')
const path = require('path')
const { series, src, dest, symlink } = require('gulp')

const unzip = require('gulp-unzip')
const flatten = require('gulp-flatten')
const download = require('gulp-download')

/**
 * Clean function
 *
 * @param {*} cb
 */
async function clean () {
  console.log('Cleaning...')
}

/**
 * Setup the Sweco environment
 *
 * @param {*} cb
 */
async function setup () {
  // Clone the repository
  const tempDir = path.normalize(`${__dirname}/temp/`)
  download('https://github.com/teminl/sweco-digital-platforms/archive/master.zip').pipe(unzip()).pipe(dest(tempDir))
  // 
  //const swecoTemplate = path.normalize(`${__dirname}/temp/sweco-digital-platforms-master`)
  // Move .js files to the client, the React webapp
  //const jsDir = path.normalize('client/src/js/')
  //src(path.join(swecoTemplate, '**', '*.js')).pipe(flatten()).pipe(symlink(jsDir))
  // Move .css files to the client, the React webapp
  //const cssDir = path.normalize('client/src/css/')
  //src(path.join(swecoTemplate, '**', '*.css')).pipe(flatten()).pipe(symlink(cssDir))
}

exports.default = series(clean, setup)

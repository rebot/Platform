const { promisify } = require('util')
const { series, src, dest } = require('gulp')
const flatten = require('gulp-flatten')

const __exec = promisify(require('child_process').exec)

/**
 * Clean function
 *
 */
async function clean () {
  // Move the css files
  src('client/src/*.css')
    .pipe(flatten())
    .pipe(dest('client/src/css/'))
  // Move the js files
  src(['client/src/*.js', '!client/src/index.js'])
    .pipe(flatten())
    .pipe(dest('client/src/js/'))
}

/**
 * Execute a command
 *
 * @param {*} cmd
 * @param {string} [at='./']
 * @returns
 */
const exec = (cmd, at = './') => {
  // Run a command
  if (cmd === undefined) {
    return '`cmd` argument is required'
  }
  // Return a function to run the command
  const func = async function (cb) {
    const { err, stdout, stderr } = await __exec(`cd ${at} && ${cmd}`)
    console.log(stdout)
    return cb(err)
  }
  // Return the task
  func.displayName = `exec:${cmd.split(' ')[0]}`
  return func
}

/**
 * Yarn install package
 *
 * @param {*} pkg
 * @param {string} [at='./']
 * @returns
 */
const yarn = (pkg, at = './') => {
  // Install NPM package using yarn
  if (pkg === undefined) {
    return '`pkg` argument is required'
  }
  // Return a function to install the package
  const func = exec(`yarn add ${pkg}`, at)
  // Return function
  func.displayName = `install:${pkg}`
  return func
}

exports.default = series(
  exec('npx create-react-app client'),
  exec('yarn install', 'client'),
  yarn('bootstrap', 'client')
)

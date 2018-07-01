#!/usr/bin/env node

var ejs = require('ejs')
var fs = require('fs-extra');
var mkdirp = require('mkdirp')
var sysPath = require('path')
var program = require('commander')
var readline = require('readline')
var sortedObject = require('sorted-object')
var util = require('util')

var MODE_0666 = parseInt('0666', 8)
var MODE_0755 = parseInt('0755', 8)

var _exit = process.exit
var pkg = require('../package.json')

var version = pkg.version

// Re-assign process.exit because of commander
// TODO: Switch to a different command framework
process.exit = exit

// CLI

around(program, 'optionMissingArgument', function (fn, args) {
  program.outputHelp()
  fn.apply(this, args)
  return { args: [], unknown: [] }
})

before(program, 'outputHelp', function () {
  // track if help was shown for unknown option
  this._helpShown = true
})

before(program, 'unknownOption', function () {
  // allow unknown options if help was shown, to prevent trailing error
  this._allowUnknownOption = this._helpShown

  // show help if not yet shown
  if (!this._helpShown) {
    program.outputHelp()
  }
})

program
  .name('express')
  .version(version, '    --version')
  .usage('[options] [dir]')
  .option('-v, --view <engine>', 'add view <engine> support (ejs|dust|hbs|hjs|pug|twig|vash) (defaults to ejs)')
  .option('-c, --css <engine>', 'add stylesheet <engine> support (less|sass|scss|stylus) (defaults to plain css)')
  .option('    --git', 'add .gitignore')
  .option('-f, --force', 'force on non-empty directory')
  .parse(process.argv)

if (!exit.exited) {
  main()
}

/**
 * Install an around function; AOP.
 */

function around (obj, method, fn) {
  var old = obj[method]

  obj[method] = function () {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) args[i] = arguments[i]
    return fn.call(this, old, args)
  }
}

/**
 * Install a before function; AOP.
 */

function before (obj, method, fn) {
  var old = obj[method]

  obj[method] = function () {
    fn.call(this)
    old.apply(this, arguments)
  }
}

/**
 * Prompt for confirmation on STDOUT/STDIN
 */

function confirm (msg, callback) {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question(msg, function (input) {
    rl.close()
    callback(/^y|yes|ok|true$/i.test(input))
  })
}

/**
 * Copy file from template directory.
 */

function copyTemplate (from, to) {
  from = sysPath.join(__dirname, '..', 'templates', from)
  write(to, fs.readFileSync(from, 'utf-8'))
}

/**
 * Create application at the given directory `path`.
 *
 * @param {String} path
 */

function createApplication (name, path) {
  var wait = 5

  console.log()
  function complete () {
    if (--wait) return
    var prompt = launchedFromCmd() ? '>' : '$'

    console.log()
    console.log('   install dependencies:')
    console.log('     %s cd %s && npm install', prompt, path)
    console.log()
    console.log('   run the app:')

    if (launchedFromCmd()) {
      console.log('     %s SET DEBUG=%s:* & npm run dev', prompt, name)
    } else {
      console.log('     %s DEBUG=%s:* npm run dev', prompt, name)
    }

    console.log()
  }

  // JavaScript
  var app = loadTemplate('js/app.js')
  var www = loadTemplate('js/www')

  // App name
  www.locals.name = name

  // App modules
  app.locals.modules = Object.create(null)
  app.locals.uses = []

  mkdir(path, function () {

    copyTemplate( '/brunch/brunch-config.js', path + '/brunch-config.js' )

    mkdir(path + '/assets', function () {

      copyTemplate( '/brunch/initialize.js', path + '/assets/initialize.js' )

      mkdir(path + '/assets/public/images', function() {
        fs.copySync(sysPath.resolve(__dirname,'../express-express.svg'), path + '/assets/public/images/express-express.svg');
        fs.copySync(sysPath.resolve(__dirname,'../brunch.png'), path + '/assets/public/images/brunch.png');
      })

      switch (program.css) {
        case 'less':
          copyTemplate('css/style.less', path + '/assets/style.less')
          break
        case 'sass':
          copyTemplate('css/style.sass', path + '/assets/style.sass')
          break
        case 'scss':
          copyTemplate('css/style.scss', path + '/assets/style.scss')
          break
        case 'stylus':
          copyTemplate('css/style.styl', path + '/assets/style.styl')
          break
        default:
          copyTemplate('css/style.css', path + '/assets/style.css')
          break
      }
      complete()
    })

    mkdir(path + '/routes', function () {
      copyTemplate('js/routes/index.js', path + '/routes/index.js')
      copyTemplate('js/routes/users.js', path + '/routes/users.js')
      complete()
    })

    mkdir(path + '/views', function () {
      switch (program.view) {
        case 'dust':
          copyTemplate('dust/index.dust', path + '/views/index.dust')
          copyTemplate('dust/error.dust', path + '/views/error.dust')
          break
        case 'ejs':
          copyTemplate('ejs/index.ejs', path + '/views/index.ejs')
          copyTemplate('ejs/error.ejs', path + '/views/error.ejs')
          break
        case 'hjs':
          copyTemplate('hogan/index.hjs', path + '/views/index.hjs')
          copyTemplate('hogan/error.hjs', path + '/views/error.hjs')
          break
        case 'hbs':
          copyTemplate('hbs/index.hbs', path + '/views/index.hbs')
          copyTemplate('hbs/layout.hbs', path + '/views/layout.hbs')
          copyTemplate('hbs/error.hbs', path + '/views/error.hbs')
          break
        case 'pug':
          copyTemplate('pug/index.pug', path + '/views/index.pug')
          copyTemplate('pug/layout.pug', path + '/views/layout.pug')
          copyTemplate('pug/error.pug', path + '/views/error.pug')
          break
        case 'twig':
          copyTemplate('twig/index.twig', path + '/views/index.twig')
          copyTemplate('twig/layout.twig', path + '/views/layout.twig')
          copyTemplate('twig/error.twig', path + '/views/error.twig')
          break
        case 'vash':
          copyTemplate('vash/index.vash', path + '/views/index.vash')
          copyTemplate('vash/layout.vash', path + '/views/layout.vash')
          copyTemplate('vash/error.vash', path + '/views/error.vash')
          break
      }
      complete()
    })

    // CSS Engine support
    // switch (program.css) {
    //   case 'less':
    //     app.locals.modules.lessMiddleware = 'less-middleware'
    //     app.locals.uses.push("lessMiddleware(path.join(__dirname, 'public'))")
    //     break
    //   case 'stylus':
    //     app.locals.modules.stylus = 'stylus'
    //     app.locals.uses.push("stylus.middleware(path.join(__dirname, 'public'))")
    //     break
    //   case 'sass':
    //     app.locals.modules.sassMiddleware = 'node-sass-middleware'
    //     app.locals.uses.push("sassMiddleware({\n  src: path.join(__dirname, 'public'),\n  dest: path.join(__dirname, 'public'),\n  indentedSyntax: true, // true = .sass and false = .scss\n  sourceMap: true\n})")
    //     break
    // }

    // Template support
    switch (program.view) {
      case 'dust':
        app.locals.modules.adaro = 'adaro'
        app.locals.view = {
          engine: 'dust',
          render: 'adaro.dust()'
        }
        break
      default:
        app.locals.view = {
          engine: program.view
        }
        break
    }

    // package.json
    var pkg = {
      name: name,
      version: '0.0.0',
      private: true,
      scripts: {
        "start": "NODE_PATH=`pwd` node ./bin/www",                                                                                                    
        "dev":   "NODE_PATH=`pwd` LOGGY_STACKS=1 brunch watch",                                                                                       
        "build": "brunch build --production"                                                                                                          
      },
      dependencies: {
        'body-parser': '~1.18.2',
        'cookie-parser': '~1.4.3',
        'debug': '~2.6.9',
        'express': '^4.16.2',
        'morgan': '~1.9.0',
        'serve-favicon': '~2.4.5'
      },
      "devDependencies": {
        "auto-reload-brunch-express": "~0.1.4",
        "brunch": "^2",
        "clean-css-brunch": "^2",
        "uglify-js-brunch": "^2",
      }
    }

    switch (program.view) {
      case 'dust':
        pkg.dependencies.adaro = '~1.0.4'
        break
      case 'ejs':
        pkg.dependencies['ejs'] = '~2.5.7'
        break
      case 'hjs':
        pkg.dependencies['hjs'] = '~0.0.6'
        break
      case 'hbs':
        pkg.dependencies['hbs'] = '~4.0.1'
        break
      case 'pug':
        pkg.dependencies['pug'] = '2.0.0-beta11'
        break
      case 'twig':
        pkg.dependencies['twig'] = '~0.10.3'
        break
      case 'vash':
        pkg.dependencies['vash'] = '~0.12.2'
        break
    }

    // CSS Engine support
    switch (program.css) {
      case 'less':
        // "less-brunch": "^2.10.0",
        pkg.devDependencies['less-brunch'] = '^2.10.0'
        break
      case 'stylus':
        // "stylus-brunch": "^2.10.0",
        pkg.devDependencies['stylus-brunch'] = '^2.10.0'
        break
      case 'sass':
      case 'scss':
        // "sass-brunch": "^2.10.4",
        pkg.devDependencies['sass-brunch'] = '^2.10.4'
        break
    }

    // sort dependencies like npm(1)
    pkg.dependencies = sortedObject(pkg.dependencies)
    pkg.devDependencies = sortedObject(pkg.devDependencies)

    // write files
    write(path + '/package.json', JSON.stringify(pkg, null, 2) + '\n')
    write(path + '/app.js', app.render())
    mkdir(path + '/bin', function () {
      write(path + '/bin/www', www.render(), MODE_0755)
      complete()
    })

    if (program.git) {
      copyTemplate('js/gitignore', path + '/.gitignore')
    }

    complete()
  })
}

/**
 * Create an app name from a directory path, fitting npm naming requirements.
 *
 * @param {String} pathName
 */

function createAppName (pathName) {
  return sysPath.basename(pathName)
    .replace(/[^A-Za-z0-9.()!~*'-]+/g, '-')
    .replace(/^[-_.]+|-+$/g, '')
    .toLowerCase()
}

/**
 * Check if the given directory `path` is empty.
 *
 * @param {String} path
 * @param {Function} fn
 */

function emptyDirectory (path, fn) {
  fs.readdir(path, function (err, files) {
    if (err && err.code !== 'ENOENT') throw err
    fn(!files || !files.length)
  })
}

/**
 * Graceful exit for async STDIO
 */

function exit (code) {
  // flush output for Node.js Windows pipe bug
  // https://github.com/joyent/node/issues/6247 is just one bug example
  // https://github.com/visionmedia/mocha/issues/333 has a good discussion
  function done () {
    if (!(draining--)) _exit(code)
  }

  var draining = 0
  var streams = [process.stdout, process.stderr]

  exit.exited = true

  streams.forEach(function (stream) {
    // submit empty write request and wait for completion
    draining += 1
    stream.write('', done)
  })

  done()
}

/**
 * Determine if launched from cmd.exe
 */

function launchedFromCmd () {
  return process.platform === 'win32' &&
    process.env._ === undefined
}

/**
 * Load template file.
 */

function loadTemplate (name) {
  var contents = fs.readFileSync(sysPath.join(__dirname, '..', 'templates', (name + '.ejs')), 'utf-8')
  var locals = Object.create(null)

  function render () {
    return ejs.render(contents, locals)
  }

  return {
    locals: locals,
    render: render
  }
}

/**
 * Main program.
 */

function main () {
  // Path
  var destinationPath = program.args.shift() || '.'

  // App name
  var appName = createAppName(sysPath.resolve(destinationPath)) || 'hello-world'

  // Default view engine
  if (program.view === undefined) {
    program.view = 'ejs'
  }

  // Generate application
  emptyDirectory(destinationPath, function (empty) {
    if (empty || program.force) {
      createApplication(appName, destinationPath)
    } else {
      confirm('destination is not empty, continue? [y/N] ', function (ok) {
        if (ok) {
          process.stdin.destroy()
          createApplication(appName, destinationPath)
        } else {
          console.error('aborting')
          exit(1)
        }
      })
    }
  })
}

/**
 * Mkdir -p.
 *
 * @param {String} path
 * @param {Function} fn
 */

function mkdir (path, fn) {
  mkdirp(path, MODE_0755, function (err) {
    if (err) throw err
    console.log('   \x1b[36mcreate\x1b[0m : ' + path)
    fn && fn()
  })
}

/**
 * Generate a callback function for commander to warn about renamed option.
 *
 * @param {String} originalName
 * @param {String} newName
 */

function renamedOption (originalName, newName) {
  return function (val) {
    warning(util.format("option `%s' has been renamed to `%s'", originalName, newName))
    return val
  }
}

/**
 * Display a warning similar to how errors are displayed by commander.
 *
 * @param {String} message
 */

function warning (message) {
  console.error()
  message.split('\n').forEach(function (line) {
    console.error('  warning: %s', line)
  })
  console.error()
}

/**
 * echo str > path.
 *
 * @param {String} path
 * @param {String} str
 */

function write (path, str, mode) {
  fs.writeFileSync(path, str, { mode: mode || MODE_0666 })
  console.log('   \x1b[36mcreate\x1b[0m : ' + path)
}

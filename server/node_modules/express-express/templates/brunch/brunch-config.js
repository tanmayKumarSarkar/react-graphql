
// See http://brunch.io for documentation.
module.exports = {
  files: {
    javascripts: { joinTo: 'build.js' },
    stylesheets: { joinTo: 'build.css' }
  },
  paths: {
    watched: [ 'assets' ],
  },
  conventions: {
    assets: /assets\/public/ // these are copied to public unprocessed ( even nested dirs )
  },
  plugins: {
    autoReload: {
      forcewws: false, // this should not be neccessary, screwup on latest auto-reload-brunch
      app: {
        // if backend reloaded, tell browser to refresh, might be annoying if using forms
        reloadBrowser: true,
        path: './app.js',
        port: 3000,
        watch: [ 'config', 'lib', 'app.js', 'routes', 'views' ]
      }
    }
  },
  modules: {
    // nameCleaner: path => path.replace(/^assets\//, ''),
    autoRequire: {
      'build.js': [ 'assets/initialize.js' ],
    }
  }
}

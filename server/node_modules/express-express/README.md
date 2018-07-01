![express-express logo](./express-express.svg)

Barely worthwhile fork of [Express' application generator](https://github.com/expressjs/generator) with integrated brunch.io

## Reloadorama:
* hot swap of css
* browser reload when frontend javascript changes
* hot reloads backend express app ( no need for nodemon )
* optionally reloads browser when backend is hot reloaded ( default )

### What doesn't reload?
Doesn't do HMR of frontend javascript things yet.  I think this is a feature
that will be added to brunch.io eventually.  In other words, if you change a
javascript module that is loaded in the browser, it won't silently reload it,
it will reload the browser instead.  (Neither does React React App by default,
ironically).  I don't see this as much of a problem because I envision
express-express generating old school websites or backends for SPA's developed
separately.


## Generator options
```
$ express-express -h

  Usage: express [options] [dir]
  Options:
        --version        output the version number
    -v, --view <engine>  add view <engine> support (ejs|dust|hbs|hjs|pug|twig|vash) (defaults to ejs)
    -c, --css <engine>   add stylesheet <engine> support (less|sass|scss|stylus) (defaults to plain css)
        --git            add .gitignore
    -f, --force          force on non-empty directory
    -h, --help           output usage information
```

## Installation

```sh
npm install -g express-express
```

## Quick Start

```bash
express-express my-app
```

```bash
npm install
```

```bash
npm run dev
```


## Generated directory layout:

Mostly common express layout - unless noted:

```
my-app
├── app.js
├── assets
│   ├── initialize.js <-- anything in assets with a .js extension ends up in my-app/public/build.js
│   ├── mylibrary.js  <-- anything in assets with a .js extension ends up in my-app/public/build.js
│   ├── public <-- all files copied to my-app/public without processing, including directories
│   │   └── images
│   │       ├── brunch.png
│   │       └── express-express.svg
│   └── style.scss <-- ends up in my-app/public/build.css (css/sass/styl also supported but make sure brunch plugin installed)
│   └── style2.scss <-- ends up in my-app/public/build.css
├── bin
│   └── www
├── brunch-config.js <-- brunch and my-app dev settings
├── package-lock.json
├── package.json
├── public <-- completely generated from my-app/assets files and directories
│   ├── build.css
│   ├── build.css.map
│   ├── build.js
│   ├── build.js.map
│   └── images
│       ├── brunch.png
│       └── express-express.svg
├── routes
│   ├── index.js
│   └── users.js
└── views
    ├── error.ejs
    └── index.ejs
```

## Settings

You can find both brunch and _express-express_ configs in brunch-config.js.
_express-express_ configs are confined to plugins.autoRequire.app


## Completely Made Up FAQ

#### Why not just make a brunch.io skeleton and run _express-generator_ inside?

I wanted to, but couldn't figure out how to make it work with all the options provided by _express-generator_.

#### How awesome is that logo?

I know, right?

#### What happened to all the express css middleware?

That job was taken over by brunch.io, now _express-express_ only copies the
starter css file and includes the corresponding brunch plugin in package.json(
brunch.io works with minimal configuration, often just installing a plugin
works ).

#### Why doesn't it do X, Y, or Z?

Its a hack of _express-generator_, so it takes its lead from that.  Should it
do more? Post an issue.

#### Changes to bin/www don't do anything.

bin/www is not run in development, the _express-express_ brunch plugin
directly runs ./app.js, just like bin/www does.  For development you can find
configs normally set by bin/www (like port) in brunch-config.js

#### How do I run this in production.

First run "npm run build" and then run like any express app, with "npm start"
or run ./bin/www or whatever they do these days.


## License

[MIT](LICENSE)

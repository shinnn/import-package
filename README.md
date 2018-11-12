# import-package

[![npm version](https://img.shields.io/npm/v/import-package.svg)](https://www.npmjs.com/package/import-package)
[![Build Status](https://travis-ci.com/shinnn/import-package.svg?branch=master)](https://travis-ci.com/shinnn/import-package)
[![Coverage Status](https://img.shields.io/coveralls/shinnn/import-package.svg)](https://coveralls.io/github/shinnn/import-package?branch=master)

Import an [npm package](https://docs.npmjs.com/about-packages-and-modules#about-packages) from the disk

```javascript
const importPackage = require('import-package');

(async () => {
  const tar = importPackage('tar');
  //=> {create: [Function], update: [Function], extract: [Function], ...}
})();
```

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/getting-started/what-is-npm).

```
npm install import-package
```

## API

```javascript
const importPackage = require('import-package');
```

### importPackage(*id*)

*id*: `string` (a module ID)  
Return: `Promise<any>`

It imports a module with the given module ID from either of the following directories:

1. [`node_modules`](https://docs.npmjs.com/files/folders#node-modules) in the [current working directory](https://nodejs.org/api/process.html#process_process_cwd)
2. `node_modules` in the directory where [`npm` CLI](https://github.com/npm/cli) is installed

If the module ins't installed in CWD but included in the [npm CLI dependencies](https://github.com/npm/cli/tree/v6.4.1/node_modules), it imports the module from npm CLI directory.

```javascript
// $ npm ls npm-packlist
// > └── (empty)

(async () => {
  // However, npm CLI contins `npm-packlist` package.
  const npmPacklist = await importPackage('npm-packlist'); //=> {[Function: walk], sync: [Function: walkSync], ...}
})();
```

If the module is not included in the npm CLI dependencies but installed in CWD, it imports the module from CWD.

```javascript
// $ npm ls eslint
// > └── eslint@5.9.0

(async () => {
  // npm CLI doesn't contain `eslint` package.
  const eslint = await importPackage('eslint'); //=> {Linter: [Function: Linter], ...}
})();
```

If the module exists in both directories, it compares their [package versions](https://docs.npmjs.com/files/package.json#version) and imports the newer one.

```javascript
// $ npm ls tar
// > └── tar@0.1.0

(async () => {
  // Loaded from the npm CLI directory as the CWD version is older
  const tar = await importPackage('tar');
})();
```

The returned `Promise` will be fulfilled with the imported module, or rejected when it fails to find the module.

Each imported modules are stored in the internal cache and they will be loaded faster at the next time on.

### importPackage.preload(*id*)

*id*: `string` (a module ID)  
Return: `boolean` (whether the package is already imported or not)

Try to find the given package and store it to the internal cache when it exists.

This method is useful when a user knows which package will be needed and want it to be loaded faster when it's actually imported.

```javascript
const importPackage = require('import-package');

module.exports = function main() {
  const uuid = await importPackage('uuid');
  return uuid();
}

// The author know `uuid` package needs to be imported in the future.
importPackage.preload('uuid');
```

## License

[ISC License](./LICENSE) © 2018 Shinnosuke Watanabe

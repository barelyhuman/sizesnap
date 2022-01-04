# sizesnap

> Simple file size snapshot generator

## Install

```sh
npm i -D sizesnap
#
yarn add -D sizesnap
```

## Usage

Add the following in your `package.json`, `files` is an `[]` of file glob paths

```json
{
  "scripts": {
    "size": "sizesnap"
  },
  "sizesnap": {
    "files": ["./*.js", "./lib/*.js"]
  }
}
```

```sh
yarn size
# output
==> Reading Config
==> Sizing ./cli.js
==> Sizing ./lib/files.js
==> Sizing ./lib/zipped.js
Generated .sizesnap.json
```

## License

[MIT](/LICENSE)

# sizesnap

> Simple file size snapshot generator

- Tiny (15.3kB) , alternatives go up to 1MB
- Single File (thanks to [@vercel/ncc](https://github.com/@vercel/ncc))
- I don't have more points...

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

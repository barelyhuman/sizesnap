# sizesnap

> Simple file size snapshot generator

- Tiny (15.3kB, 5.45kB gzip, 4.94kB brotli) , alternatives go up to 1MB
- Single File (thanks to [@vercel/ncc](https://github.com/@vercel/ncc))
- I don't have more points...
- Pretty Printer

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
> yarn size
# output
==> Reading Config
==> Sizing dist/index.js
==> Sizing src/api.js
==> Sizing src/constants.js
==> Sizing src/index.js
==> Sizing src/lib/bytes.js
==> Sizing src/lib/files.js
==> Sizing src/lib/loggers.js
==> Sizing src/lib/zipped.js
-x- Generated .sizesnap.json
Generated .sizesnap.json

# or

> yarn size pretty

# output
filepath                size    gzip    brotli
-------------------     ------- ------  ------
dist/index.js           14.16KB 5.45KB  4.94KB
src/api.js              4.54KB  1.41KB  1.27KB
src/constants.js        80B     75B     73B
src/index.js            507B    305B    260B
src/lib/bytes.js        72B     79B     76B
src/lib/files.js        372B    223B    186B
src/lib/loggers.js      351B    212B    181B
src/lib/zipped.js       444B    207B    186B

```

## License

[MIT](/LICENSE)

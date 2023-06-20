# sizesnap

> Simple file size snapshot generator

- Tiny (15.3kB, 5.45kB gzip, 4.94kB brotli) , alternatives go up to 1MB
- Single File (thanks to [@vercel/ncc](https://github.com/@vercel/ncc))
- I don't have more points...
- Pretty Printer (+ CLI Table, Markdown Table)

## Web version

There's also a webversion, which serves the purpose of quickly checking a package's contents and their sizes. You can view it on [sizesnap.barelyhuman.dev](http://sizesnap.barelyhuman.dev)

## Lighter CLI

There's also a subpackage which is about **400B** if you'd like to use that for a CLI or writing your own programmatic API
You can read about it on it's own readme [packages/sizesnap-lite](packages/sizesnap-lite)

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
>> Reading Config
>> Sizing dist/index.js - 14.72KB
>> Sizing src/api.js - 4.71KB
>> Sizing src/constants.js - 80B
>> Sizing src/index.js - 762B
>> Sizing src/lib/bytes.js - 72B
>> Sizing src/lib/files.js - 372B
>> Sizing src/lib/loggers.js - 357B
>> Sizing src/lib/zipped.js - 444B
-x- Generated .sizesnap.json

# or

# `table` is deprecated , use `--table` instead
> yarn size table
> yarn size --table

# output
FILEPATH                SIZE    GZIP    BROTLI
dist/index.js           14.74KB 5.6KB   5.08KB
src/api.js              4.71KB  1.46KB  1.32KB
src/constants.js        80B     75B     73B
src/index.js            801B    402B    340B
src/lib/bytes.js        72B     79B     76B
src/lib/files.js        372B    223B    186B
src/lib/loggers.js      357B    216B    186B
src/lib/zipped.js       444B    207B    186B

> yarn size --table --markdown

# output
|FILEPATH     |SIZE   |GZIP  |BROTLI|
|-------------|-------|------|------|
|dist/index.js|15.76KB|5.78KB|5.26KB|

```

## API

The package features a builder style API, you can get a fair understanding of using it from [src/index.js](packages/sizesnap/src/index.js) file

## License

[MIT](/LICENSE)

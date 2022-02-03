# sizesnap-lite

> a 0 dep cli of sizesnap

## Install

```
npm i sizesnap-lite -D
yarn add sizesnap-lite -D
```

## Usage

This cli is very limited and the only usecase is to read a single file and get it's size

```sh
sizesnap-lite index.js

    index.js - 664B 446B/gz 389B/br

```

## API 
same as above, it's a hyperfocused usecase lib so... 
```js
import lite from "sizesnap-lite"

lite("package.json") // => will print the size to the stdout
```


## License

[MIT](/LICENSE)

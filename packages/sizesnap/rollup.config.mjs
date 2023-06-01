import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import shebang from 'rollup-plugin-preserve-shebang';
import size from 'rollup-plugin-size';
import path from 'node:path';
import esbuild from 'rollup-plugin-esbuild';
import { builtinModules } from 'node:module';

function config(input, output, cfgModifier = (cfg) => cfg) {
  /**
   * @type {import("rollup").RollupOptions}
   */
  const cfg = {
    input: input,
    banner: '#!/usr/bin/env node',
    external: [...builtinModules],
    plugins: [
      shebang(),
      commonjs({
        exclude: [/\.mjs$/, /\/rollup\//, path.resolve('src')],
        transformMixedEsModules: true,
        requireReturnsDefault: 'preferred',
        ignore: builtinModules,
      }),
      resolve({
        preferBuiltins: true,
        exportConditions: ['node', 'import', 'module', 'default'],
        extensions: ['.mjs', '.js', '.json', '.es6', '.node'],
      }),
      json(),
      size(),
      esbuild({
        target: 'node12',
        minify: true,
      }),
    ],
    treeshake: true,
    output: {
      compact: true,
      format: 'cjs',
      dir: output,
    },
  };
  return cfgModifier(cfg);
}

export default [config('./src/index.js', './dist')];

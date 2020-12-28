import typescript from '@rollup/plugin-typescript';
import inject from '@rollup/plugin-inject';
import build from './build/build.js';
import module from 'module';

const banner = `/**
 * Copyright (c) 2020 Federico Carboni, MIT license
 *
 */`;

/** @type {import('rollup').RollupOptions[]} */
const config = [{
  input: '../mod.ts',
  output: [{
    file: 'lib/lib.mjs',
    format: 'es',
    preferConst: true,
    banner,
  }, {
    file: 'lib/lib.js',
    format: 'cjs',
    preferConst: true,
    interop: (id) => module.builtinModules.includes(id) ? 'default' : 'auto',
    banner,
  }],
  onwarn(warning, handle) {
    if (
      warning.plugin !== 'typescript' ||
      warning.pluginCode !== 'TS2691' &&
      warning.pluginCode !== 'TS2354'
    ) {
      handle(warning);
    }
  },
  plugins: [
    typescript({
      include: [
        '../**/*.ts',
        '**/*.ts'
      ],
    }),
    build(),
    inject({
      modules: {
        'TextEncoder': ['util', 'TextEncoder'],
        'TextDecoder': ['util', 'TextDecoder'],
      }
    }),
  ],
  external: [...module.builtinModules],
}];

export default config;

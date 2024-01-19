import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2'; // 处理typescript
import babel from '@rollup/plugin-babel';
import dts from 'rollup-plugin-dts';

export default defineConfig([
  {
    input: './index.ts',
    plugins: [
      typescript(), // typescript 转义
      babel({
        babelrc: false,
        presets: [['@babel/preset-env', { modules: false, loose: true }]],
        plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
        exclude: 'node_modules/**'
      })
    ],
    output: [
      { file: 'dist/index.esm.js', format: 'es' },
      { file: 'dist/index.cjs', format: 'cjs' },
      {
        format: 'umd',
        file: 'dist/index.js',
        name: 'dnhyxcTools'
      }
    ]
  },
  /* 单独生成声明文件 */
  {
    input: './index.ts',
    plugins: [dts()],
    output: {
      format: 'esm',
      file: 'dist/index.d.ts'
    }
  }
]);

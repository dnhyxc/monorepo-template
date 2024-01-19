import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'rollup';
import typescript from 'rollup-plugin-typescript2'; // 处理typescript
import babel from '@rollup/plugin-babel';
// 解析cjs格式的包
import commonjs from '@rollup/plugin-commonjs';
// 处理json问题
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
// 打包前删除原有目录
import del from 'rollup-plugin-delete';
// 压缩代码
import { terser } from 'rollup-plugin-terser';
// 解决node_modules三方包找不到问题
import resolve from '@rollup/plugin-node-resolve';
import eslint from '@rollup/plugin-eslint';
// 配置别名
import alias from '@rollup/plugin-alias';

// 通过改写__dirname 为__dirnameNew，解决打包报错
const __filenameNew = fileURLToPath(import.meta.url);
const __dirnameNew = path.dirname(__filenameNew);
const getPath = (_path) => path.resolve(__dirnameNew, _path);

export default defineConfig([
  {
    input: './index.ts',
    plugins: [
      del(),
      typescript({
        tsconfig: getPath('./tsconfig.json'), // 导入本地ts配置
        extensions: ['.ts', 'tsx']
      }), // typescript 转义
      json(),
      terser(),
      resolve(),
      commonjs(),
      babel({
        presets: [
          [
            '@babel/preset-env',
            {
              targets: {
                node: 'current'
              }
            }
          ]
        ],
        plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
        exclude: 'node_modules/**'
      }),
      eslint({
        throwOnError: true,
        throwOnWarning: true,
        include: ['packages/**'],
        exclude: ['node_modules/**', 'dist/**']
      }),
      alias({
        entries: [{ find: '@', replacement: 'src' }]
      })
    ],
    output: [
      { file: 'dist/index.esm.js', format: 'es' },
      { file: 'dist/index.cjs', format: 'cjs' },
      {
        format: 'umd',
        file: 'dist/index.js',
        name: 'dnhyxcCore'
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

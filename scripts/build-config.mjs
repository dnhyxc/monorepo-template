import typescript from 'rollup-plugin-typescript2';
import babel from '@rollup/plugin-babel';
// 解析cjs格式的包
import commonjs from '@rollup/plugin-commonjs';
// 处理json问题
import json from '@rollup/plugin-json';
import dts from 'rollup-plugin-dts';
// 压缩代码
import { terser } from 'rollup-plugin-terser';
// 解决node_modules三方包找不到问题
import resolve from '@rollup/plugin-node-resolve';
import eslint from '@rollup/plugin-eslint';
// 配置别名
import alias from '@rollup/plugin-alias';
import { getPath } from '../utils/index.mjs';

export const buildConfig = ({ packageName }) => {
  // 将包名转化为驼峰式命名，以便通过window.packageName访问
  packageName = packageName.replace(/-(\w)/g, (_, char) => char.toUpperCase());

  const baseConfig = [
    {
      input: './index.ts',
      output: [
        // 输出支持 es6 语法的包
        { file: 'dist/index.esm.js', format: 'es' },
        // 输出支持 commonjs 的包
        { file: 'dist/index.cjs', format: 'cjs' },
        // 输出支持 umd 格式的包，以便通过 script 标签直接引用
        {
          format: 'umd',
          file: 'dist/index.js',
          name: packageName
        }
      ],
      plugins: [
        typescript({
          tsconfig: getPath('../tsconfig.json'), // 导入本地ts配置
          extensions: ['.ts', 'tsx']
        }), // typescript 转义
        json(),
        terser(),
        resolve({
          preferBuiltins: true // 解析第三方模块中的 Node.js 内置模块
        }),
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
          // 用于支持在类中使用类属性的新语法，当loose设置为true，代码被以赋值表达式的形式编译，否则，代码以Object.defineProperty来编译。
          plugins: ['@babel/plugin-proposal-class-properties'],
          exclude: 'node_modules/**'
        }),
        // 配置路径别名
        alias({
          entries: [
            { find: '@', replacement: '../packages/core/src' },
            { find: '@', replacement: '../packages/tools/src' }
          ]
        }),
        // 配置eslint
        eslint({
          throwOnError: true,
          throwOnWarning: true,
          include: ['packages/**'],
          exclude: ['node_modules/**', 'dist/**']
        }),
      ],
    }
  ]

  // 声明文件打包输出配置
  const declaration = {
    input: './index.ts',
    plugins: [
      dts(),
      alias({
        entries: [{ find: '@', replacement: './src' }]
      })
    ],
    output: {
      format: 'esm',
      file: 'dist/index.d.ts'
    }
  };

  baseConfig.push(declaration);

  return baseConfig;
};

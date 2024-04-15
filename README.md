### 初始化项目

```yaml
pnpm init -Dw
```

### 配置 pnpm monorepo

在项目根目录下同时创建 `packages` 文件夹及 `pnpm-workspace.yaml` 文件，`pnpm-workspace.yaml` 内容如下：

```yaml
packages:
  - 'packages/**'
```

在根目录下使用 `pnpm init` 生成 `package.json` 文件：

```json
{
  "name": "monorepo-template",
  "version": "0.0.1",
  "description": "dnhyxc monorepo template",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["pnpm", "monorepo"],
  "author": {
    "name": "dnhyxc",
    "github": "https://github.com/dnhyxc"
  },
  "license": "ISC"
}
```

在 packages 文件夹下新建 `core` 和 `tools` 文件夹，文件名称可根据自己意愿更改，不一定要按 `core` 或者 `tools` 命名。

文件夹新建完毕后，分别在 `core` 和 `tools` 文件夹下新建 `package.json` 文件，也可以通过 `pnpm init` 创建。但是文件内容需要设置成如下：

```json
{
  "name": "@dnhyxc/core", // 如果时 tools，为 @dnhyxc/tools
  "description": "dnhyxc 插件包",
  "version": "0.0.1",
  "main": "dist/index.cjs", // CommonJS 模块语法导入的入口文件
  "module": "dist/index.esm.js", // ES6 模块语法导入的入口文件
  "browser": "dist/index.js", // umd 格式通过 scripts 标签导入的入口文件
  "typings": "dist/index.d.ts", // ts 文件的类型导出文件
  "scripts": {
    "dev": "rollup -c rollup.config.js -w",
    "build": "rimraf dist && vitest run && rollup -c rollup.config.js",
    "test": "vitest run" // 运行测试用例的命令，后续会讲到
  },
  "keywords": ["pnpm", "monorepo", "plugins"],
  "author": {
    "name": "dnhyxc",
    "github": "https://github.com/dnhyxc"
  },
  "license": "ISC",
  "type": "module", // 这里不设置 "type": "module"，打包会报错
  "files": ["dist", "README.md"] // 需要发布到 npm 的文件列表
}
```

### 配置 rollup 打包

在根目录下安装如下插件：

```yaml
pnpm i rollup rollup-plugin-terser @rollup/plugin-alias @rollup/plugin-babel @rollup/plugin-commonjs @rollup/plugin-json @rollup/plugin-node-resolve @babel/plugin-proposal-class-properties -Dw
```

- rollup-plugin-terser：用于压缩代码。

- @rollup/plugin-alias：用于配置路径别名。

- @rollup/plugin-babel：用于将 ES6+ 的 JavaScript 代码转换为 ES5 兼容的代码。

- @rollup/plugin-commonjs：用于将 CommonJS 模块转换为 ES 模块。

- @rollup/plugin-json：用于导入和处理 JSON 文件。

- @rollup/plugin-node-resolve：用于解析 Node.js 模块，解决node_modules三方包找不到问题。

- @babel/plugin-proposal-class-properties：用于支持在类中使用类属性的新语法。

为了不在每个子项目中都配置一份同样的 `rollup.config.js` 文件，每次改一个配置，每个子项目都得重复改一遍，于是在项目根目录下新建一个 `scripts` 文件夹，并在 `scripts` 中新建 `rollup.config.mjs` 文件，之所以 `rollup.config.mjs` 文件的后缀名是 `.mjs`，而不是 `.js`，是为了支持子项目中的 `rollup.config.js` 文件能够使用 `import` 语法导入 `rollup.config.mjs` 文件的配置，如果后缀名为 `.js`，则会报错。

- `/scripts/rollup.config.mjs` 具体内容如下：

```js
import path from 'path';
import { fileURLToPath } from 'url';
import babel from '@rollup/plugin-babel';
// 解析cjs格式的包
import commonjs from '@rollup/plugin-commonjs';
// 处理json问题
import json from '@rollup/plugin-json';
// 压缩代码
import { terser } from 'rollup-plugin-terser';
// 解决node_modules三方包找不到问题
import resolve from '@rollup/plugin-node-resolve';
// 配置别名
import alias from '@rollup/plugin-alias';

// 通过改写__dirname 为__dirnameNew，解决打包报错
const __filenameNew = fileURLToPath(import.meta.url);
const __dirnameNew = path.dirname(__filenameNew);
const getPath = (_path) => path.resolve(__dirnameNew, _path);

export const buildConfig = ({ packageName }) => {
  return [
    {
      input: './index.ts',
      plugins: [
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
          // 用于支持在类中使用类属性的新语法，loose默认为false，当loose设置为true，代码被以赋值表达式的形式编译，否则，代码以Object.defineProperty来编译。
          plugins: [['@babel/plugin-proposal-class-properties']],
          // plugins: [['@babel/plugin-proposal-class-properties', { loose: true }]],
          exclude: 'node_modules/**'
        }),
        alias({
          entries: [
            { find: '@', replacement: '../packages/core/src' },
            { find: '@', replacement: '../packages/tools/src' }
          ]
        })
      ],
      output: [
        { file: 'dist/index.esm.js', format: 'es' },
        { file: 'dist/index.cjs', format: 'cjs' },
        {
          format: 'umd',
          file: 'dist/index.js',
          name: packageName
        }
      ]
    }
  ];
};
```

在每个子项目中新建 `rollup.config.js`：

- core/rollup.config.js 内容如下：

```js
import { defineConfig } from 'rollup';
// 导入根目录下导入build-config.mjs的配置
import { buildConfig } from '../../scripts/build-config.mjs';
// 参数 packageName 的作用是在打包输出 umd 时，作为 umd 的包名
const configs = buildConfig({ packageName: 'dnhyxcCore' });

export default defineConfig(configs);
```

- tools/rollup.config.js 内容如下：

```js
import { defineConfig } from 'rollup';
// 导入根目录下导入build-config.mjs的配置
import { buildConfig } from '../../scripts/build-config.mjs';
// 参数 packageName 的作用是在打包输出 umd 时，作为 umd 的包名
const configs = buildConfig({ packageName: 'dnhyxcTools' });

export default defineConfig(configs);
```

### 配置 typescript

在根目录下安装 `typescript`：

```yaml
pnpm i typescript rollup-plugin-typescript2 rollup-plugin-dts -Dw
```

- rollup-plugin-typescript2：用于编译 typescript 代码。

- rollup-plugin-dts：用于生成 typescript 的声明文件。

与上述 rollup 配置一样，为了不在每个子项目中都配置一份同样的 `tsconfig.json` 文件，需要在项目根目录下中新建 `tsconfig.json` 文件，具体内容如下：

```json
{
  "include": [
    "./packages/core/src/*",
    "./packages/tools/src/*",
    "./packages/core/index.ts",
    "./packages/tools/index.ts",
    "./src/*",
    "./index.ts"
  ],
  "compilerOptions": {
    "target": "ES2019",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "resolveJsonModule": true,
    "useUnknownInCatchVariables": false,
    "typeRoots": ["./types", "./node_modules/@types"],
    "baseUrl": ".", // 引入模块的方式
    // 路径别名配置
    "paths": {
      "@/*": ["./packages/core/src/*", "./packages/tools/src/*"]
    }
  }
}
```

同时在**子项目**（core 及 tools）下也新建 `tsconfig.json` 文件，内容如下：

```json
{
  "extends": "../../tsconfig.json"
}
```

完成上述配置后，修改根目录下 `scripts/build-config.mjs` 文件，增加处理 ts 文件的配置：

```js
import typescript from 'rollup-plugin-typescript2';

export const buildConfig = ({ packageName }) => {
  return [
    {
      input: './index.ts',
      plugins: [
        typescript({
          // 导入本地ts配置
          tsconfig: getPath('../tsconfig.json'),
          extensions: ['.ts', 'tsx']
        }) // typescript 转义
      ]
    }
  ];
};
```

设置打包时，在 `dist` 文件夹中生成 `.d.ts` ts 声明文件：

```js
import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';

export const buildConfig = ({ packageName }) => {
  return [
    {
      input: './index.ts',
      plugins: [
        typescript({
          // 导入本地ts配置
          tsconfig: getPath('../tsconfig.json'),
          extensions: ['.ts', 'tsx']
        }) // typescript 转义
      ]
    },
    // 单独生成声明文件
    {
      input: './index.ts',
      plugins: [
        dts(),
        // 配置别名，防止在构建时，无法找到使用别名的路径
        alias({
          entries: [{ find: '@', replacement: './src' }]
        })
      ],
      output: {
        format: 'esm',
        file: 'dist/index.d.ts'
      }
    }
  ];
};
```

### 配置 ESlint

在项目根目录下安装如下插件：

```yaml
pnpm i eslint @rollup/plugin-eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser -Dw
```

- @rollup/plugin-eslint：用于在打包过程中对 JavaScript 代码进行 ESLint 检查。

- @typescript-eslint/eslint-plugin：用于检查和规范 TypeScript 代码。

- @typescript-eslint/parser：用于 ESLint 工具的插件，可以支持 TypeScript 语法的静态分析和检查。

在项目根目录下新建 `.eslintrc.json` 及 `.eslintignore` 文件：

- `.eslintrc.json` 文件内容如下，具体规则可自行删减：

```json
{
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "modules": true
    },
    "requireConfigFile": false,
    "parser": "@typescript-eslint/parser"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "semi": 0, // 禁止尾部使用分号“ ; ”
    "no-var": "error", // 禁止使用 var
    "indent": ["error", 2], // 缩进2格
    "no-mixed-spaces-and-tabs": "error", // 不能空格与tab混用
    "quotes": [2, "single"], // 使用单引号
    "no-useless-catch": 0,
    "prettier/prettier": 0,
    "no-new": 0,
    "no-use-before-define": 0,
    "no-unused-expressions": 0,
    "new-cap": 0,
    "@typescript-eslint/no-explicit-any": 0
  }
}
```

- `.eslintignore` 文件内容如下：

```
dist
node_modules
!.prettierrc.js
components.d.ts
auto-imports.d.ts
```

### 配置 prettier

在项目根目录下安装 `prettier` 插件：

```yaml
pnpm i prettier -Dw
```

之后在根目录下新建 `.prettierrc.js` 文件，内容如下：

```json
{
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "trailingComma": "none",
  "jsxSingleQuote": false,
  "bracketSpacing": true,
  "jsxBracketSameLine": false,
  "arrowParens": "always",
  "rangeStart": 0,
  "requirePragma": false,
  "insertPragma": false,
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "vueIndentScriptAndStyle": false,
  "endOfLine": "lf",
  "embeddedLanguageFormatting": "auto",
  "singleAttributePerLine": false
}
```

### 配置 husky

安装 `husky`：

```yaml
pnpm i husky -Dw
```

在 `package.json` 文件中增加如下两条脚本及 `lint-staged` 配置：

```js
{
  "scripts": {
    "prepare": "husky install",
    "test": "npx eslint ./packages  --ext ts,vue,js --fix",
  },
  "lint-staged": {
    "*.{js,ts,tsx,jsx,vue}": [
      "eslint --fix",
      "prettier --write",
      "git add"
    ],
    "{!(package)*.json,*.code-snippets,.!(browserslist)*rc}": [
      "prettier --write--parser json"
    ],
    "package.json": [
      "prettier --write"
    ],
    "*.md": [
      "prettier --write"
    ]
  },
}
```

如果代码还没通过 git 进行管理，需要先使用 `git init` 命令创建 `.git` 文件，将代码进行托管，否则执行下述命令将会报错。

之后运行 `pnpm run prepare`，自动在根目录下生成 `.husky` 文件夹，紧接着运行 `npx husky add .husky/pre-commit "npm test"` 在 `.husky` 文件夹中生成 `pre-commit` 文件，生成的 `pre-commit` 文件内容如下：

```yaml
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm test
```

### 配置 commitlint 约定式提交

安装如下插件：

```yaml
pnpm add commitizen cz-customizable @commitlint/cli @commitlint/config-conventional -Dw
```

在根目录下新建 `commitlint.config.js` 文件及 `.cz-config.js` 文件：

- `commitlint.config.js` 文件内容如下，具体可以自主进行更改，详情请参考 [commitlint](https://commitlint.js.org)。

```js
module.exports = {
  extends: ['@commitlint/config-conventional', 'cz'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feature', // 新功能（feature）
        'bug', // 此项特别针对bug号，用于向测试反馈bug列表的bug修改情况
        'fix', // 修补bug
        'ui', // 更新 ui
        'docs', // 文档（documentation）
        'style', // 格式（不影响代码运行的变动）
        'perf', // 性能优化
        'release', // 发布
        'deploy', // 部署
        'refactor', // 重构（即不是新增功能，也不是修改bug的代码变动）
        'test', // 增加测试
        'chore', // 构建过程或辅助工具的变动
        'revert', // feat(pencil): add ‘graphiteWidth’ option (撤销之前的commit)
        'merge', // 合并分支， 例如： merge（前端页面）： feature-xxxx修改线程地址
        'other', // 其它更改
        'build' // 打包
      ]
    ],
    // <type> 格式 小写
    'type-case': [2, 'always', 'lower-case'],
    // <type> 不能为空
    'type-empty': [2, 'never'],
    // <scope> 范围不能为空
    'scope-empty': [2, 'never'],
    // <scope> 范围格式
    'scope-case': [0],
    // <subject> 主要 message 不能为空
    'subject-empty': [2, 'never'],
    // <subject> 以什么为结束标志，禁用
    'subject-full-stop': [0, 'never'],
    // <subject> 格式，禁用
    'subject-case': [0, 'never'],
    // <body> 以空行开头
    'body-leading-blank': [1, 'always'],
    'header-max-length': [0, 'always', 72]
  }
};
```

- `.cz-config.js` 文件内容如下，具体可以自主进行更改。这里需要注意的是，**根目录下的 `package.json` 中的不能有 `"type": "module"` 的配置，否则会报错**，这是因为加了 `"type": "module"` 会导致模式不兼容，因此会导致报错。

```js
module.exports = {
  types: [
    { value: 'feature', name: 'feature: 增加新功能' },
    { value: 'bug', name: 'bug: 测试反馈bug列表中的bug号' },
    { value: 'fix', name: 'fix: 修复bug' },
    { value: 'ui', name: 'ui: 更新UI' },
    { value: 'docs', name: 'docs: 文档变更' },
    { value: 'style', name: 'style: 代码格式(不影响代码运行的变动)' },
    { value: 'perf', name: 'perf: 性能优化' },
    {
      value: 'refactor',
      name: 'refactor: 重构(既不是增加feature，也不是修复bug)'
    },
    { value: 'release', name: 'release: 发布' },
    { value: 'deploy', name: 'deploy: 部署' },
    { value: 'test', name: 'test: 增加测试' },
    {
      value: 'chore',
      name: 'chore: 构建过程或辅助工具的变动(更改配置文件)'
    },
    { value: 'revert', name: 'revert: 回退' },
    { value: 'other', name: 'other: 其它修改' },
    { value: 'build', name: 'build: 打包' }
  ],
  // override the messages, defaults are as follows
  messages: {
    type: '请选择提交类型:',
    customScope: '请输入您修改的范围(可选):',
    subject: '请简要描述提交 message (必填):',
    body: '请输入详细描述(可选，待优化去除，跳过即可):',
    footer: '请输入要关闭的issue(待优化去除，跳过即可):',
    confirmCommit: '确认使用以上信息提交？(y/n/e/h)'
  },
  allowCustomScopes: true,
  skipQuestions: ['body', 'footer'],
  subjectLimit: 72
};
```

最后在 `package.json` 中增加如下配置：

```js
{
  "scripts": {
    "commit": "git-cz"
  },
  "config": {
    "commitizen": {
      "path": "cz-customizable"
    }
  },
}
```

### 配置 vitest 单元测试

在每个子包中（core 及 tools）分别安装 `vitest` 单元测试包：

```yaml
# 在根目录下通过 -F（--filter 的缩写）安装
pnpm add vitest -F @dnhyxc/core # 为 core 子包安装 vitest 工具函数库

pnpm add vitest -F @dnhyxc/tools # 为 tools 子包安装 vitest 工具函数库

# 或 cd 进入到对应的子包中安装
pnpm i vitest
```

与上述 rollup 的配置一样，为了不改动某个配置，需要更改每个子包中的配置，因此，也需要在根目录下的 `scripts` 文件夹中新增一个全局的配置文件 `vitest-config.mjs`，内容如下：

```js
import path from 'path';

// folder 参数对应每个包的文件名称，如果是 core，则 folder 就是 core，如果是 tools 则 folder 就是 tools
export const vitestConfig = ({ folder }) => {
  return {
    resolve: {
      // 配置路径别名，防止在包中使用路径别名时，测试用例无法找到对应的路径
      alias: {
        '@': path.resolve(__dirname, `../packages/${folder}/src`)
      }
    }
  };
};
```

上述配置完成后，在每个子包中也需要分别新建一个 `vitest-config.js` 文件：

- `/core/vitest-config.js` 内容如下：

```js
import { defineConfig } from 'vitest/config';
import { vitestConfig } from '../../scripts/vitest-config.mjs';

const config = vitestConfig({ folder: 'core' });

export default defineConfig(config);
```

- `/tools/vitest-config.js` 内容如下：

```js
import { defineConfig } from 'vitest/config';
import { vitestConfig } from '../../scripts/vitest-config.mjs';

const config = vitestConfig({ folder: 'tools' });

export default defineConfig(config);
```

在每个子项目中的 `scripts` 中的增加 `test` 命令：

```json
{
  "scripts": {
    "dev": "rollup -c rollup.config.js -w",
    "build": "rimraf dist && vitest run && rollup -c rollup.config.js",
    "test": "vitest run"
  }
}
```

### 配置 Changesets

[Changesets](https://github.com/atlassian/changesets) 是一个用于 Monorepo 项目下版本以及 Changelog 文件管理的工具。目前一些比较火的 Monorepo 仓库都在使用该工具进行项目的发包例如 pnpm、mobx 等。

在根目录下安装 `@changeset/cli`：

```yaml
pnpm install @changeset/cli -Dw
```

安装完毕之后在根目录下运行 `npx changeset init` 在根目录下生成 `.changeset` 文件夹，其中 `config.json` 文件内容如下：

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "master",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

在根目录下的 `package.json` 中增加如下脚本：

```json
{
  "scripts": {
    "publish": "pnpm --filter=./packages/* run build && pnpm changeset && pnpm changeset version && pnpm changeset publish"
  }
}
```

- **pnpm changeset**：该命令会根据 monorepo 下的项目来生成一个 changeset 文件，里面会包含前面提到的 changeset 文件信息（更新包名称、版本层级、CHANGELOG 信息）

- **pnpm changeset version**：该命令会消耗 changeset 文件并且修改对应包版本以及依赖该包的包版本，同时会根据之前 changeset 文件里面的信息来生成对应的 CHANGELOG 信息。

- **pnpm changeset publish**：该命令最终会将所有改动的包发布到 npm 仓库。

> 注意：发布时，要遵循 `npm` 的发布规则，如 npm 源必须用官方源，并且必须先执行 `npm login` 登录 npm，否则发布会失败。

### 根目录 package.json 最终配置

以上配置全部完成后，最终 `package.json` 配置如下：

```json
{
  "name": "monorepo-template",
  "version": "1.0.0",
  "description": "dnhyxc monorepo template",
  "scripts": {
    "build": "pnpm -r --filter=./packages/* run build",
    "release": "pnpm changeset publish",
    "publish": "pnpm --filter=./packages/* run build && pnpm changeset && pnpm changeset version && pnpm changeset publish",
    "prepare": "husky install",
    "test": "npx eslint ./packages  --ext ts,vue,js --fix",
    // 通过 git-cz 提交，以便启用 commitizen
    "commit": "git-cz"
  },
  "config": { "commitizen": { "path": "cz-customizable" } },
  "lint-staged": {
    "*.{js,ts,tsx,jsx,vue}": ["eslint --fix", "prettier --write", "git add"],
    "{!(package)*.json,*.code-snippets,.!(browserslist)*rc}": ["prettier --write--parser json"],
    "package.json": ["prettier --write"],
    "*.md": ["prettier --write"]
  },
  "keywords": ["pnpm", "monorepo"],
  "author": { "name": "dnhyxc", "github": "https://github.com/dnhyxc" },
  "license": "ISC",
  "devDependencies": {
    "@babel/core": "^7.23.7",
    "@babel/plugin-proposal-class-properties": "^7.18.6",
    "@babel/preset-env": "^7.23.8",
    "@changesets/cli": "^2.27.1",
    "@commitlint/cli": "^18.4.4",
    "@commitlint/config-conventional": "^18.4.4",
    "@rollup/plugin-alias": "^5.1.0",
    "@rollup/plugin-babel": "^6.0.4",
    "@rollup/plugin-commonjs": "^25.0.7",
    "@rollup/plugin-eslint": "^9.0.5",
    "@rollup/plugin-json": "^6.1.0",
    "@rollup/plugin-node-resolve": "^15.2.3",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "commitizen": "^4.3.0",
    "cz-customizable": "^7.0.0",
    "eslint": "^8.56.0",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0",
    "prettier": "^3.2.3",
    "rimraf": "^5.0.5",
    "rollup": "^4.9.5",
    "rollup-plugin-dts": "^6.1.0",
    "rollup-plugin-terser": "^7.0.2",
    "rollup-plugin-typescript2": "^0.36.0",
    "typescript": "^5.3.3"
  }
}
```

> [gitbub 源码地址](https://github.com/dnhyxc/monorepo-template)

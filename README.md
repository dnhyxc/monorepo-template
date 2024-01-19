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

### 配置 typescript

在根目录下安装 `typescript`：

```yaml
pnpm i typescript -Dw
```

在子项目（core 及 tools）下新建 `tsconfig.json` 文件，内容如下：

```json
{
  "include": ["./src/*", "./index.ts"],
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
    "typeRoots": ["./types", "./node_modules/@types"]
  },
  "types": ["jest"]
}
```

### 配置 ESlint

在项目根目录下安装如下插件：

```yaml
pnpm i eslint @rollup/plugin-eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser -Dw
```

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

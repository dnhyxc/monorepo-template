### 子包开发注意事项

通过 `npm run create demo` 创建子包之后，检查子包的 `rollup.config.js`、`scripts/build-config.mjs` 及根目录 `tsconfig.json` 文件配置是否正确，可以根据自己的需求进行修改。

### 子包依赖安装

进入到子包目录，执行 `pnpm i` 安装依赖，注意 node 的版本是否支持 pnpm。

上述操作完成后，可以根据自己的需求，更新 `package.json` 文件，如添加 `scripts` 命令，修改 `name` 包名等等。

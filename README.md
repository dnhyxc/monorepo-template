### 初始化项目

项目依赖安装：

```yaml
pnpm i
```

为根目录安装：

```yaml
pnpm i rollup -Dw
```

为子包单独安装：

- 进入子包目录进行安装：

```yaml
cd packages/demo

pnpm i rollup -D
```

- 或者在根目录运行 `pnpm i visite --filter demo` 为指定子包安装依赖。

```yaml
pnpm i visite --filter demo
```

### 新建子包

运行 `npm run create <projectName>` 即可创建新的子包，其中 `<projectName>` 为子包名称，也就是文件夹名称。

```yaml
npm run create demo
```

### 运行测试

进入子包，运行 `npm test` 即可运行测试。

```yaml
cd packages/demo

npm run test
```

### 打包

单独为子包打包：

```yaml
cd packages/demo

npm run build
```

打包所有子包：在根目录运行 `npm run build` 即可。

```yaml
npm run build
```

### 发布

在根目录运行 `npm run release` 即可发布所有子包。

```yaml
npm run release
```

### 快捷发布

在根目录运行 `npm run publish` 即可快捷测试、打包、发布所有子包。

```yaml
npm run publish
```

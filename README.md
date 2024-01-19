### 初始化项目

```js
pnpm init
```

### 配置 pnpm monorepo

在项目根目录下同时创建 `packages` 文件夹及 `pnpm-workspace.yaml` 文件，`pnpm-workspace.yaml` 内容如下：

```yaml
packages:
  - 'packages/**'
```


### ES6 使用

```js
import { getNameInfo } from '@dnhyxc/tools';

console.log(getNameInfo('dnhyxc'));
```

### CommonJS 使用

```js
const { getNameInfo } = require('@dnhyxc/tools');

console.log(getNameInfo('dnhyxc'));
```

### 通过 cdn 使用

```html
<script src="https://cdn.jsdelivr.net/npm/@dnhyxc/core@2.0.6/dist/index.js"></script>

<script>
  console.log(window.dnhyxcTools.getNameInfo('dnhyxc'));
</script>
```

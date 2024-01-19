### ES6 使用

```js
import { add } from '@dnhyxc/core';

console.log(add(2, 9));
```

### CommonJS 使用

```js
const { add } = require('@dnhyxc/core');

console.log(add(2, 9));
```

### 通过 cdn 使用

```html
<script src="https://cdn.jsdelivr.net/npm/@dnhyxc/core@2.0.12/dist/index.js"></script>

<script>
  console.log(window.dnhyxcCore.add(12, 9));
</script>
```

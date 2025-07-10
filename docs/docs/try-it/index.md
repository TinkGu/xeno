---
title: 试一试 💻
sidemenu: false
toc: content
---

## 试一试

请直接打开网站控制台，`xeno` 已经以全局变量的形式挂载到了 window 上。<br/>
任何子包，比如以 `@tinks/xeno/fetch` 的形式引入的方法，可以从 `window.xeno.fetch` 上获取。

此处也可以用于开发时调试，但请确保已经 `yarn build:esm`。

## 本地调试

除了使用上述的试一试方案外，你也可以通过 node 命令行来进行调试

```bash
$ yarn build
$ node
$ > const xeno = require('./');
```

## 编写文档

文档服务本身使用 `dumi` + `typedoc` 构建的，在此基础上，扩展了一些功能。

如果想在左侧展示模块的中文简介名，可以在模块文件的顶部这样书写。

```typescript
/**
 * @module
 * @sidemenu true
 * @title 模块名
 * @description
 * 一些描述，最终会展示在模块页面的最顶部，作为模块的说明
 */
export * from './xxx';
```

其中，`sidemenu` 是用于将模块从 `core` 中分离出来，展示在左侧的菜单中。
因为默认将所有模块都划分在 `core` 模块中。

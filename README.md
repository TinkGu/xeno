# @tinks/xeno

## develop

- install

```bash
yarn
```

- build

```bash
yarn build
```

- local preview

```bash
npm link

# 再到具体项目下执行
npm link @tinks/xeno

# 若要解除 link
npm unlink @tinks/xeno

# 全局解除
npm unlink @tinks/xeno -g
```

## publish workflow

```bash
# 构建未验证的 beta 版本
yarn release:beta # v0.0.1 => v0.0.2-beta.0
# 构建正式版本
yarn release # v0.0.1 => v0.0.2 或 v0.0.2-beta.0 => v0.0.2

# 发包
npm publish

# 发布成功后，会自动 push 自动生成的 tag 和当前分支
```

- 请先确保在本地 link 验证 ok 后，再进行发包。
- 若本次改动未在测服完全测试过，先发布 `beta` 版本。

## 分包

每次 build 后，都会产生一些文件夹在主目录下。此处利用了 npm-file-map 的方式，来支持 npm 包的子目录，使得用户可以以 `@tinks/xeno/xx` 的方式来 import。

- 想要直接通过 `import { xx } from '@tinks/xeno'` 导出的，就直接在 `src/index` 中 export
- 子目录请在 `scripts/build-file-map` 中注册子目录名，默认读取 src 下的一级文件或目录，无需在 `src/index` export

## 文档

目前已引入 [TypeDoc](https://typedoc.org/) 对整个项目的 TS 代码自动生成类型签名，无需手动编写 `.md` 文件。
TypeDoc 支持 JsDoc 语法，并且更简单，无需标注类型，仅需对函数、字段的用途进行说明即可。
Typedoc 注释本身也支持 markdown 语法，TypeDoc 和 vscode 提示都能较好地渲染出来。

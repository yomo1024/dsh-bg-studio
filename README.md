# dsh-bg-studio

给 [DSH](https://github.com/deepseek-ai) 的 `dsh-claude-style` 主题加一个原生设置分区：背景图、内容透明度、侧栏字号、顶部导航字号，以及**顶部导航独立折叠**。

全部走 DSH 自己的 `settings.section` 插槽，界面语言随 DSH 主题走，不动任何上游 CSS 文件。

## 为什么写这个

DSH 把界面字号（设置页、左侧工作区/侧栏、右侧栏）写死在各自的 CSS module 里，只留了一个对话字号钩子 `--dsh-content-font-size`。`dsh-fonttune` 曾经想调它，最后把「界面字号」和「界面行高」两根轴**主动退役**了 —— 因为那些 ladder token（`--dsw-font-xs-13` 之类）只被对话区的 widget 消费，改它们对侧栏一点用都没有。

所以这个插件不碰 token，直接对侧栏的 CSS module 选择器下手：

```css
[class*="_panelList"], [class*="_panelRow"] {
  font-size: var(--bgs-nav-size) !important;
}
```

配合补上的 `line-height` 和 `min-height` —— 原生是死的 `line-height: 22px`，字放大会被裁。

## 功能

| 设置项 | 范围 | 说明 |
|---|---|---|
| 背景图 | 任意图片 | 存进 `localStorage`，转成 webp 后内联为 CSS 变量 |
| 内容透明度 | 0 – 100 | 让 `dsh-claude-style` 的底色透出背后的图 |
| 标题字号 | 9 – 24 px | 对话区标题 |
| 元信息字号 | 8 – 20 px | 对话区次要文字 |
| 时间戳字号 | 8 – 20 px | 消息时间 |
| 侧栏字号 | 8 – 20 px | 左侧栏整体 |
| 顶部导航字号 | 11 – 22 px | 「新会话 / 插件 / 插件市场 …」这一列 |
| 顶部导航折叠 | 开 / 关 | 独立开关，收起面板列表，文件树与新会话按钮不受影响 |

设置入口：**设置 → 背景与字号**。

## 导航折叠是怎么做的

原生侧栏只能**整条**收成 36px 宽的图标 rail（`._2H3hWW_collapsed`），但那样下面的文件树也没了。这个插件只切 `panelList` 这一层 —— 它正好是原生自己的 DOM 边界，把「导航项」和「新会话 / 文件树」隔开。

没有走纯 CSS，因为纯 CSS 没有可点的状态；也没有去改 React 树，只往 `panelList` 前面插入一个兄弟 `<button>`。万一侧栏重渲染把这个按钮冲掉，`MutationObserver`（120ms 节流）会把它补回来。

折叠状态记在 `localStorage` 的 `dsh-bg-studio:nav-collapsed`，刷新后保持。

## 安装

```bash
cd <你的 DSH profile 目录>
pnpm add dsh-bg-studio
```

然后在 profile 的 `package.json` 里把它加进 `dsh.profile.bundles`：

```json
"bundles": [
  "...",
  "dsh-bg-studio"
]
```

重启 DSH。

### 本地开发

```json
"dependencies": {
  "dsh-bg-studio": "link:E:/path/to/dsh-bg-studio"
}
```

`link:` 指向源码目录后，改完源码立刻生效，不用再手动复制，也不会被 `pnpm install` 当成野包清掉。

## 兼容性

- DSH `>= 0.2.1-rc.2`
- 依赖 `dsh-claude-style` 主题的背景层

> 侧栏的字号与折叠是靠 `[class*="_panelList"]` 这类哈希类名匹配的。DSH 上游如果重命名了这套 CSS module，需要跟着改插件里的选择器 —— 这也是为什么选择器写成「包含匹配」而不是完整类名。

## License

MIT

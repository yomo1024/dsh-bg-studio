/**
 * dsh-bg-studio —— host 侧空壳。
 *
 * 背景图、透明度、侧栏字号全部在前端完成（图片存 localStorage，样式注入 <style>），
 * 所以这里不需要 webServer 路由，只保留一个空的 apply 让包结构成立。
 */

export const name = "dsh-bg-studio";

export const inject = [];

export function apply() {
  // 故意留空：所有逻辑都在 lib/client.js
}

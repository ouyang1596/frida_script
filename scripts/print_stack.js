// 调用 config.js 里的方法时打印 Java 栈。
// 冷启动：frida -U -f com.vpb.popo -l config.js -l lib/common.js -l scripts/print_stack.js
// 已启动：frida -U Tada -l config.js -l lib/common.js -l scripts/print_stack.js

const { cfg, hookMethod } = globalThis;
if (typeof cfg !== "function" || typeof hookMethod !== "function") {
  throw new Error("缺少依赖。加载顺序：-l config.js -l lib/common.js -l scripts/print_stack.js");
}

Java.perform(function () {
  const c = cfg();
  if (c.className && c.methodName) {
    hookMethod({
      className: c.className,
      methodName: c.methodName,
      overload: c.overload,
      printArgs: true,
      printReturn: true,
      printJavaStack: true,
    });
  }
});

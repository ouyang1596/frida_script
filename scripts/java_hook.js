// 挂钩 config.js 里的 className.methodName，打印参数和返回值。
// 静态方法同样填 className / methodName。
// 冷启动：frida -D emulator-5554 -f com.vpb.popo -l config.js -l lib/common.js -l scripts/java_hook.js
// 已启动：frida -D emulator-5554 Tada -l config.js -l lib/common.js -l scripts/java_hook.js

const { cfg, hookMethod } = globalThis;
if (typeof cfg !== "function" || typeof hookMethod !== "function") {
  throw new Error("缺少依赖。加载顺序：-l config.js -l lib/common.js -l scripts/java_hook.js");
}

Java.perform(function () {
  const c = cfg();
  if (c.className.indexOf("com.example") === 0) {
    console.log("[!] config.js 仍是示例类名，先改 className / methodName");
  }
  hookMethod({
    className: c.className,
    methodName: c.methodName,
    overload: c.overload,
    staticMethod: c.staticMethod,
    printArgs: c.printArgs !== false,
    printReturn: c.printReturn !== false,
    printJavaStack: !!c.printJavaStack,
  });
});

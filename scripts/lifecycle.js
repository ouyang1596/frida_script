// 打印应用自己的 Activity onCreate / onResume / onPause，以及 Fragment onResume。
// 子类重写这些方法且不调用 super 时，这次回调不会出现。
// 冷启动：frida -U -f com.vpb.popo -l config.js -l lib/common.js -l scripts/lifecycle.js
// 已启动：frida -U Tada -l config.js -l lib/common.js -l scripts/lifecycle.js

const { cfg, inPackage, useClass } = globalThis;
if (typeof cfg !== "function" || typeof inPackage !== "function" || typeof useClass !== "function") {
  throw new Error("缺少依赖。加载顺序：-l config.js -l lib/common.js -l scripts/lifecycle.js");
}

function hookLifecycle(cls, methodName, signature) {
  const method = cls[methodName];
  if (!method || !method.overload) {
    console.log("[life] 没有这个方法: " + methodName);
    return;
  }
  const overload = signature ? method.overload(signature) : method.overload();
  overload.implementation = function () {
    try {
      const name = String(this.getClass().getName());
      if (inPackage(name, cfg().packagePrefix)) {
        console.log("[life] " + methodName + " " + name);
      }
    } catch (e) {
      console.log("[life] " + e);
    }
    return overload.apply(this, arguments);
  };
  const owner = cls.$className || "Activity";
  console.log("[life] hook " + owner + "." + methodName + (signature ? "(" + signature + ")" : "()"));
}

function hookFragment() {
  const androidx = useClass("androidx.fragment.app.Fragment");
  if (androidx) {
    hookLifecycle(androidx, "onResume");
    return;
  }
  const framework = useClass("android.app.Fragment");
  if (framework) {
    hookLifecycle(framework, "onResume");
    return;
  }
  console.log("[life] 未找到 Fragment，只监听 Activity");
}

Java.perform(function () {
  const Activity = Java.use("android.app.Activity");
  hookLifecycle(Activity, "onCreate", "android.os.Bundle");
  hookLifecycle(Activity, "onResume");
  hookLifecycle(Activity, "onPause");
  hookFragment();
});

// 列出 packagePrefix 下已经加载的类。watchFutureLoads 为 true 时继续打印后续 loadClass。
// 冷启动：frida -U -f com.vpb.popo -l config.js -l lib/common.js -l scripts/enum_classes.js
// 已启动：frida -U Tada -l config.js -l lib/common.js -l scripts/enum_classes.js

const { cfg, inPackage, watchLoadClass } = globalThis;
if (typeof cfg !== "function" || typeof inPackage !== "function" || typeof watchLoadClass !== "function") {
  throw new Error("缺少依赖。加载顺序：-l config.js -l lib/common.js -l scripts/enum_classes.js");
}

function dumpLoaded(prefix) {
  const names = Java.enumerateLoadedClassesSync().filter(function (name) {
    return inPackage(name, prefix);
  });
  names.sort();
  names.forEach(function (name) {
    console.log(name);
  });
  console.log("[enum] 已加载 " + names.length + " 个类");
}

function dumpMethods(prefix) {
  const query = prefix + ".*!*/s";
  const groups = Java.enumerateMethods(query);
  let count = 0;
  groups.forEach(function (group) {
    group.classes.forEach(function (cls) {
      count++;
      console.log(cls.name);
      cls.methods.forEach(function (method) {
        console.log("  " + method);
      });
    });
  });
  console.log("[enum] " + count + " 个类（含方法）");
}

function watchFutureLoads(prefix) {
  watchLoadClass(function (name) {
    if (inPackage(name, prefix)) {
      console.log("[load] " + name);
    }
  });
  console.log("[enum] 已监听后续 ClassLoader.loadClass");
}

Java.perform(function () {
  const c = cfg();
  const prefix = c.packagePrefix;
  if (!prefix || prefix === "com.example") {
    console.log("[!] 先把 config.js 的 packagePrefix 改成目标包名");
  }
  if (!prefix) {
    return;
  }

  if (c.dumpMethods) {
    try {
      dumpMethods(prefix);
    } catch (e) {
      console.log("[enum] enumerateMethods 失败，改为只列类名: " + e);
      dumpLoaded(prefix);
    }
  } else {
    dumpLoaded(prefix);
  }

  if (c.watchFutureLoads) {
    watchFutureLoads(prefix);
  }
});

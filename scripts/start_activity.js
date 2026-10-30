// 挂钩 Instrumentation.execStartActivity，打印目标组件（或 action、data）和 extras。
// 冷启动：frida -U -f com.vpb.popo -l config.js -l lib/common.js -l scripts/start_activity.js
// 已启动：frida -U Tada -l config.js -l lib/common.js -l scripts/start_activity.js

const { cfg, inPackage, describe } = globalThis;
if (typeof cfg !== "function" || typeof inPackage !== "function" || typeof describe !== "function") {
  throw new Error("缺少依赖。加载顺序：-l config.js -l lib/common.js -l scripts/start_activity.js");
}

function classNameOf(value) {
  if (value === null || value === undefined) {
    return "";
  }
  try {
    if (value.$className) {
      return String(value.$className);
    }
  } catch (e) {
  }
  try {
    return String(value.getClass().getName());
  } catch (e) {
    return "";
  }
}

function findByClass(args, className) {
  for (let i = 0; i < args.length; i++) {
    const name = classNameOf(args[i]);
    if (name === className || (className === "android.content.Context" && isContext(args[i]))) {
      return args[i];
    }
  }
  return null;
}

function isContext(value) {
  if (value === null || value === undefined) {
    return false;
  }
  try {
    const Context = Java.use("android.content.Context");
    return Context.class.isInstance(value);
  } catch (e) {
    return false;
  }
}

function shouldPrint(intent, who, prefix) {
  let component = null;
  try {
    component = intent.getComponent();
  } catch (e) {
    return false;
  }
  if (component !== null) {
    try {
      return inPackage(String(component.getPackageName()), prefix);
    } catch (e) {
      return false;
    }
  }
  if (!prefix) {
    return true;
  }
  if (who === null) {
    return false;
  }
  try {
    return String(who.getPackageName()) === prefix;
  } catch (e) {
    return false;
  }
}

function dumpIntent(intent) {
  const component = intent.getComponent();
  if (component !== null) {
    console.log("\n[start] " + component.flattenToShortString());
  } else {
    console.log("\n[start] action=" + intent.getAction() + " data=" + intent.getDataString());
  }
  const extras = intent.getExtras();
  if (extras === null) {
    return;
  }
  const get = Java.use("android.os.Bundle").get.overload("java.lang.String");
  const keys = extras.keySet().iterator();
  while (keys.hasNext()) {
    const key = keys.next();
    let value;
    try {
      value = get.call(extras, key);
    } catch (e) {
      value = "<" + e + ">";
    }
    console.log("  extra " + key + "=" + describe(value));
  }
}

Java.perform(function () {
  const prefix = cfg().packagePrefix;
  const Instrumentation = Java.use("android.app.Instrumentation");
  Instrumentation.execStartActivity.overloads.forEach(function (overload) {
    const types = overload.argumentTypes.map(function (type) {
      return type.className;
    });
    console.log("[start] hook execStartActivity(" + types.join(", ") + ")");
    overload.implementation = function () {
      const args = Array.prototype.slice.call(arguments);
      try {
        const intent = findByClass(args, "android.content.Intent");
        const who = findByClass(args, "android.content.Context");
        if (intent !== null && shouldPrint(intent, who, prefix)) {
          dumpIntent(intent);
        }
      } catch (e) {
        console.log("[start] " + e);
      }
      return overload.apply(this, arguments);
    };
  });
});

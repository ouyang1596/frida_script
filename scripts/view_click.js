// 挂钩 View.performClick，打印 view 类名、资源 id、文本和所在 Activity。
// 子类重写 performClick 且不调用 super 时，这次点击不会出现。
// 冷启动：frida -U -f com.vpb.popo -l config.js -l lib/common.js -l scripts/view_click.js
// 已启动：frida -U Tada -l config.js -l lib/common.js -l scripts/view_click.js

const { cfg, inPackage } = globalThis;
if (typeof cfg !== "function" || typeof inPackage !== "function") {
  throw new Error("缺少依赖。加载顺序：-l config.js -l lib/common.js -l scripts/view_click.js");
}

function isInstanceOf(obj, className) {
  try {
    let cls = obj.getClass();
    while (cls !== null) {
      if (String(cls.getName()) === className) {
        return true;
      }
      cls = cls.getSuperclass();
    }
  } catch (e) {
  }
  return false;
}

function resourceEntry(view) {
  let id = -1;
  try {
    id = view.getId();
  } catch (e) {
    return "";
  }
  if (id === -1) {
    return String(id);
  }
  try {
    return String(view.getResources().getResourceEntryName(id));
  } catch (e) {
    return String(id);
  }
}

function viewText(view) {
  if (isInstanceOf(view, "android.widget.TextView")) {
    try {
      const TextView = Java.use("android.widget.TextView");
      const text = Java.cast(view, TextView).getText();
      return text === null ? "" : String(text);
    } catch (e) {
      return "";
    }
  }
  try {
    const desc = view.getContentDescription();
    return desc === null ? "" : String(desc);
  } catch (e) {
    return "";
  }
}

function activityName(view) {
  let ctx = null;
  try {
    ctx = view.getContext();
  } catch (e) {
    return "";
  }
  for (let i = 0; i < 8 && ctx !== null; i++) {
    if (isInstanceOf(ctx, "android.app.Activity")) {
      try {
        return String(ctx.getClass().getName());
      } catch (e) {
        return "";
      }
    }
    if (!isInstanceOf(ctx, "android.content.ContextWrapper")) {
      break;
    }
    try {
      const ContextWrapper = Java.use("android.content.ContextWrapper");
      const next = Java.cast(ctx, ContextWrapper).getBaseContext();
      if (next === null || next.equals(ctx)) {
        break;
      }
      ctx = next;
    } catch (e) {
      break;
    }
  }
  return "";
}

function contains(value, needle) {
  if (!needle) {
    return true;
  }
  return String(value).indexOf(needle) >= 0;
}

function logClick(view, options) {
  const className = String(view.getClass().getName());
  const idName = resourceEntry(view);
  if (!contains(className, options.classContains) || !contains(idName, options.idContains)) {
    return;
  }
  const activity = activityName(view);
  if (!inPackage(activity, options.packagePrefix)) {
    return;
  }
  console.log("\n[click] " + className);
  console.log("  id=" + idName);
  console.log("  text=" + viewText(view));
  console.log("  activity=" + activity);
}

Java.perform(function () {
  const options = cfg();
  const View = Java.use("android.view.View");
  View.performClick.overloads.forEach(function (overload) {
    const types = overload.argumentTypes.map(function (type) {
      return type.className;
    });
    console.log("[click] hook View.performClick(" + types.join(", ") + ")");
    overload.implementation = function () {
      try {
        logClick(this, options);
      } catch (e) {
        console.log("[click] " + e);
      }
      return overload.apply(this, arguments);
    };
  });
});

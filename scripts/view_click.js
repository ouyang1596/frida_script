// 挂钩 View.performClick 和 AdapterView.performItemClick，打印 view 类名、资源 id、文本和所在 Activity。
// 子类重写这些方法且不调用 super 时，这次点击不会出现。
// 冷启动：frida -U -f com.vpb.popo -l config.js -l lib/common.js -l scripts/view_click.js
// 已启动：frida -U Tada -l config.js -l lib/common.js -l scripts/view_click.js

const { cfg, inPackage } = globalThis;
if (typeof cfg !== "function" || typeof inPackage !== "function") {
  throw new Error("缺少依赖。加载顺序：-l config.js -l lib/common.js -l scripts/view_click.js");
}

function isInstance(obj, javaClass) {
  if (obj === null || obj === undefined) {
    return false;
  }
  try {
    return javaClass.isInstance(obj);
  } catch (e) {
    return false;
  }
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

function viewText(view, TextView) {
  if (isInstance(view, TextView.class)) {
    try {
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

function activityName(view, types) {
  let ctx = null;
  try {
    ctx = view.getContext();
  } catch (e) {
    return "";
  }
  for (let i = 0; i < 8 && ctx !== null; i++) {
    if (isInstance(ctx, types.Activity.class)) {
      try {
        return String(ctx.getClass().getName());
      } catch (e) {
        return "";
      }
    }
    if (!isInstance(ctx, types.ContextWrapper.class)) {
      break;
    }
    try {
      const next = Java.cast(ctx, types.ContextWrapper).getBaseContext();
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

function contextPackage(view) {
  try {
    const ctx = view.getContext();
    if (ctx === null) {
      return "";
    }
    return String(ctx.getPackageName());
  } catch (e) {
    return "";
  }
}

function contains(value, needle) {
  if (!needle) {
    return true;
  }
  return String(value).indexOf(needle) >= 0;
}

function logClick(view, options, types, position) {
  const className = String(view.getClass().getName());
  const idName = resourceEntry(view);
  if (!contains(className, options.classContains) || !contains(idName, options.idContains)) {
    return;
  }
  const activity = activityName(view, types);
  if (!inPackage(activity, options.packagePrefix) && !inPackage(contextPackage(view), options.packagePrefix)) {
    return;
  }
  console.log("\n[click] " + className);
  console.log("  id=" + idName);
  console.log("  text=" + viewText(view, types.TextView));
  console.log("  activity=" + (activity || contextPackage(view)));
  if (position !== undefined && position !== null) {
    console.log("  position=" + position);
  }
}

function hookAll(method, label, onEnter) {
  method.overloads.forEach(function (overload) {
    const argTypes = overload.argumentTypes.map(function (type) {
      return type.className;
    });
    console.log("[click] hook " + label + "(" + argTypes.join(", ") + ")");
    overload.implementation = function () {
      try {
        onEnter(this, arguments);
      } catch (e) {
        console.log("[click] " + e);
      }
      return overload.apply(this, arguments);
    };
  });
}

Java.perform(function () {
  const options = cfg();
  const types = {
    TextView: Java.use("android.widget.TextView"),
    Activity: Java.use("android.app.Activity"),
    ContextWrapper: Java.use("android.content.ContextWrapper"),
  };
  hookAll(Java.use("android.view.View").performClick, "View.performClick", function (view) {
    logClick(view, options, types);
  });
  hookAll(Java.use("android.widget.AdapterView").performItemClick, "AdapterView.performItemClick", function (self, args) {
    const view = args[0];
    if (view === null || view === undefined) {
      return;
    }
    logClick(view, options, types, args.length > 1 ? args[1] : null);
  });
});

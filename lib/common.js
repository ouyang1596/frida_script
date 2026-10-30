// 供后续 -l 的脚本通过 globalThis 使用。必须在 config.js 之后加载。

globalThis.cfg = function cfg() {
  const c = globalThis.CONFIG;
  if (!c) {
    throw new Error("先加载 config.js：-l config.js -l lib/common.js -l scripts/<脚本>");
  }
  return c;
};

globalThis.inPackage = function inPackage(name, prefix) {
  if (!prefix) {
    return true;
  }
  return name === prefix || name.indexOf(prefix + ".") === 0;
};

globalThis.normalizeMethod = function normalizeMethod(name) {
  if (name === "<init>" || name === "$init") {
    return "$init";
  }
  if (name === "<clinit>" || name === "$clinit") {
    return "$clinit";
  }
  return name;
};

function clip(text) {
  if (text.length > 500) {
    return text.slice(0, 500) + "...(" + text.length + ")";
  }
  return text;
}

function describeBytes(value) {
  const length = value.length;
  const n = Math.min(length, 16);
  const hex = [];
  for (let i = 0; i < n; i++) {
    const h = (value[i] & 0xff).toString(16);
    hex.push(h.length === 1 ? "0" + h : h);
  }
  return "byte[" + length + "] " + hex.join(" ") + (length > n ? " ..." : "");
}

let arraysApi = null;

function describeArray(value) {
  let className = "";
  try {
    className = String(value.getClass().getName());
  } catch (e) {
    return null;
  }
  if (!className || className.charAt(0) !== "[") {
    return null;
  }
  if (className === "[B") {
    return describeBytes(value);
  }
  try {
    if (!arraysApi) {
      arraysApi = Java.use("java.util.Arrays");
    }
    const signature = className.charAt(1) === "L" || className.charAt(1) === "["
      ? "[Ljava.lang.Object;"
      : className;
    return clip(String(arraysApi.toString.overload(signature).call(arraysApi, value)));
  } catch (e) {
  }
  try {
    const length = value.length;
    const n = Math.min(length, 8);
    const parts = [];
    for (let i = 0; i < n; i++) {
      parts.push(String(value[i]));
    }
    return clip("[" + parts.join(", ") + (length > n ? ", ..." : "") + "]");
  } catch (e) {
    return null;
  }
}

globalThis.describe = function describe(value) {
  if (value === null || value === undefined) {
    return String(value);
  }
  try {
    const arrayText = describeArray(value);
    if (arrayText !== null) {
      return arrayText;
    }
  } catch (e) {
  }
  try {
    return clip(String(value));
  } catch (e) {
    return "<" + e + ">";
  }
};

globalThis.formatJavaStack = function formatJavaStack() {
  let backtraceError = null;
  try {
    const frames = Java.backtrace({ limit: 24 }).frames || [];
    if (frames.length > 0) {
      return frames.map(function (frame) {
        const file = frame.fileName ? (frame.fileName + ":" + frame.lineNumber) : "Native Method";
        return "  at " + frame.className + "." + frame.methodName + "(" + file + ")";
      }).join("\n");
    }
  } catch (e) {
    backtraceError = e;
  }
  try {
    const Log = Java.use("android.util.Log");
    const Throwable = Java.use("java.lang.Throwable");
    return Log.getStackTraceString(Throwable.$new());
  } catch (e2) {
    return "  (stack failed) " + (backtraceError || e2);
  }
};

globalThis.useClass = function useClass(className) {
  try {
    return Java.use(className);
  } catch (e) {
  }

  let loaders = [];
  try {
    loaders = Java.enumerateClassLoadersSync();
  } catch (e) {
    return null;
  }
  for (let i = 0; i < loaders.length; i++) {
    try {
      return Java.ClassFactory.get(loaders[i]).use(className);
    } catch (e) {
    }
  }
  return null;
};

globalThis.pickLoadClass = function pickLoadClass(ClassLoader) {
  const overloads = ClassLoader.loadClass.overloads;
  for (let i = 0; i < overloads.length; i++) {
    if (overloads[i].argumentTypes.length === 2) {
      return overloads[i];
    }
  }
  return overloads[0];
};

const pendingClasses = {};
const loadListeners = [];
let loadClassHooked = false;

function ensureLoadClassHook() {
  if (loadClassHooked) {
    return;
  }
  loadClassHooked = true;
  const ClassLoader = Java.use("java.lang.ClassLoader");
  const overload = globalThis.pickLoadClass(ClassLoader);
  overload.implementation = function () {
    const result = overload.apply(this, arguments);
    let name = "";
    try {
      name = arguments[0] === null || arguments[0] === undefined ? "" : String(arguments[0]);
    } catch (e) {
      return result;
    }
    const callback = pendingClasses[name];
    if (callback) {
      delete pendingClasses[name];
      try {
        callback(Java.ClassFactory.get(this).use(name));
      } catch (e) {
        console.log("[wait] " + name + " 挂钩失败: " + e);
      }
    }
    for (let i = 0; i < loadListeners.length; i++) {
      try {
        loadListeners[i](name);
      } catch (e) {
      }
    }
    return result;
  };
}

globalThis.watchLoadClass = function watchLoadClass(listener) {
  loadListeners.push(listener);
  ensureLoadClassHook();
};

globalThis.hookWhenLoaded = function hookWhenLoaded(className, onReady) {
  const existing = globalThis.useClass(className);
  if (existing) {
    onReady(existing);
    return;
  }
  pendingClasses[className] = onReady;
  ensureLoadClassHook();
  console.log("[wait] 等待类加载: " + className);
};

function dumpDeclared(cls) {
  try {
    const methods = cls.class.getDeclaredMethods();
    for (let i = 0; i < methods.length; i++) {
      console.log("  " + methods[i]);
    }
  } catch (e) {
    console.log("  (无法列出方法) " + e);
  }
}

function overloadEquals(types, wanted) {
  if (!wanted || !wanted.length) {
    return true;
  }
  if (types.length !== wanted.length) {
    return false;
  }
  for (let i = 0; i < types.length; i++) {
    if (types[i] !== wanted[i]) {
      return false;
    }
  }
  return true;
}

globalThis.hookMethod = function hookMethod(options) {
  const className = options.className;
  const methodName = globalThis.normalizeMethod(options.methodName);
  globalThis.hookWhenLoaded(className, function (cls) {
    const method = cls[methodName];
    if (!method || !method.overloads) {
      console.log("[hook] 没有这个方法: " + className + "." + methodName);
      dumpDeclared(cls);
      return;
    }

    let matched = 0;
    method.overloads.forEach(function (overload) {
      const types = overload.argumentTypes.map(function (type) {
        return type.className;
      });
      if (!overloadEquals(types, options.overload)) {
        return;
      }
      matched++;
      console.log("[hook] " + className + "." + methodName + "(" + types.join(", ") + ")");
      overload.implementation = function () {
        const args = Array.prototype.slice.call(arguments);
        console.log("\n[call] " + className + "." + methodName);
        if (options.printArgs) {
          args.forEach(function (arg, index) {
            console.log("  arg" + index + "=" + globalThis.describe(arg));
          });
        }
        let ret;
        try {
          ret = overload.apply(this, arguments);
          if (options.printReturn) {
            console.log("  ret=" + globalThis.describe(ret));
          }
          return ret;
        } finally {
          if (options.printJavaStack) {
            console.log(globalThis.formatJavaStack());
          }
        }
      };
    });

    if (matched === 0) {
      console.log("[hook] 重载不匹配，当前有:");
      method.overloads.forEach(function (overload) {
        const types = overload.argumentTypes.map(function (type) {
          return type.className;
        });
        console.log("  (" + types.join(", ") + ")");
      });
    }
  });
};

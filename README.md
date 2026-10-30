# frida_script

Android hook 模板，按本机 Frida 17 的 API 编写。改 `config.js` 里的包名和类名即可。

这些脚本用于分析你有权调试的应用。`enum_classes.js`、Java hook，以及还没加载到的 AndroidX Fragment，共用同一个 `ClassLoader.loadClass` 钩子，可以一起加载。一次加载多支脚本时日志会混在一起。

## 用法

先改 `config.js`：

- `packagePrefix`：枚举类，以及点击、跳转、生命周期的过滤前缀
- `className` / `methodName`：要挂钩的类和方法。构造方法写 `$init` 或 `<init>`
- `overload`：`null` 表示全部重载。要指定时写成 `["android.os.Bundle"]` 这种类型名
- `idContains` / `classContains`：点击脚本的资源 id、view 类名过滤。空字符串表示不过滤

PowerShell 里把 `<包名>` 换成应用包名。`-f` 冷启动应用，`-n` 附加到已经在跑的进程。

应用未启动：

```powershell
frida -U -f <包名> -l config.js -l lib/common.js -l scripts/enum_classes.js
frida -U -f <包名> -l config.js -l lib/common.js -l scripts/java_hook.js
frida -U -f <包名> -l config.js -l lib/common.js -l scripts/print_stack.js
frida -U -f <包名> -l config.js -l lib/common.js -l scripts/view_click.js
frida -U -f <包名> -l config.js -l lib/common.js -l scripts/start_activity.js
frida -U -f <包名> -l config.js -l lib/common.js -l scripts/lifecycle.js
```

应用已经启动：

```powershell
frida -U -n <进程名> -l config.js -l lib/common.js -l scripts/enum_classes.js
frida -U -n <进程名> -l config.js -l lib/common.js -l scripts/java_hook.js
frida -U -n <进程名> -l config.js -l lib/common.js -l scripts/print_stack.js
frida -U -n <进程名> -l config.js -l lib/common.js -l scripts/view_click.js
frida -U -n <进程名> -l config.js -l lib/common.js -l scripts/start_activity.js
frida -U -n <进程名> -l config.js -l lib/common.js -l scripts/lifecycle.js
```

## 脚本

| 脚本 | 作用 |
| --- | --- |
| `scripts/java_hook.js` | 挂钩指定 Java 方法，打印参数和返回值。类还没加载时会等到 `loadClass` |
| `scripts/print_stack.js` | 调用指定 Java 方法时打印参数、返回值和 Java 调用栈 |
| `scripts/enum_classes.js` | 列出 `packagePrefix` 下已加载的类。`dumpMethods: true` 时带方法签名；`watchFutureLoads: true` 时继续打印后续加载 |
| `scripts/view_click.js` | 挂钩 `View.performClick` 和 `AdapterView.performItemClick`，打印 view 类名、资源 id、文本和所在 Activity。`idContains`、`classContains` 留空则只按 `packagePrefix` 过滤 |
| `scripts/start_activity.js` | 挂钩 `Instrumentation.execStartActivity`，打印目标组件（没有组件时打印 action 和 data）、extras 以及 Java 调用栈 |
| `scripts/lifecycle.js` | 打印 `packagePrefix` 下 Activity 的 `onCreate`、`onResume`、`onPause`，以及 AndroidX / 框架 Fragment 的 `onResume`。AndroidX 还没加载时会等到 `loadClass` |

挂钩时选具体实现类。只挂接口或抽象类时，子类里的实现不一定会进这个 hook。点击和生命周期也一样：子类重写了对应方法且不调用 `super` 时，这次调用不会出现。

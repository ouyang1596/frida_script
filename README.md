# frida_script

Android hook 模板，按本机 Frida 17 的 API 编写。改 `config.js` 里的包名和类名即可。

这些脚本用于分析你有权调试的应用。一次只加载 `scripts/` 里的一个脚本：`enum_classes.js` 和 Java hook 都会替换 `ClassLoader.loadClass`，叠在一起会互相覆盖。

## 用法

先改 `config.js`：

- `packagePrefix`：枚举类时用的包名前缀
- `className` / `methodName`：要挂钩的类和方法。构造方法写 `$init` 或 `<init>`
- `overload`：`null` 表示全部重载。要指定时写成 `["android.os.Bundle"]` 这种类型名

PowerShell 里把 `<包名>` 换成应用包名。`-f` 冷启动应用，`-n` 附加到已经在跑的进程。

应用未启动：

```powershell
frida -U -f <包名> -l config.js -l lib/common.js -l scripts/enum_classes.js
frida -U -f <包名> -l config.js -l lib/common.js -l scripts/java_hook.js
frida -U -f <包名> -l config.js -l lib/common.js -l scripts/print_stack.js
```

应用已经启动：

```powershell
frida -U -n <进程名> -l config.js -l lib/common.js -l scripts/enum_classes.js
frida -U -n <进程名> -l config.js -l lib/common.js -l scripts/java_hook.js
frida -U -n <进程名> -l config.js -l lib/common.js -l scripts/print_stack.js
```

## 脚本

| 脚本 | 作用 |
| --- | --- |
| `scripts/java_hook.js` | 挂钩指定 Java 方法，打印参数和返回值。类还没加载时会等到 `loadClass` |
| `scripts/print_stack.js` | 调用指定 Java 方法时打印参数、返回值和 Java 调用栈 |
| `scripts/enum_classes.js` | 列出 `packagePrefix` 下已加载的类。`dumpMethods: true` 时带方法签名；`watchFutureLoads: true` 时继续打印后续加载 |

挂钩时选具体实现类。只挂接口或抽象类时，子类里的实现不一定会进这个 hook。

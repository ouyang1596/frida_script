// 目标进程用 frida -f / -n 指定。这里只填脚本内部要过滤、要挂钩的类。
// 多支脚本可以一起 -l。日志会混在一起，见 README。
globalThis.CONFIG = {
  // 枚举类用的包名前缀，不要带末尾点
  packagePrefix: "com.vpb.popo",

  // java_hook.js / print_stack.js
  className: "com.vpb.popo.aaspring.modulars.chat.activity.ChatActivity",
  methodName: "sendImageFile",
  // null 表示全部重载。类型名与 Frida argumentTypes.className 一致，
  // 例如 ["android.os.Bundle"]、["java.lang.String", "int"]、["[B"]
  overload: null,

  printArgs: true,
  printReturn: true,
  // java_hook.js 是否顺带打 Java 栈。print_stack.js 会强制打开。
  printJavaStack: false,

  // enum_classes.js
  dumpMethods: false,
  watchFutureLoads: true,

  // view_click.js。空字符串表示不过滤
  idContains: "",
  classContains: "",
};

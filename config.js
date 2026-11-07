// 目标进程用 frida -f / -n 指定。这里只填脚本内部要过滤、要挂钩的类。
// 多支脚本可以一起 -l。日志会混在一起，见 README。
globalThis.CONFIG = {
  // 包名前缀，不要带末尾点。
  // enum_classes.js 用来圈定要列出的类；
  // view_click.js、start_activity.js、lifecycle.js 用来过滤日志。
  packagePrefix: "com.vpb.popo",

  // java_hook.js / print_stack.js 要挂钩的类和方法。
  // 构造方法写 $init 或 <init>，静态初始化写 $clinit 或 <clinit>。
  className: "com.vpb.popo.aaspring.modulars.live.adapter.AutoLiveChatAdapter",
  methodName: "findRankLabel",
  // null 表示全部重载。要指定时，类型名与 Frida argumentTypes.className 一致，
  // 例如 ["android.os.Bundle"]、["java.lang.String", "int"]、["[B"]。
  overload: null,
  // null：实例和静态都挂。true 只挂静态，false 只挂实例。
  staticMethod: null,

  // java_hook.js：是否打印参数、返回值。print_stack.js 会强制打开这两项。
  printArgs: true,
  printReturn: true,
  // java_hook.js 是否顺带打 Java 栈。print_stack.js 会强制打开。
  printJavaStack: false,

  // enum_classes.js：true 时连方法签名一起列，false 只列类名。
  dumpMethods: false,
  // enum_classes.js：true 时继续打印之后 loadClass 进来的类。
  watchFutureLoads: true,

  // view_click.js：资源 id、view 类名的子串过滤。空字符串表示不过滤，只按 packagePrefix 收。
  idContains: "",
  classContains: "",
};

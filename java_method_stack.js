/**
 * 打印指定 Java/Kotlin 方法被调用时的 Java 调用堆栈，并继续执行原方法。
 *
 * 用法:
 *   frida -U -f com.vpb.popo -l java_method_stack.js
 *   frida -U Tada -l java_method_stack.js
 *
 * 修改下方 CONFIG 后重新加载。内部类名使用 $，例如 com.example.Foo$Bar。
 */

'use strict';

var CONFIG = {
    // 完整类名
    className: 'com.vpb.popo.aaspring.modulars.chat.activity.ChatActivity',
    // 方法名
    methodName: 'initView',
    // 重载签名。留空则挂钩全部重载。
    // 参数类型全名，逗号分隔，例如 "java.lang.String,int"
    signature: '',
    // 最多打印次数。0 表示不限制
    maxPrints: 0
};

var RETRY_MS = 200;
var TIMEOUT_MS = 30000;

var printCount = 0;
var limitNotified = false;

function normalizeSignature(signature) {
    if (!signature) {
        return '';
    }
    return signature.split(',').map(function (part) {
        return part.trim();
    }).filter(function (part) {
        return part.length > 0;
    }).join(',');
}

function overloadSignature(overload) {
    return overload.argumentTypes.map(function (type) {
        return type.className;
    }).join(',');
}

function displaySignature(signature) {
    return signature.length > 0 ? signature : '无参数';
}

function isClassNotFound(error) {
    return String(error).indexOf('ClassNotFoundException') !== -1;
}

function currentThreadName() {
    return Java.use('java.lang.Thread').currentThread().getName();
}

function javaStack() {
    var Exception = Java.use('java.lang.Exception');
    var Log = Java.use('android.util.Log');
    return String(Log.getStackTraceString(Exception.$new()));
}

function hookOverload(overload, signature) {
    overload.implementation = function () {
        try {
            var unlimited = CONFIG.maxPrints === 0;
            if (unlimited || printCount < CONFIG.maxPrints) {
                printCount += 1;
                console.log(
                    '\n========== stack #' + printCount + ' ==========\n' +
                    'class : ' + CONFIG.className + '\n' +
                    'method: ' + CONFIG.methodName + '(' + displaySignature(signature) + ')\n' +
                    'thread: ' + currentThreadName() + '\n' +
                    javaStack()
                );
            } else if (!limitNotified) {
                limitNotified = true;
                console.log('[stack] 已达到 maxPrints=' + CONFIG.maxPrints + '，后续调用不再打印');
            }
        } catch (error) {
            console.log('[stack] 打印堆栈失败: ' + error);
        }
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        return overload.apply(this, args);
    };
}

function hookMethod() {
    var clazz = Java.use(CONFIG.className);
    var method = clazz[CONFIG.methodName];
    if (method === undefined) {
        return {
            error: '方法不存在: ' + CONFIG.className + '.' + CONFIG.methodName
        };
    }

    var wanted = normalizeSignature(CONFIG.signature);
    var matched = [];
    var available = [];

    method.overloads.forEach(function (overload) {
        var signature = overloadSignature(overload);
        available.push(displaySignature(signature));
        if (!wanted || normalizeSignature(signature) === wanted) {
            matched.push({
                overload: overload,
                signature: signature
            });
        }
    });

    if (matched.length === 0) {
        return {
            error: '没有匹配的重载: ' + CONFIG.className + '.' + CONFIG.methodName +
                '(' + wanted + ')\n已有重载:\n  ' + available.join('\n  ')
        };
    }

    matched.forEach(function (item) {
        hookOverload(item.overload, item.signature);
        console.log(
            '[stack] 已挂钩 ' + CONFIG.className + '.' + CONFIG.methodName +
            '(' + displaySignature(item.signature) + ')'
        );
    });

    return {};
}

function watchUntilHooked() {
    var startedAt = Date.now();
    var state = 'waiting';

    function attempt() {
        if (state !== 'waiting') {
            return;
        }
        state = 'working';
        try {
            var result = hookMethod();
            state = 'done';
            if (result.error) {
                console.log('[stack] ' + result.error);
            }
        } catch (error) {
            var timedOut = Date.now() - startedAt >= TIMEOUT_MS;
            if (!isClassNotFound(error) || timedOut) {
                state = 'done';
                var reason = timedOut && isClassNotFound(error)
                    ? '等待类加载超时: ' + CONFIG.className
                    : '挂钩失败: ' + error;
                console.log('[stack] ' + reason);
                return;
            }
            state = 'waiting';
        }
    }

    var timer = setInterval(function () {
        Java.perform(function () {
            attempt();
            if (state === 'done') {
                clearInterval(timer);
            }
        });
    }, RETRY_MS);

    attempt();
    if (state === 'done') {
        clearInterval(timer);
    }
}

Java.perform(function () {
    if (!CONFIG.className || !CONFIG.methodName) {
        console.log('[stack] 请先在脚本顶部填写 className 和 methodName');
        return;
    }
    console.log('[stack] 等待类加载: ' + CONFIG.className + '.' + CONFIG.methodName);
    watchUntilHooked();
});

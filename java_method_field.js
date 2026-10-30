/**
 * 挂钩指定 Java/Kotlin 方法，读取当前对象 this 上的实例字段并打印，然后继续执行原方法。
 *
 * 用法:
 *   frida -U -f com.vpb.popo -l java_method_field.js
 *   frida -U Tada -l java_method_field.js
 *
 * 修改下方 CONFIG 后重新加载。内部类名使用 $，例如 com.example.Foo$Bar。
 * 父类或 private 字段会沿继承链反射读取。
 */

'use strict';

var CONFIG = {
    // 完整类名
    className: 'com.vpb.popo.aaspring.modulars.chat.activity.ChatActivity',
    // 方法名
    methodName: 'onKeyboardHeightChanged',
    // 重载签名。留空则挂钩全部重载。
    // 参数类型全名，逗号分隔，例如 "java.lang.String,int"
    signature: '',
    // this 上的实例字段名
    fieldName: 'mKeyboardBaseOffset',
    // enter：进入时；leave：原方法正常返回后；both：两次都读
    when: 'both',
    // 最多打印次数。0 表示不限制
    maxPrints: 0
};

var RETRY_MS = 200;
var TIMEOUT_MS = 30000;

var PRIMITIVE_ARRAYS = {
    '[Z': '[Z',
    '[B': '[B',
    '[C': '[C',
    '[S': '[S',
    '[I': '[I',
    '[J': '[J',
    '[F': '[F',
    '[D': '[D'
};

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

function isNoSuchField(error) {
    return String(error).indexOf('NoSuchFieldException') !== -1;
}

function currentThreadName() {
    return Java.use('java.lang.Thread').currentThread().getName();
}

function wants(phase) {
    return CONFIG.when === phase || CONFIG.when === 'both';
}

function takePrintSlot() {
    var unlimited = CONFIG.maxPrints === 0;
    if (unlimited || printCount < CONFIG.maxPrints) {
        printCount += 1;
        return printCount;
    }
    if (!limitNotified) {
        limitNotified = true;
        console.log('[field] 已达到 maxPrints=' + CONFIG.maxPrints + '，后续调用不再打印');
    }
    return 0;
}

function arrayToString(value) {
    var Arrays = Java.use('java.util.Arrays');
    var typeName = String(value.getClass().getName());
    var overloadName = PRIMITIVE_ARRAYS[typeName];
    if (overloadName) {
        return String(Arrays.toString.overload(overloadName).call(Arrays, value));
    }
    var objectArray = Java.cast(value, Java.use('[Ljava.lang.Object;'));
    return String(Arrays.toString.overload('[Ljava.lang.Object;').call(Arrays, objectArray));
}

function formatValue(value) {
    if (value === null || value === undefined) {
        return 'null';
    }
    if (typeof value !== 'object') {
        return String(value);
    }
    if (value.getClass().isArray()) {
        return arrayToString(value);
    }
    var JString = Java.use('java.lang.String');
    return String(JString.valueOf.overload('java.lang.Object').call(JString, value));
}

function runtimeTypeOf(value) {
    if (value === null || value === undefined) {
        return 'null';
    }
    if (typeof value !== 'object') {
        return typeof value;
    }
    return String(value.getClass().getName());
}

function lookupField(instance) {
    var clazz = instance.getClass();
    while (clazz !== null && clazz !== undefined) {
        try {
            var field = clazz.getDeclaredField(CONFIG.fieldName);
            field.setAccessible(true);
            return field;
        } catch (error) {
            if (!isNoSuchField(error)) {
                throw error;
            }
            clazz = clazz.getSuperclass();
        }
    }
    return null;
}

function describeField(instance) {
    var field = lookupField(instance);
    if (field === null) {
        return {
            error: '字段不存在: ' + CONFIG.fieldName
        };
    }
    var value = field.get(instance);
    return {
        declaringClass: String(field.getDeclaringClass().getName()),
        runtimeType: runtimeTypeOf(value),
        valueText: formatValue(value)
    };
}

function report(instance, signature, phase) {
    try {
        var slot = takePrintSlot();
        if (!slot) {
            return;
        }
        var described = describeField(instance);
        if (described.error) {
            console.log('[field] #' + slot + ' ' + phase + ' ' + described.error);
            return;
        }
        console.log(
            '\n========== field #' + slot + ' ' + phase + ' ==========\n' +
            'class : ' + CONFIG.className + '\n' +
            'method: ' + CONFIG.methodName + '(' + displaySignature(signature) + ')\n' +
            'thread: ' + currentThreadName() + '\n' +
            'field : ' + CONFIG.fieldName + '\n' +
            'decl  : ' + described.declaringClass + '\n' +
            'type  : ' + described.runtimeType + '\n' +
            'value : ' + described.valueText
        );
    } catch (error) {
        console.log('[field] 读取失败 ' + phase + ': ' + error);
    }
}

function hookOverload(overload, signature) {
    overload.implementation = function () {
        if (wants('enter')) {
            report(this, signature, 'enter');
        }
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
        var result = overload.apply(this, args);
        if (wants('leave')) {
            report(this, signature, 'leave');
        }
        return result;
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
            '[field] 已挂钩 ' + CONFIG.className + '.' + CONFIG.methodName +
            '(' + displaySignature(item.signature) + ') field=' + CONFIG.fieldName +
            ' when=' + CONFIG.when
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
                console.log('[field] ' + result.error);
            }
        } catch (error) {
            var timedOut = Date.now() - startedAt >= TIMEOUT_MS;
            if (!isClassNotFound(error) || timedOut) {
                state = 'done';
                var reason = timedOut && isClassNotFound(error)
                    ? '等待类加载超时: ' + CONFIG.className
                    : '挂钩失败: ' + error;
                console.log('[field] ' + reason);
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
    if (!CONFIG.className || !CONFIG.methodName || !CONFIG.fieldName) {
        console.log('[field] 请先在脚本顶部填写 className、methodName 和 fieldName');
        return;
    }
    if (CONFIG.when !== 'enter' && CONFIG.when !== 'leave' && CONFIG.when !== 'both') {
        console.log('[field] when 只能是 enter、leave 或 both');
        return;
    }
    console.log(
        '[field] 等待类加载: ' + CONFIG.className + '.' + CONFIG.methodName +
        ' field=' + CONFIG.fieldName
    );
    watchUntilHooked();
});

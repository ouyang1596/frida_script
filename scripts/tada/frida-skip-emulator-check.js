'use strict';

/**
 * Release 包在模拟器上跳过 EmulatorCheckUtil 拦截。
 * mapping.txt 中类名、方法名均未混淆：
 *   com.vpb.popo.utils.EmulatorCheckUtil.checkAndShowDialog() -> checkAndShowDialog
 *   boolean isEmulator() -> isEmulator
 *   access$isEmulator$cp / access$setEmulator$cp 保持原名
 *   com.snail.antifake.jni.EmulatorDetectUtil.isEmulatorFromAll(Context) 保持原名
 *
 * 闪屏 BaseSplashFragment.tryJumpToNextActivity 和 MainActivity.onResume
 * 读的是 isEmulator()，只让 checkAndShowDialog 空返回还不够，标志位也要保持 false。
 * 冷启动：frida -D emulator-5554 -f com.vpb.popo -l scripts/tada/frida-skip-emulator-check.js
 */

function hookOverloads(clazz, methodName, impl) {
    var method = clazz[methodName];
    if (!method) {
        console.log('[emu] missing ' + clazz.$className + '.' + methodName);
        return;
    }
    method.overloads.forEach(function (ov) {
        ov.implementation = impl;
        console.log('[emu] hooked ' + clazz.$className + '.' + methodName + '(' + ov.argumentTypes.map(function (t) {
            return t.className;
        }).join(',') + ')');
    });
}

function clearEmulatorFields(className) {
    var clazz = Java.use(className).class;
    var fields = clazz.getDeclaredFields();
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var name = field.getName();
        if (name.toLowerCase().indexOf('emulator') < 0) {
            continue;
        }
        field.setAccessible(true);
        try {
            field.setBoolean(null, false);
            console.log('[emu] ' + className + '.' + name + ' = false');
        } catch (e) {
            console.log('[emu] skip field ' + name + ': ' + e);
        }
    }
}

Java.perform(function () {
    var Check = Java.use('com.vpb.popo.utils.EmulatorCheckUtil');

    hookOverloads(Check, 'checkAndShowDialog', function () {
        console.log('[emu] checkAndShowDialog skipped');
    });

    hookOverloads(Check, 'isEmulator', function () {
        return false;
    });

    hookOverloads(Check, 'access$isEmulator$cp', function () {
        return false;
    });

    hookOverloads(Check, 'access$setEmulator$cp', function () {
    });

    hookOverloads(Check, 'showEmulatorDialog', function () {
        console.log('[emu] showEmulatorDialog skipped');
    });

    var Companion = Java.use('com.vpb.popo.utils.EmulatorCheckUtil$Companion');
    hookOverloads(Companion, 'isEmulator', function () {
        return false;
    });

    clearEmulatorFields('com.vpb.popo.utils.EmulatorCheckUtil');
    clearEmulatorFields('com.vpb.popo.utils.EmulatorCheckUtil$Companion');

    var Detect = Java.use('com.snail.antifake.jni.EmulatorDetectUtil');
    hookOverloads(Detect, 'isEmulatorFromAll', function () {
        return false;
    });

    console.log('[emu] installed');
});

/**
 * Created by coreyou on 2016/7/10.
 *
 * Classical模式#5：暫時的建構式 / 聖杯(Holy Grail)繼承模式
 * 1. 打斷父原型和子原型間的直接連結。
 * 2. 受益於原型鏈的優點。
 */
// 實作泛用的繼承函式(避免每次都要重新建立proxy建構式，所以使用立即函式，把proxy存在closure)
var inherit = (function() {
    // 1. 使用空函式做為父子建構式之間的代理(proxy)
    var Proxy = function() {};

    return function(C, P) {
        // 2. 原型鏈: 父-代理-子
        Proxy.prototype = P.prototype;
        C.prototype = new Proxy();
        // 3. 設定一個uper成員指向父prototype(uper是super的意思，避免保留字衝突)
        C.uper = P.prototype;
        // 4. 重設建構式的參考，如果不重設的話，C.prototype.constructor會回傳P
        C.prototype.constructor = C;
    }
}());

// 父建構式:
function Parent(name) {
    this.name = name || 'Adam';
}
Parent.prototype.say = function() { // 在原型中新增功能
    return this.name;
};

// 空的子建構式
function Child() {}

// 繼承
inherit(Child, Parent);

/*
    測試:
    ┌─────────────┐
    │new Parent() │
    ├=============┤        ┌──────────────────┐        ┌──────────────┐        ┌──────────────┐
    │ name = Adam │   ┌--> │ Parent.prototype │ <--┐   │ new Proxy()  │ <--┐   │ new Child()  │
    ├─────────────┤   │    ├──────────────────┤    │   ├==============┤    │   ├──────────────┤
    │ _proto_     │---┘    │ say()            │    └---│ _proto_      │    └---│ _proto_      │
    └─────────────┘        └──────────────────┘        └──────────────┘        └──────────────┘
 */
var kid = new Child();
console.log(kid.say()); // undefined, 因為沒有繼承到name, 但是有從繼承鏈中取得say()
console.log(kid.constructor.name);  // "Child"
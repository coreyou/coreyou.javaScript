/**
 * Created by coreyou on 2016/7/10.
 *
 * Classical模式#4：分享原型
 * 經驗法則是，可以重用的成員都應該放在原型裡，不應該放在this裡，
 * 所以任何值得繼承的事物都應該放在原型中，
 * 可以將子建構式的原型設為和父建構式的原型相同。
 * 1. 優點是更快速的原型鏈查詢。
 * 2. 缺點是修改了繼承鏈的某處，所有繼承鏈上的物件都會被影響。
 */
// 實作泛用的繼承函式(子建構式prototype指向父物件)
function inherit(C, P) {
    C.prototype = P.prototype;
}

// 父建構式:
function Parent(name) {
    this.name = name || 'Adam';
}
Parent.prototype.say = function() { // 在原型中新增功能
    return this.name;
};

// 空的子建構式
function Child(name) {}

// 繼承
inherit(Child, Parent);

/*
    測試:
    ┌─────────────┐
    │new Parent() │
    ├=============┤        ┌──────────────────┐        ┌──────────────┐
    │ name = Adam │   ┌--> │ Parent.prototype │ <--┐   │ new Child()  │
    ├─────────────┤   │    ├──────────────────┤    │   ├──────────────┤
    │ _proto_     │---┘    │ say()            │    └---│ _proto_      │
    └─────────────┘        └──────────────────┘        └──────────────┘
 */
var kid = new Child();
console.log(kid.say()); // undefined, 因為沒有繼承到name
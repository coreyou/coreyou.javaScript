/**
 * Created by coreyou on 2016/7/10.
 *
 * Classical模式#1：類別模式，實作繼承。
 * 缺點:
 * 1. 同時繼承了this上本身的屬性和原型的屬性，但大多時候是不需要本身的屬性，只想要prototype上的。
 * 2. 繼承函式inherit()有一個缺點，無法傳遞參數給子建構式再傳遞參數給父建構式。
 * Classical模式#2會以借用建構式的方式改進第2個缺點
 */
// 實作泛用的繼承函式(子建構式prototype指向父物件)
function inherit(C, P) {
    C.prototype = new P();
}

/*
    父建構式:
    ┌─────────────┐
    │new Parent() │
    ├=============┤        ┌──────────────────┐
    │ name = Adam │   ┌--> │ Parent.prototype │
    ├─────────────┤   │    ├──────────────────┤
    │ _proto_     │---┘    │ say()            │
    └─────────────┘        └──────────────────┘
 */
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
    測試: say()透過原型鏈追蹤到Parent.prototype，name透過原型鏈追蹤到Parent物件
                          ┌─────────────┐
                     ┌--> │new Parent() │
    ┌─────────────┐  │    ├=============┤        ┌──────────────────┐
    │new Child()  │  │    │ name = Adam │   ┌--> │ Parent.prototype │
    ├=============┤  │    ├─────────────┤   │    ├──────────────────┤
    │ _proto_     │--┘    │ _proto_     │---┘    │ say()            │
    └─────────────┘       └─────────────┘        └──────────────────┘
 */
var kid = new Child();
console.log(kid.say()); // Adam
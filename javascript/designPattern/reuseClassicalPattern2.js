/**
 * Created by coreyou on 2016/7/10.
 *
 * Classical模式#2：借用建構式
 * 1. 子物件可以取得繼承的成員的複製，而非參考。
 * 2. 解決了子建構式傳遞參數給父建構式的問題。
 * 3. 模式#1修改prototype參考到的屬性時，會連帶修改到父物件；模式#2修改屬性時，不會影響到父物件，因為是一個獨立的複製。
 * 4. 缺點是父建構式的prototype都沒有繼承到。
 */
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
var p = new Parent();

// 子建構式
function Child1() {}
Child1.prototype = p;   // Classical模式#1
var c1 = new Child1();  // c1如果修改name屬性，會連帶修改p的name屬性，因為是使用參考，所以p和c1的name是參考到一樣的位置。

/*
 借用建構式模式的子建構式: Classical模式#2
 ┌──────────────────────┐
 │new Parent("Coreyou") │
 ├======================┤        ┌──────────────────┐
 │ name = Coreyou       │   ┌--> │ Child.prototype  │
 ├──────────────────────┤   │    ├──────────────────┤
 │ _proto_              │---┘    │ say()            │
 └──────────────────────┘        └──────────────────┘
 */
function Child(name) {
    Parent.apply(this, arguments);
}
var c2 = new Child("Coreyou");  // c2如果修改name屬性，不會連帶修改p的name屬性，因為是使用獨立的複製物件。

console.log(p.hasOwnProperty('name'));  // true
console.log(c1.hasOwnProperty('name')); // false, 本身並沒有取得成員，而是使用原型參考
console.log(c2.hasOwnProperty('name')); // true, 取得繼承成員的複製
console.log(c2.name);           // "Coreyou"
console.log(typeof c2.say());   // undefined, 因為只有複製到父建構式的自身屬性，而_proto_的連結沒有保留
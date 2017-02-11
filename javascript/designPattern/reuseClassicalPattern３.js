/**
 * Created by coreyou on 2016/7/10.
 *
 * Classical模式#３：先借用建構式，也將子建構式的原型指向父建構的新實體
 * 1. 子建構式取得了父建構式自身成員的複製(修改自身屬性很安全，不會影響到父建構適中的屬性)。
 * 2. 子建構式取得了父建構式原型成員的參考。
 * 3. 子建構式可以傳遞參數給父建構式。
 * 4. 缺點是呼叫了兩次父建構式，效率較差，且自身屬性被繼承了兩次。
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

// 子建構式
function Child(name) {
    Parent.apply(this, arguments);
}
Child.prototype = new Parent();

/*
 測試:


 ┌────────────────────┐       ┌─────────────┐
 │new Child("Coreyou")│  ┌--> │new Parent() │
 ├====================┤  │    ├=============┤        ┌──────────────────┐
 │ name = Coreyou     │  │    │ name = Adam │   ┌--> │ Parent.prototype │
 ├────────────────────┤  │    ├─────────────┤   │    ├──────────────────┤
 │ _proto_            │--┘    │ _proto_     │---┘    │ say()            │
 └────────────────────┘       └─────────────┘        └──────────────────┘
 */
var c = new Child("Coreyou");

console.log(c.name);  // "Coreyou"
console.log(c.say()); // "Coreyou"
delete c.name;        // 若刪除了自身的複本，原型鍊中的下一個屬性就會亮起
console.log(c.say()); // "Adam"
/**
 * Created by coreyou on 2016/7/8.
 *
 * Public Static Member: 使用建構式，新增屬性到建構式
 * 比較一般方法和靜態方法的差別，要小心使用靜態方法中的this，
 * 在靜態方法中的this會指向Gadget建構式；在一般方法中的this會指向呼叫的實體
 */
// 建構式
var Gadget = function(price) {
    this.price = price;
};

// 一個靜態方法(可以直接透過建構式呼叫)，在isShiny()中的this會指向Gadget建構式
Gadget.isShiny = function() {
    var msg = "you bet";

    // 只有在使用實體(非靜態)呼叫的時候才會有作用
    if (this instanceof Gadget) {
        msg += ", it costs $" + this.price + "!";
    }
    return msg;
};
console.log(Gadget.isShiny());  // you bet
//console.log(typeof Gadget.setPrice());   // undefined, 不能用靜態的方式呼叫實體方法

// 加在原型中的一般方法(一般的方法必須要有實體才能呼叫)，在setPrice()中的this會指向呼叫的實體
Gadget.prototype.setPrice = function(price) {
    this.price = price;
};
var iphone = new Gadget();
iphone.setPrice(5000);
//console.log(typeof iphone.isShiny());    // undefined, 不能用實體來呼叫靜態方法

// 有時候讓靜態方法也能透過實體來使用會很方便，這裡在原型中加入一個方法當作靜態方法的外觀(facade)
Gadget.prototype.isShiny = Gadget.isShiny;
//Gadget.prototype.isShiny = function() {   // 等同上面那行
//    return Gadget.isShiny.call(this);
//};
//console.log(iphone.isShiny());  // you bet, it costs $5000!

console.log(Gadget.isShiny());   // you bet

var a = new Gadget('399.99');
console.log(a.isShiny()); // you bet, it costs $399.99!
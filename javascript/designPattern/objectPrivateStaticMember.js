/**
 * Created by coreyou on 2016/7/9.
 *
 * Private 靜態成員:
 * 1.所有由同一個建構式建立的物件之間，都可以共享的成員。
 * 2.在建構式之外不可以存取的成員。
 *
 * 使用立即函式建立Closure來容納private member，
 * 再使用特權方法來存取靜態的private屬性。
 */
var Gadget = (function() {
    // 靜態屬性
    var counter = 0,
        NewGadget;

    // 建構式的新實作
    NewGadget = function() {
        counter += 1;
    };

    // 特權方法
    NewGadget.prototype.getLastId = function() {
        return counter;
    };

    // 複寫原本的建構式
    return NewGadget;
}());

var g1 = new Gadget();
console.log(g1.getLastId());    // 1
var g2 = new Gadget();
console.log(g2.getLastId());    // 2
var g3 = new Gadget();
console.log(g3.getLastId());    // 3


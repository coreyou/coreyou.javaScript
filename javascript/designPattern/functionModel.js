/**
 * Created by coreyou on 2016/3/21.
 */
function foo() {}    // 宣告式(不需要分號)
var bar = function() {};    // 表示式(匿名函式)
var baz = function baz() {};    // 具名表示式

// 函式的name屬性
console.log(foo.name);  // foo
console.log(bar.name);  // 空值
console.log(baz.name);  // baz
console.log("===================");

// 函式的Hoisting: 函式中的所有變數宣告都會在幕後被提升到函式的最前端
function hoist() {
    console.log("global hoist");
}
function hoist2() {
    console.log("global hoist2");
}

function hoistMe() {
    console.log(typeof hoist);  // "function"
    console.log(typeof hoist2); // "undefined"

    hoist();    // "local hoist"
    //hoist2();   // TypeError: hoist2 is not yet a function

    // 函式宣告式: 變數hoist、內容實作都會被提升到最前面
    function hoist() {
        console.log("local hoist");
    }

    // 函式表示式: 只有變數hoist2被提升，實作沒有被提升
    var hoist2 = function() {
        console.log("local hoist2");
    };
}
hoistMe();
console.log("===================");

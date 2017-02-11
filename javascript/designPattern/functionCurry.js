/**
 * Created by coreyou on 2016/4/5.
 *
 * Curry又稱為Schonfinkelize(發明者是Moses Schonfinkel):
 * 可接受只傳遞部分的參數
 */
function add(x, y) {
    if (typeof y === "undefined") {
        return function(y) {
            return x + y;
        };
    }
    return x + y;
}

console.log(typeof add(5));  // function
console.log(add(3)(4)); // 7, 3會被存在Closure

var add2000 = add(2000);    // function(y) {return 2000+y;};
console.log(add2000(10));   // 2010

// 泛用型Currying函式
function schonfinkelize(fn) {
    var slice = Array.prototype.slice,
        stored_args = slice.call(arguments, 1); // 切掉陣列第一個元素，回傳後面的陣列，因為第一個元素是要執行的函式，後面才是參數群
    return function() {
        var new_args = slice.call(arguments),   // 單純陣列化
            args = stored_args.concat(new_args);
        return fn.apply(null, args);    // 回傳 fn(args)
    };
}

function normalAdd(x, y) {
    return x + y;
}
// Currying
var newAdd = schonfinkelize(normalAdd, 5);  // ５會被存到stored_args
console.log(newAdd(4)); // 4會被存到new_args裡面，然後args會是[5, 4]，所以最後算出來是5+4=9
console.log(schonfinkelize(normalAdd, 6)(7));   // 13
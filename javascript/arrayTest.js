/**
 * Created by coreyou on 2016/3/18.
 */
// 建立陣列不建議使用new Array，而建議使用陣列實字[]
var a = ["a", "b", "c"];
var b = new Array(3);   // 宣告陣列長度
// 判斷是不是array不能使用typeOf，因為會回傳object
console.log(Array.isArray(a));  // true
console.log(typeof a);  // object
console.log(a.join('='));   // a=b=c
// 如果環境不能使用typeOf，可以呼叫Object.prototype.toString()來檢查
if(typeof Array.isArray === "undefined") {
    Array.isArray = function(arg) {
        // 陣列toString會印出[object Array]，如果是物件toString會印出[object Object]
        return Object.prototype.toString.call(arg) === "[object Array]";
    };
}

/**
 * Created by coreyou on 2016/4/2.
 *
 * 記憶模式:
 * 函式也是物件，所以我們可以隨時為函式增加自訂屬性，
 * 一種自訂屬性的使用案例是用它來快取函式的運算結果(回傳值)，就不用反覆執行繁複的運算。
 */
var myFunc = function(param) {  //  只接受一個原始型別的參數param
    if (!myFunc.cache[param]) {
        var result = {};
        // ...繁重的運算...
        myFunc.cache[param] = result;   // myFunc建立一個cache屬性，cache屬性是一個物件，用傳入的param當鍵值，取得對應的回傳結果
    }
    return myFunc.cache[param];
};
myFunc.cache = {};  // 快取的儲存

/*
 * 如果有更複雜或更多的參數，可以將參數序列化
*/
var myFunc2 = function() {
    // 把arguments陣列轉換成物件JSON字串，來當作鍵值
    var cacheKey = JSON.stringify(Array.prototype.slice.call(arguments)),
        result;

    if (!myFunc2.cache[cacheKey]) {
        result = {};
        // ...繁重的運算...
        myFunc2.cache[cacheKey] = result;
    }
    return myFunc2.cache[cacheKey];
};
myFunc2.cache = {};  // 快取的儲存

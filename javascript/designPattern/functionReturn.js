/**
 * Created by coreyou on 2016/3/23.
 *
 * 回傳函式
 */
var setup = function() {    // setup()包裝了回傳函式，這樣會產生一個closure閉包，可以用這個閉包儲存private資料
    var count = 0;  // private資料，只能被回傳的函式存取，外面的程式碼無法存取
    console.log("只被呼叫一次: " + count);
    return function() {
        console.log("回傳函式運算前: " + count);
        return (count += 1);
    };
};

console.log("宣告next前");
var next = setup(); // 只被呼叫一次: 0
console.log("宣告next後");
// 後面感覺只有單純在操作回傳函式
next(); // 回傳函式運算前: 0
next(); // 回傳函式運算前: 1
next(); // 回傳函式運算前: 2
next(); // 回傳函式運算前: 3

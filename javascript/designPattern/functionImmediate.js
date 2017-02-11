/**
 * Created by coreyou on 2016/3/26.
 *
 * Immediate Function Pattern(self-invoking, self-executing):
 * 1. 利用函式表示式來定義，不能用函式宣告式
 * 2. 函式最後加上括號會讓函式立即執行
 * 3. 如果不將函式傳給一個變數，則需要將函式用括號包起來
 * 4. 提供初始化的作用域沙盒，例如: 附加事件處理器、建立物件等等只須執行一次的工作，不需要去建立一個重複使用的具名函式，變數會留在區域作用域，不會洩露到全域作用域
 */
/*
 * 定義後立即執行
 * 以下兩種都可以
 * (function() {...}());
 * (function() {...})();
 */
(function() {
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        today = new Date(),
        msg = 'Today is ' + days[today.getDay()] + ', ' + today.getDate();

    console.log("函式定義後會立即執行: " + msg);
}());

/*
 * 立即函式的參數
 */
(function(who, when) {   // 也可以傳參數
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        msg = 'Today is ' + days[when.getDay()] + ', ' + when.getDate() + ', name: ' + who;

    console.log("函式定義後會立即執行: " + msg);
}('Apple', new Date()));

function func(a, b, c) {}
console.log(func.length);   // 印出參數數量:3


/*
 * 立即函式的回傳值
 */
var getResult = (function() {
    var result = 2 + 2;
    return function() { // 回傳值是一個函式，getResult是指向這個function
        return result;
    };
}());
console.log("getResult= " + getResult + ", getResult type= " + typeof getResult);

/*
 * 物件屬性
 */
var o = {
    message: (function() {  // message屬性的型態是字串，而不是函式
        var who = "Apple",
            what = "plant";
        return what + " " + who;
    }()),
    getMsg: function() {
        return this.message;
    }
};
console.log("o.getMsg()= " + o.getMsg() + ", getMsg type= " + typeof o.getMsg());
console.log("o.message= " + o.message + "message type= " + typeof o.message);

/*
 * 立即物件初始化
 * 以下兩種都可以
 * ({...}).init();
 * ({...}.init());
 */
({
    // 組態常數
    maxWidth: 600,
    maxHeight: 400,

    // 工具方法(utility methods)
    gimmeMax: function() {
        return this.maxWidth + "x" + this.maxHeight;
    },

    // 初始化
    init: function() {
        console.log(this.gimmeMax());
        // 這個物件在init()完成以後不再存取，如果要保留物件的參考可以回傳this
        // return this;
    }
}).init();
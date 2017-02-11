/**
 * Created by coreyou on 2016/6/22.
 *
 * 揭露模式：將private方法揭露成public方法
 * 這裡在立即函式的最後，把兩個private函式揭露為public函式，
 * indexOf這個函式揭露了兩次，當indexOf和inArray其中一個出了問題的時候，
 * 由於private部分是安全的，所以可以拿另外一個沒有問題的public function繼續使用。
 */
var myarray;

(function () {
    var astr = "[object Array]",
        toString = Object.prototype.toString;

    function isArray(a) {   // private function
        return toString.call(a) === astr;
    }

    function indexOf(haystack, needle) {    // private function
        var i = 0,
            max = haystack.length;

        for(; i < max; i++) {
            if (haystack[i] === needle) {
                return i;
            }
        }
        return -1;
    }

    myarray = { // reveal to be public function
        isArray: isArray,
        indexOf: indexOf,
        inArray: indexOf
    };
}());

console.log(myarray.isArray([1, 2]));    // true
console.log(myarray.isArray({0: 1}));    // false
console.log(myarray.indexOf(["a", "b", "z"], "z"));  // 2
console.log(myarray.inArray(["a", "b", "z"], "z"));  // 2

// 當indexOf和inArray其中一個出了問題的時候，由於private部分是安全的，所以可以拿另外一個沒有問題的public function繼續使用。
myarray.indexOf = null;
console.log(myarray.inArray(["a", "b", "z"], "z"));  // 2
console.log(myarray.indexOf(["a", "b", "z"], "z"));  // error!
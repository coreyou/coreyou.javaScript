/**
 * Created by coreyou on 2016/6/26.
 *
 * 產生建構式的模組模式
 */
MYAPP.generalNamespace('MYAPP.utilities.array');

MYAPP.utilities.array = (function() {

    // 宣告相依性(把有相依性的模組宣告在頂端)
    var uobj = MYAPP.utilities.object,
        ulang = MYAPP.utilities.lang,

    // private properties
        Constr;

    // 可選擇的一次性初始程序
    // ...

    // public API 建構式
    Constr = function(o) {
        this.elements = this.toArray(o);
    };
    // public API 原型
    Constr.prototype = {
        constructor: MYAPP.utilities.array,
        version: "2.0",
        toArray: function(obj) {
            for (var i = 0, a = [], len = obj.length; i < len; i++) {
                a[i] = obj[i];
            }
            return a;
        }
    };

    // 回傳建構式
    return Constr;
}());

// 使用方式如下
//var arr = new MYAPP.utilities.Array(obj);
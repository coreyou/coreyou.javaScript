/**
 * Created by coreyou on 2016/6/25.
 *
 * 模組模式：命名空間 + 立即函式(建立模組的特權方法) + Private成員和特權方法(getter) + 宣告相依性
 */
MYAPP.generalNamespace('MYAPP.utilities.array');

MYAPP.utilities.array = (function() {

    // 宣告相依性(把有相依性的模組宣告在頂端)
    var uobj = MYAPP.utilities.object,
        ulang = MYAPP.utilities.lang,

        // private properties
        arrayString = "[object Array]",
        ops = Object.prototype.toString,

        // private method
        inArray = function(needle, haystack) {
            for (var i = 0, max = haystack.length; i < max; i++) {
                if (haystack[i] === needle) {
                    return i;
                }
            }
            return -1;
        },
        isArray = function(a) {
            return ops.call(a) === arrayString;
        };

    // 可選擇的一次性初始程序
    // ...

    // public API(這裡使用 揭露模式 - Revelation Pattern，在最後才決定哪些private method要揭露
    return {
        indexOf: inArray,
        isArray: isArray
    };
}());
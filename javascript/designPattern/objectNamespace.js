/**
 * Created by coreyou on 2016/6/19.
 * 命名空間模式：可以降低全域變數需求量，避免命名衝突或過度的名稱前綴詞。
 * 整個應用程式使用一個全域物件，把原本的全域變數，都掛在這個全域物件下。
 */
var MYAPP = MYAPP || {};    // 只有這一個全域變數，等同於下面三行，在建立命名空間之前，最好先檢查命名空間是否已經存在，避免衝突或重複宣告。
//if (typeof MYAPP === "undefined") {
//    var MYAPP = {};
//}

// 建構式
MYAPP.Parent = function() {};
MYAPP.Child = function() {};
// 變數
MYAPP.some_var = 1;
// 一個物件容器
MYAPP.modules = {};
// 巢狀物件
MYAPP.modules.module1 = {};
MYAPP.modules.module1.data = {a: 1, b: 2};
MYAPP.modules.module2 = {};

// 泛用的命名空間函式
MYAPP.generalNamespace = function(nsString) {
    var parts = nsString.split('.'),
        parent = MYAPP,
        i;

    // 去除最前面的全域名稱
    if (parts[0] === "MYAPP") {
        parts = parts.slice(1);
    }

    for(i = 0; i < parts.length; i++) {
        // 如果屬性不存在則建立
        if (typeof parent[parts[i]] === "undefined") {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }
    return parent;
};
MYAPP.generalNamespace("modules.module2.data"); // 也可以忽略最前面的MYAPP.
/**
 * Created by coreyou on 2016/6/26.
 *
 * 沙盒模式：解決命名空間模式的缺點(不依賴一個全域變數(ex.MYAPP)、不需要使用很多層的名稱(MYAPP.utilities.array))，
 * 沙盒模式提供一個環境讓模組執行，且此環境不會影響其他沙盒和模組。
 *
 */
function Sandbox() {
    var args = Array.prototype.slice.call(arguments),   // 將參數列轉為陣列
        callback = args.pop(),  // 最後一個參數是回呼函式
        modules = (args[0] && typeof args[0] === "string") ? args : args[0],    // 模組可以用個別的參數(typeof "string")傳遞，也可以用陣列方式傳遞
        i;

    // 確保此函式是以建構式的方式呼叫(也讓沙盒物件可以省略new)
    if (!(this instanceof Sandbox)) {
        return new Sandbox(modules, callback);  // 這裡new的話，modules參數部分都會是Array型式，因為接自args[]
    }

    // 依照需要為this增加屬性
    this.a = 1;
    this.b = 2;

    // 現在，將模組新增至核心的this物件
    // 沒有指定模組，或者"*"都表示「使用所有模組」
    if (!modules || modules == '*') {
        modules = [];
        for (i in Sandbox.modules) {
            if (Sandbox.modules.hasOwnProperty(i)) {
                modules.push(i);
            }
        }
    }

    // 初始所需的模組
    for (i = 0; i < modules.length; i++) {
        Sandbox.modules[modules[i]](this);
    }

    // 執行回呼(回呼函式會成為孤立的沙盒環境，而且會取得一個已經裝好全部所需功能的物件)
    callback(this);
}

// 依照需要建立prototype的屬性
Sandbox.prototype = {
    name: "My Application",
    version: "1.0",
    getName: function() {
        return this.name;
    }
};


// 新增一個模組靜態屬性：這個屬性是物件，物件包含值組隊，鍵值是模組名稱、值是實作函式
Sandbox.modules = {};
Sandbox.modules.dom = function(box) {
    box.getElement = function() {};
    box.getStyle = function() {};
    box.foo = "bar";
};
Sandbox.modules.event = function(box) {
    // 如果有必要則存取Sandbox的原型
    // box.constructor.prototype.m = "mmm";
    box.attachEvent = function() {};
    box.dettachEvent = function() {};
};
Sandbox.modules.ajax = function(box) {
    box.makeRequest = function() {};
    box.getResponse = function() {};
};


// 使用沙盒
//new Sandbox(function(box){
//    console.log(box);
//});
//模組名稱可以用陣列傳遞
//Sandbox(['ajax', 'event'], function(box) {
//    console.log(box);
//});
// 模組名稱可以用個別參數傳遞
//Sandbox('ajax', 'event', function(box) {
//    console.log(box);
//});
// 若模組名稱為*或是空值，則載入所有模組
//Sandbox('*', function(box) {
//    console.log(box);
//});
//Sandbox(function(box) {
//    console.log(box);
//});
// 可以多次實體化沙盒物件
//Sandbox('dom', 'event', function(box) {
//    console.log(box);
//
//    Sandbox('ajax', function(box) { // 另一個沙河的box物件，和外面的box是不同的
//        console.log(box);
//    });
//
//    // 外面不會有ajax的痕跡
//});
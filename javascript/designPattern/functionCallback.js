/**
 * Created by coreyou on 2016/3/21.
 */
var findNodes = function(callback) {
    var i = 100000,
        nodes = [],
        found;

    // 檢查callback確實可以執行
    if (typeof callback !== "function") {
        callback = false;
    }

    while(i) {
        i -= 1;

        // 這裡是findNodes應該要做的複雜邏輯...，省略...

        // 執行callback
        if (callback) {
            callback(found);
        }

        nodes.push(found);
    }
    return nodes;
};

var hide = function(node) {
    node.style.display = "none";
};

findNodes(hide);

// 如果callback function是某個物件的方法，必須把物件也傳進去，不然會呼叫到this.callbackFunction()
var findNodes = function(callback, callback_obj) {
    // ...
    if (typeof callback === "function") {
        callback.call(callback_obj, found);
    }
    // 如果方法用字串傳遞，在傳入參數的時候就不用重複物件兩次
    if (typeof callback === "string") {
        callback = callback_obj[callback];
    }
    // ...
}

findNodes(myapp.paint, myapp);
findNodes("paint", myapp);
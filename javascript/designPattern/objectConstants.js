/**
 * Created by coreyou on 2016/7/9.
 *
 * 物件常數:
 * 1.使用命名慣例(變數全大寫)
 * 2.建構式的靜態屬性
 *
 */
// 1.使用命名慣例
console.log(Math.PI);    // 3.141592653589793

// 2.建構式的靜態屬性
var Widget = function() {};
Widget.MAX_HEIGHT = 320;

// 3.泛用的constant物件實作: 只允許原始型別成為常數值、以hasOwnProperty()檢查以確保使用內建屬性名稱來宣告屬性、每個常數前加上隨機產生的前綴詞
var constant = (function() {
    var constants = {}, // 存所有常數
        ownProp = Object.prototype.hasOwnProperty,
        allowed = {
            string: 1,
            number: 1,
            boolean: 1
        },
        prefix = (Math.random() + "_").slice(2);

    return {
        set: function(name, value) {
            if (this.isDefined(name)) { // 已經定義過則回傳false
                return false;
            }
            if (!ownProp.call(allowed, typeof value)) { // 限定常數只能是基本型別
                return false;
            }
            constants[prefix + name] = value;
            return true;
        },
        isDefined: function(name) { // 檢查某個常數是否存在
            return ownProp.call(constants, prefix + name);
        },
        get: function(name) {
            if (this.isDefined(name)) {
                return constants[prefix + name];
            }
            return null;
        }
    };
}());

// 檢查是否定義過
console.log(constant.isDefined("maxWidth")); // false
// 定義常數
console.log(constant.set("maxWidth", 480));  // true
// 再檢查一遍
console.log(constant.isDefined("maxWidth")); // true
// 嘗試重新定義
console.log(constant.set("maxWidth", 320));  // false
console.log(constant.get("maxWidth"));       // 480
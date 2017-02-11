/**
 * Created by coreyou on 2016/3/28.
 *
 * 初始階段的分支
 */
var utils = {   // 工具函式介面
    addListener: null,
    removeListener: null
}

// 工具函式實作：在程式讀取的時候，檢測瀏覽器的功能，來決定函式在頁面生命週期中的定義
if (typeof window.addEventListener === 'function') {
    utils.addListener = function(el, type, fn) {
        el.addEventListener(type, fn, false);
    };
    utils.removeListener = function(el, type, fn) {
        el.removeEventListener(type, fn, false);
    };
} else if (typeof document.attachEvent === 'function') {    // IE
    utils.addListener = function(el, type, fn) {
        el.attachEvent('on' + type, fn);
    };
    utils.removeListener = function(el, type, fn) {
        el.detachEvent('on' + type, fn);
    };
} else {    // other browser
    utils.addListener = function(el, type, fn) {
        el['on' + type] = fn;
    };
    utils.removeListener = function(el, type, fn) {
        el['on' + type] = null;
    };
}
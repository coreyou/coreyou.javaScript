/**
 * Created by coreyou on 2016/4/3.
 *
 * 設定值物件:
 * 由於函式可能因為開發或是維護過程中的需求變化，被加入越來越多功能，
 * 所以函式可能會增加越來越多參數，
 * 傳一堆參數實在不方便，我們可以指傳遞一個參數物件，
 * 用這個參數物件帶所有的設定值。
 *
 * 優點:
 * 1. 不需要記住參數的名稱和順序
 * 2. 可以安全地略過選用參數
 * 3. 更容易閱讀和維護
 * 4. 更容易新增、移除參數
 * 缺點:
 * 1. 需要知道參數的名稱
 * 2. 設定值物件的屬性名稱無法被最小化(最小化可以節省傳輸耗用頻寬)
 */
//function addPerson(first, second) {};
//function addPerson(first, second, third, ...) {};
function addPerson(config) {

};
var config = {
    username: "batman",
    first: "Bruce",
    last: "Wayne"
};
addPerson(config);
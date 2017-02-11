/**
 * Created by coreyou on 2016/7/9.
 *
 * method()方法： 為了讓Javascript看起來更class-like，Douglas Crockford提出method()方法
 * 使用建構式看起來就像是在使用Class，但是在建構式本體中新增方法到this是沒有效率的，
 * 因為會造成在每個實體上都重新建立方法，浪費更多記憶體，所以可重用的方法都會建在prototype中
 */
// 實作Sugar Method，方便我們新增method
if (typeof Function.prototype.method !== "function") {
    Function.prototype.method = function(name, implementation) {
        this.prototype[name] = implementation;
        return this;
    };
}

var Person = function(name) {   // 使用鏈接模式
    this.name = name;
}.method('getName', function() {    // 使用Sugar Method
    return this.name;
}).method('setName', function(name) {
    this.name = name;
    return this;
});

var a = new Person('Adam');
console.log(a.getName());   // Adam
console.log(a.setName('Eve').getName());    // Eve
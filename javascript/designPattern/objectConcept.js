/**
 * Created by coreyou on 2015/1/29.
 */

// 狗類別的建構函式，javascript沒有類別，使用函式代替
function Animal(name) { // 或 var Animal = function() {
    // 強制去new，避免呼叫建構式的時候忘記new而變成全域物件的屬性
    if (!(this instanceof Animal)) {
        return new Animal(name);
    }

    // 物件屬性，this是呼叫Dog function的物件
    this.name = name;
    // 模擬未初始化的private屬性(利用建構函式來做到closure，不會暴露到建構式外)
    var size;
    // private屬性如果是物件，會有一個問題，當我們使用了public getter function回傳private物件參考，就有可能直接藉由物件改動private值!!
    var habitat = {
        name: "Taiwan",
        number: 1
    };

    // 物件方法，方法使用this去定義的話，表示每個執行個體都會有一份重複的方法，是否有辦法生出一份然後共用? 答案在使用prototype
    this.getName = function () {
        return this.name;
    };
    this.getSize = function() {
        return size;
    };
    this.getHabitat = function() {
        // 使用closure實作getter
        // 當我們使用了public getter function回傳private物件參考，就有可能直接藉由物件改動private值!!
        return habitat;
    };

    this.respondToNameCall = function(name) { // 叫狗的名字
        if(this.name == name) {
            console.log(name + " make sound!!");
        }
    };

    // 靜態方法
    Animal.sleep = function(animal) {
        console.log(animal.getName() + " is sleeping!!");
    };

    // return this; // 隱含都會回傳this，也可以自己決定要回傳的物件
}
/*
    以上建構式實際做的事類似
    function Animal(name) {
       var this = Object.create(Animal.prototype); // 建一個this空物件，但不是真的空物件，他會繼承Animal的原型
       this.name = name;    // 將屬性和方法加到此物件
       return this; // 最後隱含地回傳回去
    }
 */
/*
    除了使用建構式，以上類別也可以使用兩種物件實字的方法來實作(使用匿名立即函式來做closure)
    1.
    var buddy;
    (function(name) {
        // private member
        var name = name;
        // public getter
        buddy = {
            getName: function() {
                return name;
            }
        };
    }("Buddy"));
    buddy.getName();

    2.
    var buddy = (function(name) {
         // private member
         var name = name;
         // public getter
         return {
            getName: function() {
                return name;
            }
         };
     }("Buddy"));
     buddy.getName();
 */

console.log("1.Create Objects")
if (typeof buddy === "undefined") {
    var buddy = new Animal("Buddy");   // prototype會等於Dog.prototype
}
buddy.respondToNameCall("Buddy");   // Buddy make sound!!

// new Object() 等於宣告一個空物件 {}，再將這個空物件放到建構函式.call()的第一個參數，其他參數是建構函式本身的參數，
// .call()可以用.apply()代替，差別在於apply()第二個參數以後的參數使用陣列表示，
// 所以call()可能有兩個以上的參數，而apply()最多兩個參數，第二個參數是參數陣列。
var cutie = {};
// 下兩行有問題
//Animal.call(cutie, "Cutie");   // prototype會等於Object.prototype
//cutie.respondToNameCall("Cutie");
cutie = new Animal("Cutie");

console.log("2.Call Static method");
Animal.sleep(buddy);   // 呼叫靜態方法
Animal.sleep(cutie);   // 呼叫靜態方法
console.log("----------------------------------------------");

console.log("3.Object Prototype")
console.log("var spot = new Animal('Spot');")

// spot的prototype是Dog.prototype
// Animal.prototype有constructor屬性指到function Animal() {}這個建構函式
// spot本身其實是沒有constructor屬性的，但是他會去找到他的prototype的constructor屬性，看下面的各result就知道了
var spot = new Animal("Spot");
var result_2 = Animal.prototype.isPrototypeOf(spot);    // spot的prototype是Animal物件
console.log("Animal.prototype.isPrototypeOf(spot) == " + result_2); // True
var result_3 = spot.constructor == Animal.prototype.constructor;    // 都是function Animal()
console.log("(spot.constructor == Animal.prototype.constructor) == " + result_3);   // True
var result_4 = spot.constructor == Animal;  // function Animal()
console.log("(spot.constructor == Animal) == " + result_4); // True
var result_5 = spot.hasOwnProperty("constructor");  // constructor是prototype屬性的屬性
console.log("(spot.hasOwnProperty(\"constructor\")) == " + result_5);   // False
var result_6 = Animal.prototype.hasOwnProperty("constructor");
console.log("(Animal.prototype.hasOwnProperty('constructor')) == " + result_6); // True

console.log("Prototype: Reuse and Overwrite of function");

function Cat() {};

var carter = new Cat();
var catherine = new Cat();
// 把方法放到原型內，這樣一來所有實體就可以共用，如果使用this去定義，則會每個實體都擁有一份，以下兩種使用方法
Cat.prototype.getCatType = function() {
    return "Cat.prototype.getCatType";
};
Cat.prototype = (function() {
    // private member
    var type;
    // public prototype member
    return {
        getType: function() {
            return type;
        }
    };
}());
console.log(carter.getCatType());
catherine.getCatType = function() {
    return "overwrite Cat.prototype.getCatType";
};
console.log(catherine.getCatType());

console.log("----------------------------------------------");
console.log("5.Extend");

function Dog(name, type) {
    Animal.call(this, name);

};

// 1. 使用物件實字創造去物件
var lion1 = {
    habitat: "Africa",  // 屬性
    roar: function() { // 方法
        return "roar!!";
    }
};
// 2. 使用空物件或內建建構式去創造物件
var lion2 = {};  // 也可以用內建建構式 var lion = new Object(); 這種方法需要判斷作用域，會向外查詢整個作用域鍊直到全域的Object建構式，而物件實字的方法不用
lion2.habitat = "Africa";
lion2.roar = function() {
    return "roar!!";
};
lion2.habitat = "New York";  // 隨時可以複寫
// 3. 使用建構式去創造物件
function lion3() {
    this.habitat = "Africa";
    this.roar = function() {
        return "roar!!";
    };
};
var lion = new lion3();

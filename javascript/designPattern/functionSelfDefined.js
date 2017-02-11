/**
 * Created by coreyou on 2016/3/23.
 *
 * 自我定義的函式:
 * 新函式指派給同一個變數，變數原本指向的舊函式就會被覆蓋成新的，可以回收舊指標，指向新的函式，
 * 當函式需要做一些初始化工作，而且只需要做一次的時候，這個模式會很有用。
 * 也稱為lazy function definition，因為第一次使用前沒有正確定義，
 * 第二次使用的時候才是正確定義，而且第一次做的事情就不再做了，
 * 所以做的事變少了，變懶惰。
 */
var scareMe = function() {
    console.log("Boo!");
    scareMe = function() {
        console.log("double Boo!");
    };
};

//scareMe();  // Boo!
//scareMe();  // double Boo!

// 加入一個新屬性
scareMe.property = "properly";
// 指派給一個變數
var prank = scareMe;
// 作為方法使用
var spooky = {
    boo: scareMe
};

// 每次呼叫prank()，都會印出Boo!，同時覆蓋全域的scareMe()函式，但prank()依舊保有舊的定義，所以在後面第一次呼叫scareMe()就是呼叫到已經被覆蓋過的版本了
prank();    // Boo!
prank();    // Boo!
console.log(prank.property);    // properly

spooky.boo();   // Boo!
spooky.boo();   // Boo!
console.log(spooky.boo.property);   // properly

scareMe();  // double Boo!
scareMe();  // double Boo!
console.log(scareMe.property);  // undefined
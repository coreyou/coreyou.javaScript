/**
 * Created by coreyou on 2016/7/9.
 *
 * 鏈接模式: 一個物件在同一行程式中，可以一個接一個呼叫多個方法，不需要重新給值。
 *
 * 使用回傳this的方法達成。
 * 優點: 精簡的程式碼、幫助你去思考能否切割函式成更小的函式。
 * 缺點: debug會有困難，只知道是錯在這行，但不知道是哪一個方法，火車事故模式
 */
var obj = {
    value: 1,
    increment: function() {
        this.value += 1;
        return this;
    },
    add: function(v) {
        this.value += v;
        return this;
    },
    shout: function() {
        console.log(this.value);
    }
};

obj.increment().add(3).shout(); // 5
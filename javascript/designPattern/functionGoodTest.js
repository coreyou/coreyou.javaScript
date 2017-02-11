/**
 * Created by coreyou on 2015/8/19.
 */
var a = ['a', 'b', 'c'];
var b = ['x', 'y', 'z'];
var c = a.concat(b, true);  // [a, b, c, x, y, z, true]
var d = a.join(':');    // a:B:c

Array.prototype.arrayPop = function() {
    // splice(delete index, delete count)
    return this.splice(this.length - 1, 1)[0];
};

Array.prototype.arrayPush = function() {
    this.splice.apply(this, [this.length, 0].concat(Array.prototype.slice.apply(arguments)));
    return this.length;
};

Array.prototype.arrayShift = function() {
    var afterSplice = this.splice(0, 1);    // delete 'x'
    return afterSplice[0];  // return deleted member
}

var e = a.pop();
var f = a.arrayPop();
var g = a.arrayPush('d');
var h = b.arrayShift();
var i = ['aa', 'bb', 4, 8, 16, 17, 23, 42];

var j = i.sort(function(sortA, sortB) {
    if (sortA === sortB) {
        return 0;
    }

    if (typeof sortA === typeof sortB) {
        return sortA < sortB ? -1: 1;
    }

    return typeof sortA < typeof sortB ? -1 : 1;
});

console.log(a); // [a, d]
console.log(b); // [y, z]
console.log(c); // [a, b, c, x, y, z, true]
console.log(d); // a:b:c
console.log(e); // c
console.log(f); // b
console.log(g); // 2
console.log(h); // x
console.log(i); // [4, 8, 16, 17, 23, 42, "aa", "bb"]
console.log(j); // [4, 8, 16, 17, 23, 42, "aa", "bb"]

/**
 * Created by coreyou on 2016/3/19.
 */
var jsonStr = '{"name": "coreyou"}';

var data = JSON.parse(jsonStr);
console.log(data.name); // coreyou

var data2 = jQuery.parseJSON(jsonStr);
console.log(data2.name);    // coreyou

var data3 = {
    name: "coreyou",
    birth: new Date(),
    friends: [1, 2, 3, 4]
};
var jsonStr2 = JSON.stringify(data3);
console.log(jsonStr2);  // {"name":"coreyou","birth":"2016-03-19T04:36:03.391Z","friends":[1,2,3,4]}
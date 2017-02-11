/**
 * Created by coreyou on 2016/3/19.
 */
// 用 / 包住正規表示式，後面是格式的修飾詞: g(全域檢查)、m(檢查多行)、i(不區分大小寫)
var noLetters = "abc123XYZ".replace(/[a-z]/gi, "");
console.log(noLetters);
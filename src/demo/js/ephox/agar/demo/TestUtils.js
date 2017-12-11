

export default <any> function () {
 window.assert = {
   eq: function (exp, act, message) {
     if (exp !== act) throw Error(message !== undefined ? message : ('Expected: ' + exp + ', Actual: ' + act));
   }
 };
};
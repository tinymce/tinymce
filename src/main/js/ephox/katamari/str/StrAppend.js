var addToStart = function (str, prefix) {
  return prefix + str;
};

var addToEnd = function (str, suffix) {
  return str + suffix;
};

var removeFromStart = function (str, numChars) {
  return str.substring(numChars);
};

var removeFromEnd = function (str, numChars) {
  return str.substring(0, str.length - numChars);
};

export default <any> {
  addToStart: addToStart,
  addToEnd: addToEnd,
  removeFromStart: removeFromStart,
  removeFromEnd: removeFromEnd
};
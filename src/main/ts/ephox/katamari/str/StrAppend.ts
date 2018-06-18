var addToStart = function (str: string, prefix: string) {
  return prefix + str;
};

var addToEnd = function (str: string, suffix: string) {
  return str + suffix;
};

var removeFromStart = function (str: string, numChars: number) {
  return str.substring(numChars);
};

var removeFromEnd = function (str: string, numChars: number) {
  return str.substring(0, str.length - numChars);
};

export default {
  addToStart: addToStart,
  addToEnd: addToEnd,
  removeFromStart: removeFromStart,
  removeFromEnd: removeFromEnd
};
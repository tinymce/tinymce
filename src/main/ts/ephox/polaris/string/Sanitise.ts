/**
 * Sanitises a string for use in a CSS class name
 */
var css = function (str) {
  // special case; the first character must a letter. More strict than CSS, but easier to implement.
  var r = /^[a-zA-Z]/.test(str) ? '' : 'e';

  // any non-word character becomes a hyphen
  var sanitised = str.replace(/[^\w]/gi, '-');

  return r + sanitised;
};

export default <any> {
  css: css
};
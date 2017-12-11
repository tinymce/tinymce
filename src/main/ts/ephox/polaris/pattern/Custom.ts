

export default <any> function (regex, prefix, suffix, flags) {
  var term = function () {
    return new RegExp(regex, flags.getOr('g'));
  };

  return {
    term: term,
    prefix: prefix,
    suffix: suffix
  };
};
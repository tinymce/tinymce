
export default <any> function (regex, prefix, suffix, flags) {
  const term = function () {
    return new RegExp(regex, flags.getOr('g'));
  };

  return {
    term,
    prefix,
    suffix
  };
};
let generate = (items, suffix, f) => {
  let out = {};

  items.forEach(k => out[k + '-' + suffix] = f(k));

  return out;
};

module.exports = {
  generate
};

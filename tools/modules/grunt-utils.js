let generate = (items, suffix, f) => {
  let out = {};

  items.forEach(k => out[k + '-' + suffix] = f(k));

  return out;
};

let prefixes = (obj, mappings) => {
  const objMappings = {};

  mappings.forEach(v => objMappings[v[0]] = v[1]);

  return Object.assign(obj, objMappings);
};

module.exports = {
  generate,
  prefixes
};

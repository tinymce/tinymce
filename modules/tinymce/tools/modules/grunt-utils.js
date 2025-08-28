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

let flatMap = (obj, f) => {
  return Object.keys(obj)
    .map(function (key) {
      return f(key, obj[key]);
    })
    .reduce(function (acc, item) {
      return acc.concat(item);
    }, []);
};

module.exports = {
  generate,
  prefixes,
  flatMap
};

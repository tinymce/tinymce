var grouping = function (splitter, groupIndex, base, idMapper) {
  return function (id) {
    var groups = id.split('.');

    return [
      groups[groupIndex],
      base,
      idMapper(id)
    ].join('/');
  }
};

var repo = function (base, idMapper) {
  return grouping('.', 1, base, idMapper);
};

configure({
  sources: [
    source('amd', 'ephox.katamari.test', '../../src/test/js/module', mapper.hierarchical),
    source('amd', 'ephox.wrap.Jsc', '../../node_modules/@ephox/wrap-jsverify', mapper.flat)
  ]
});
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
    // Uses bolt 1.8.0 for mapper.repo
    source('amd', 'ephox.wrap', '../../fake_node_modules', repo('dist', mapper.flat))
  ]
});

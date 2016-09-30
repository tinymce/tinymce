configure({
  sources: [
    source('amd', 'ephox.katamari.test', '../../src/test/js/module', mapper.hierarchical),
    // Uses bolt 1.8.0 for mapper.repo
    source('amd', 'ephox.wrap', '../../fake_node_modules', mapper.repo('dist', mapper.flat))
  ]
});

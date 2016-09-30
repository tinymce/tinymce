configure({
  sources: [
    source('amd', 'ephox.katamari', '../../src/main/js', mapper.hierarchical),
    // Uses bolt 1.8.0 for mapper.repo
    source('amd', 'ephox', '../../node_modules/@ephox/', mapper.repo('jsverify', mapper.flat))
  ]
});

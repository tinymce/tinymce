configure({
  sources: [
    source('amd', 'ephox.katamari.test', '../../src/test/js/module', mapper.hierarchical),
    source('amd', 'ephox.wrap.Jsc', '../../node_modules/@ephox/wrap-jsverify', mapper.flat)
  ]
});
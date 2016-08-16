configure({
  sources: [
    source('amd', 'ephox.katamari.test', '../../src/test/js/module', mapper.hierarchical),
    source('amd', 'ephox.wrap.Jsc', '../../lib/test', mapper.flat)
  ]
});

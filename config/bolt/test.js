configure({
  sources: [
    source('amd', 'ephox.robin.test', '../../src/test/js/module', mapper.hierarchical),
    source('amd', 'ephox.wrap.Json', '../../lib/test', mapper.flat)
  ]
});

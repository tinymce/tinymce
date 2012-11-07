configure({
  sources: [
    source('amd', 'ephox.robin.test', '../../src/test/js/module', mapper.hierarchical),
    source('amd', 'ephox.violin', '../../lib/demo', mapper.flat),
    source('amd', 'ephox.wrap.Json', '../../lib/demo', mapper.flat)
  ]
});

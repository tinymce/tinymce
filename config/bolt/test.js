configure({
  sources: [
    source('amd', 'ephox.boulder.test', '../../src/test/js/module', mapper.hierarchical),
    source('amd', 'ephox.agar', '../../lib/test', mapper.flat),
    source('amd', 'ephox.wrap.Jsc', '../../lib/test', mapper.flat)
  ]
});

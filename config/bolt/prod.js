configure({
  sources: [
    source('amd', 'ephox.boulder', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox.lumber', '../../lib/test', mapper.flat),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});

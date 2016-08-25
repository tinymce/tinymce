configure({
  sources: [
    source('amd', 'ephox.alloy', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox.wrap.JQuery', '../../lib/test', mapper.flat),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});

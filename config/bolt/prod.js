configure({
  sources: [
    source('amd', 'ephox.alloy', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox.boulder', '../../../boulder/src/main/js', mapper.hierarchical),
    source('amd', 'ephox.lumber', '../../../boulder/lib/test', mapper.flat),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});

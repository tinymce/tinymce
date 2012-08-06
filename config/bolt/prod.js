configure({
  sources: [
    source('amd', 'ephox.boss', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});

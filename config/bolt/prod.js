configure({
  sources: [
    source('amd', 'ephox.robin', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});

configure({
  sources: [
    source('amd', 'ephox.boulder', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});

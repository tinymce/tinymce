configure({
  sources: [
    source('amd', 'ephox.dragster', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});

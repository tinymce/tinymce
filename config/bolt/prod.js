configure({
  sources: [
    source('amd', 'ephox.polaris', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});

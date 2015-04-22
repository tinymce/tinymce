configure({
  sources: [
    source('amd', 'ephox.darwin', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});

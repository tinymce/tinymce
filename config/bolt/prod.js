configure({
  sources: [
    source('amd', 'ephox/imagetools', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});

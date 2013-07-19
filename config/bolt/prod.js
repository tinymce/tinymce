configure({
  sources: [
    source('amd', 'ephox.snooker', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});

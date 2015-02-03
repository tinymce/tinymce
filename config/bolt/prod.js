configure({
  sources: [
    source('amd', 'ephox.echo', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});

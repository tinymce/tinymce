configure({
  sources: [
    source('amd', 'ephox.porkbun', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});

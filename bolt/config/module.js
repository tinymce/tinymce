configure({
  sources: [
    source('amd', 'ephox.porkbun', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox.wrap', '../../lib/compile', mapper.flat)
  ]
});

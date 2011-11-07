configure({
  sources: [
    source('amd', 'ephox.porkbun.demo', '../../src/demo/js', mapper.hierarchical),
    source('amd', 'ephox.porkbun', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox.wrap.D', '../../lib/run/depend', mapper.flat),
    source('amd', 'ephox', '../../lib/demo', mapper.flat)
  ]
});

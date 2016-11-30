configure({
  sources: [
    source('amd', 'ephox.alloy', '../../src/main/js', mapper.hierarchical),
    source('amd', 'ephox.boulder', 'http://localhost/me/work/van/boulder/src/main/js', mapper.hierarchical, { absolute: true }),
    source('amd', 'ephox.lumber', 'http://localhost/me/work/van/boulder/lib/test', mapper.flat, { absolute: true }),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});

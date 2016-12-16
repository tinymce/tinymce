configure({
  configs: [
    './test.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.boulder', 'http://lenovo-morgan/me/work/van/boulder/src/main/js', mapper.hierarchical, { absolute: true }),
    source('amd', 'ephox.lumber', 'http://lenovo-morgan/me/work/van/boulder/lib/test', mapper.flat, { absolute: true }),
  ]
});

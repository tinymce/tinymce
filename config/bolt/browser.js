configure({
  configs: [
    './test.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.boulder', 'http://lenovo-morgan/me/work/van/boulder/src/main/js', mapper.hierarchical, { absolute: true }),
    // source('amd', 'ephox.agar', 'http://lenovo-morgan/me/work/van/agar/src/main/js', mapper.hierarchical, { absolute: true }),
  ]
});

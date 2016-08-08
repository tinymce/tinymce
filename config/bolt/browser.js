configure({
  configs: [
    './test.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.agar', 'http://localhost/me/work/van/agar/src/main/js', mapper.hierarchical, { absolute: true })
  ]
});

configure({
  configs: [
    './test.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.agar', '../../../agar/src/main/js', mapper.hierarchical)
  ]
});

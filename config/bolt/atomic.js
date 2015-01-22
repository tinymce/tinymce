configure({
  configs: [
    './test.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.phoenix', '../../../phoenix/src/main/js', mapper.hierarchical)
  ]
});

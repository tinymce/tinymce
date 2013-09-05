configure({
  configs: [
    './test.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.sugar', '../../../sugar/src/main/js', mapper.hierarchical),
    source('amd', 'ephox.boss', '../../../boss/src/main/js', mapper.hierarchical)
  ]
});

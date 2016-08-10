configure({
  configs: [
    './test.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.alloy.log', '../../src/test/js/module', mapper.hierarchical),
    source('amd', 'ephox.agar', '../../../agar/src/main/js', mapper.hierarchical),
    source('amd', 'ephox.boulder', '../../../boulder/src/main/js', mapper.hierarchical)
  ]
});

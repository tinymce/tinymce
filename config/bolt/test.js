configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.alloy.test', '../../src/test/js/module', mapper.hierarchical)
  ]
});

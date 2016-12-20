configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.sugar.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.alloy.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


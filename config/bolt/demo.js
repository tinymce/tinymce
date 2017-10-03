configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.phoenix.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


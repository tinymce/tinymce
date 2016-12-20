configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.sand.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


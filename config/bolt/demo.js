configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.robin.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


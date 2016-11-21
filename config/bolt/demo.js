configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.katamari.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


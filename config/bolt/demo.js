configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.imagetools.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


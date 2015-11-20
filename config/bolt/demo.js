configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.imagetools.demo', '../../src/demo/js', mapper.hierarchical),
    source('amd', 'ephox', '../../lib/run/depend', mapper.flat)
  ]
});


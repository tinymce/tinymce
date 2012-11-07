configure({
  configs: [
    '../../lib/config/exhibition.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.robin.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


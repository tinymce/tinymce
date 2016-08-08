configure({
  configs: [
    '../../lib/config/exhibition.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.alloy.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


configure({
  configs: [
    '../../lib/config/exhibition.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.boulder.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


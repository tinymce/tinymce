configure({
  configs: [
    '../../lib/config/exhibition.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.polaris.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


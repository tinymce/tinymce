configure({
  configs: [
    '../../lib/config/exhibition.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.darwin.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


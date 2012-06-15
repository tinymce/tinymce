configure({
  configs: [
    '../../lib/config/exhibition.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.dragster.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


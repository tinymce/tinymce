configure({
  configs: [
    '../../lib/config/exhibition.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.katamari.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


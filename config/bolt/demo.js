configure({
  configs: [
    '../../lib/config/exhibition.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.boss.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


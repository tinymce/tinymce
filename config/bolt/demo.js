configure({
  configs: [
    '../../lib/config/exhibition.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.porkbun.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


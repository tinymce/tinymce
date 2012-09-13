configure({
  types: [
    type('text', 'ephox.modulator.text')
  ],
  configs: [
    '../../lib/config/exhibition.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.phoenix.demo', '../../src/demo/js', mapper.hierarchical),
    source('amd', 'ephox.modulator.text', '../../lib/demo/', mapper.flat),
    source('text', 'html', '../../src/demo/text')
  ]
});


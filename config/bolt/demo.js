configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.phoenix.demo', '../../src/demo/js', mapper.hierarchical),
    source('text', 'html', '../../src/demo/text')
  ]
});


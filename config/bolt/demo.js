configure({
  configs: [
    '../../lib/config/exhibition.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.echo.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


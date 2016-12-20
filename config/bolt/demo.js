configure({
  configs: [
    '../../lib/config/exhibition.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.mcagar.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


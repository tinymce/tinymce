configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.agar.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.snooker.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


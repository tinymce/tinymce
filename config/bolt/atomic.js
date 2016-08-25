configure({
  configs: [
    './test.js',
    './prod.js'
  ],
  sources: [
    // This is so we can have truncate when running in the browser
    source('amd', 'ephox.alloy.log', '../../src/test/js/module', mapper.hierarchical)
  ]
});

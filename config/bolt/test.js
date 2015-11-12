configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.imagetools.test', '../../src/test/js/module', mapper.hierarchical)
  ]
});

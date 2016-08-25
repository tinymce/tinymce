configure({
  sources: [
    source('amd', 'ephox.alloy.test', '../../src/test/js/module', mapper.hierarchical),
    source('amd', 'ephox.wrap.JQuery', '../../lib/test', mapper.flat)
  ]
});

configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.alloy.demo', '../../src/demo/js', mapper.hierarchical),
    source('amd', 'ephox.wrap.JsBeautify', '../../lib/demo', mapper.flat)
  ]
});


configure({
  configs: [
    './prod.js'
  ],
  types: [
    type('text', 'ephox.modulator.text')
  ],
  sources: [
    source('amd', 'ephox.alloy.demo', '../../src/demo/js', mapper.hierarchical),
    source('text', 'dom-templates', '../../src/main/html'),
    source('amd', 'ephox.wrap.JsBeautify', '../../lib/demo', mapper.flat)
  ]
});


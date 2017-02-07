configure({
  configs: [
    './prod.js'
  ],
  types: [
    
  ],
  sources: [
    // source('amd', 'ephox.alloy.api.ui.UiBuilder', '../../src/docs/js/ephox/alloy/docs', mapper.flat),
    source('amd', 'ephox.alloy.docs', '../../src/docs/js', mapper.hierarchical)
  ]
});

configure({
  configs: [
    './prod.js'
  ],
  types: [
    
  ],
  sources: [
    source('amd', 'ephox.alloy.docs', '../../src/docs/js', mapper.hierarchical)
  ]
});

configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.porkbun.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


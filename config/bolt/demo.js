configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.darwin.demo', '../../src/demo/js', mapper.hierarchical, { fresh: true })
  ]
});


configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.jax.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


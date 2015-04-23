configure({
  configs: [
    '../../lib/config/exhibition.js',
    './prod.js'
  ],
  sources: [
    source('amd', 'ephox.darwin.demo', '../../src/demo/js', mapper.hierarchical, { fresh: true }),
    source('amd', 'ephox.darwin', '../../src/main/js', mapper.hierarchical, { fresh: true }),
    source('amd', 'ephox.fussy', '../../../fussy/src/main/js', mapper.hierarchical, { fresh: true }),
  ]
});


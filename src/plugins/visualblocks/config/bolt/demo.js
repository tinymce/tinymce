configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.visualblocks.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


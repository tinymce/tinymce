configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.nonbreaking.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


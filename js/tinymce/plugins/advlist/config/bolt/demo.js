configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.advlist.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


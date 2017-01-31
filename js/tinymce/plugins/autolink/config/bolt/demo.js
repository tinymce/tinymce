configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.autolink.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


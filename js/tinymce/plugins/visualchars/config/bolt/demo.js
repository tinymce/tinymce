configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.visualchars.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


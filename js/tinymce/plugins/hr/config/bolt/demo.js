configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.hr.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


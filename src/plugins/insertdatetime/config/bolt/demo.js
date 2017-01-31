configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.insertdatetime.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


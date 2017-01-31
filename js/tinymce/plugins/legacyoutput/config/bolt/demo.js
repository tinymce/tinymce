configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.legacyoutput.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.spellchecker.demo', '../../src/demo/js', mapper.hierarchical)
  ]
});


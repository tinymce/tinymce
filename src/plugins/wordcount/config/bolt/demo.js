configure({
  configs: [
    './prod.js'
  ],
  sources: [
		source('amd', 'tinymce.wordcount.Demo', '../../src/demo/js', mapper.hierarchical)
  ]
});
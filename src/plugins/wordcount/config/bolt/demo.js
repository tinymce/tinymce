configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.wordcount.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/wordcount\//, '');
		})
  ]
});
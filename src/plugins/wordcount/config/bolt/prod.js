configure({
  sources: [
    source('amd', 'tinymce.plugins.wordcount', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/wordcount\//, '');
		})
  ]
});
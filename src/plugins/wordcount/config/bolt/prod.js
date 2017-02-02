configure({
  sources: [
    source('amd', 'tinymce.wordcount', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/wordcount\//, '');
		})
  ]
});
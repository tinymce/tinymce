configure({
  sources: [
    source('amd', 'tinymce.lists', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/lists\//, '');
		})
  ]
});
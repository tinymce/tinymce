configure({
  sources: [
    source('amd', 'tinymce.noneditable', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/noneditable\//, '');
		})
  ]
});

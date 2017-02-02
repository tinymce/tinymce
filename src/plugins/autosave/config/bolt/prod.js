configure({
  sources: [
    source('amd', 'tinymce.autosave', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/autosave\//, '');
		})
  ]
});

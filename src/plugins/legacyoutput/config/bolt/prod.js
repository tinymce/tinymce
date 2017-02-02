configure({
  sources: [
    source('amd', 'tinymce.legacyoutput', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/legacyoutput\//, '');
		})
  ]
});

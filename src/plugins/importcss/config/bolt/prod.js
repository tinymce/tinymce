configure({
  sources: [
    source('amd', 'tinymce.importcss', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/importcss\//, '');
		})
  ]
});

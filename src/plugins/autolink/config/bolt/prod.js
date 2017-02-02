configure({
  sources: [
    source('amd', 'tinymce.autolink', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/autolink\//, '');
		})
  ]
});

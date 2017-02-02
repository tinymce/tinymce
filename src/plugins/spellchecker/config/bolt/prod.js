configure({
  sources: [
    source('amd', 'tinymce.plugins.spellchecker', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/spellchecker\//, '');
		})
  ]
});

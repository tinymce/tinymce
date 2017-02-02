configure({
  sources: [
    source('amd', 'tinymce.spellchecker', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/spellchecker\//, '');
		})
  ]
});

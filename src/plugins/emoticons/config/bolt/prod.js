configure({
  sources: [
    source('amd', 'tinymce.plugins.emoticons', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/plugins\/emoticons\//, '');
		})
  ]
});

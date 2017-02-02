configure({
  sources: [
    source('amd', 'tinymce.emoticons', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/emoticons\//, '');
		})
  ]
});

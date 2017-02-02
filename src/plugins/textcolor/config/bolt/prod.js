configure({
  sources: [
    source('amd', 'tinymce.textcolor', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/textcolor\//, '');
		})
  ]
});

configure({
  sources: [
    source('amd', 'tinymce.visualblocks', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/visualblocks\//, '');
		})
  ]
});

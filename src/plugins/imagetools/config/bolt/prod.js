configure({
  sources: [
    source('amd', 'ephox/imagetools', '../../../../../node_modules/@ephox/imagetools/src/main/js', mapper.hierarchical),
    source('amd', 'tinymce.imagetools', '../../src/main/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/imagetools\//, '');
		})
  ]
});

configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.imagetools.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/imagetools\//, '');
		})
  ]
});

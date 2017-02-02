configure({
  configs: [
    './prod.js'
  ],
  sources: [
    source('amd', 'tinymce.contextmenu.demo', '../../src/demo/js', function (id) {
			return mapper.hierarchical(id).replace(/^tinymce\/contextmenu\//, '');
		})
  ]
});


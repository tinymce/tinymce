declare let tinymce: any;

tinymce.init({
  selector: 'textarea.tinymce',
  theme: 'silver',
  skin_url: '../../../../../js/tinymce/skins/ui/oxide',
  plugins: 'preview code',
  toolbar: 'preview code',
  height: 600,
  content_css: 'writer',
  content_style: `
		body {
			max-width: 600px;
		}

	`
});

export {};

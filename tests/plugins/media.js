module("tinymce.plugins.Media", {
	setupModule: function() {
		QUnit.stop();

		tinymce.init({
			selector: "textarea",
			add_unload_trigger: false,
			skin: false,
			plugins: 'media',
			document_base_url: '/tinymce/tinymce/trunk/tests/',
			extended_valid_elements: 'script[src|type]',
			media_scripts: [
				{filter: 'http://media1.tinymce.com'},
				{filter: 'http://media2.tinymce.com', width: 100, height: 200}
			],
			init_instance_callback: function(ed) {
				window.editor = ed;
				QUnit.start();
			}
		});
	},

	teardown: function() {
		delete editor.settings.media_filter_html;
	}
});

test("Object retain as is", function() {
	editor.setContent(
		'<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="425" height="355">' +
			'<param name="movie" value="someurl">' +
			'<param name="wmode" value="transparent">' +
			'<embed src="someurl" type="application/x-shockwave-flash" wmode="transparent" width="425" height="355" />' +
		'</object>'
	);

	equal(editor.getContent(),
		'<p><object width="425" height="355" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000">' +
			'<param name="movie" value="someurl" />' +
			'<param name="wmode" value="transparent" />' +
			'<embed src="someurl" type="application/x-shockwave-flash" wmode="transparent" width="425" height="355" />' +
		'</object></p>'
	);
});

test("Embed retain as is", function() {
	editor.setContent(
		'<embed src="320x240.ogg" width="100" height="200">text<a href="#">link</a></embed>'
	);

	equal(
		editor.getContent(),
		'<p><embed src="320x240.ogg" width="100" height="200"></embed>text<a href="#">link</a></p>'
	);
});

test("Video retain as is", function() {
	editor.setContent(
		'<video src="320x240.ogg" autoplay loop controls>text<a href="#">link</a></video>'
	);

	equal(
		editor.getContent(),
		'<p><video src="320x240.ogg" autoplay="autoplay" loop="loop" controls="controls" width="300" height="150">text<a href="#">link</a></video></p>'
	);
});

test("Iframe retain as is", function() {
	editor.setContent(
		'<iframe src="320x240.ogg" allowfullscreen>text<a href="#">link</a></iframe>'
	);

	equal(editor.getContent(),
		'<p><iframe src="320x240.ogg" width="300" height="150" allowfullscreen="allowfullscreen">text<a href="#">link</a></iframe></p>'
	);
});

test("Audio retain as is", function() {
	editor.setContent(
		'<audio src="sound.mp3">' +
			'<track kind="captions" src="foo.en.vtt" srclang="en" label="English">' +
			'<track kind="captions" src="foo.sv.vtt" srclang="sv" label="Svenska">' +
			'text<a href="#">link</a>' +
		'</audio>'
	);

	equal(editor.getContent(),
		'<p>' +
			'<audio src="sound.mp3">' +
				'<track kind="captions" src="foo.en.vtt" srclang="en" label="English" />' +
				'<track kind="captions" src="foo.sv.vtt" srclang="sv" label="Svenska" />' +
				'text<a href="#">link</a>' +
			'</audio>' +
		'</p>'
	);
});

test("Resize complex object", function() {
	editor.setContent(
		'<video width="300" height="150" controls="controls">' +
			'<source src="s" />' +
			'<object type="application/x-shockwave-flash" data="../../js/tinymce/plugins/media/moxieplayer.swf" width="300" height="150">' +
				'<param name="allowfullscreen" value="true" />' +
				'<param name="allowscriptaccess" value="always" />' +
				'<param name="flashvars" value="video_src=s" />' +
				'<!--[if IE]><param name="movie" value="../../js/tinymce/plugins/media/moxieplayer.swf" /><![endif]-->' +
			'</object>' +
		'</video>'
	);

	var placeholderElm = editor.getBody().firstChild.firstChild;
	placeholderElm.width = 100;
	placeholderElm.height = 200;
	editor.fire('objectResized', {target: placeholderElm, width: placeholderElm.width, height: placeholderElm.height});
	editor.settings.media_filter_html = false;

	equal(editor.getContent(),
		'<p>' +
			'<video controls="controls" width="100" height="200">' +
				'<source src="s" />' +
				'<object type="application/x-shockwave-flash" data="../../js/tinymce/plugins/media/moxieplayer.swf" width="100" height="200">' +
					'<param name="allowfullscreen" value="true" />' +
					'<param name="allowscriptaccess" value="always" />' +
					'<param name="flashvars" value="video_src=s" />' +
					'<!--[if IE]>' +
						'<param name="movie" value="../../js/tinymce/plugins/media/moxieplayer.swf" />' +
					'<![endif]-->' +
				'</object>' +
			'</video>' +
		'</p>'
	);
});

test("Media script elements", function() {
	editor.setContent(
		'<script src="http://media1.tinymce.com/123456"></sc'+'ript>' +
		'<script src="http://media2.tinymce.com/123456"></sc'+'ript>'
	);

	equal(editor.getBody().getElementsByTagName('img')[0].className, 'mce-object mce-object-script');
	equal(editor.getBody().getElementsByTagName('img')[0].width, 300);
	equal(editor.getBody().getElementsByTagName('img')[0].height, 150);
	equal(editor.getBody().getElementsByTagName('img')[1].className, 'mce-object mce-object-script');
	equal(editor.getBody().getElementsByTagName('img')[1].width, 100);
	equal(editor.getBody().getElementsByTagName('img')[1].height, 200);

	equal(editor.getContent(),
		'<p>\n' +
			'<script src="http://media1.tinymce.com/123456" type="text/javascript"></sc'+'ript>\n' +
			'<script src="http://media2.tinymce.com/123456" type="text/javascript"></sc'+'ript>\n' +
		'</p>'
	);
});

test("XSS content", function() {
	function testXss(input, expectedOutput) {
		editor.setContent(input);
		equal(editor.getContent(), expectedOutput);
	}

	testXss('<video><a href="javascript:alert(1);">a</a></video>', '<p><video width="300" height="150"><a>a</a></video></p>');
	testXss('<video><img src="x" onload="alert(1)"></video>', '<p><video width="300" height=\"150\"></video></p>');
	testXss('<video><img src="x"></video>', '<p><video width="300" height="150"><img src="x" /></video></p>');
	testXss('<video><!--[if IE]><img src="x"><![endif]--></video>', '<p><video width="300" height="150"><!-- [if IE]><img src="x"><![endif]--></video></p>');
});
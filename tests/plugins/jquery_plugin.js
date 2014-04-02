module("tinymce.plugins.jQuery", {
	setupModule: function() {
		document.getElementById('view').innerHTML = (
			'<textarea id="elm1"></textarea>' +
			'<textarea id="elm2"></textarea>' +
			'<textarea id="elm3">Textarea</textarea>'
		);

		QUnit.stop();

		$(function() {
			$('#elm1,#elm2').tinymce({
				plugins: [
					"pagebreak,layer,table,save,emoticons,insertdatetime,preview,media,searchreplace",
					"print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,template"
				],

				init_instance_callback: function() {
					var ed1 = tinymce.get('elm1'), ed2 = tinymce.get('elm2');

					// When both editors are initialized
					if (ed1 && ed1.initialized && ed2 && ed2.initialized) {
						QUnit.start();
					}
				}
			});
		});
	}
});

test("Get editor instance", function() {
	equal($('#elm1').tinymce().id, 'elm1');
	equal($('#elm2').tinymce().id, 'elm2');
	equal($('#elm3').tinymce(), null);
});

test("Get contents using jQuery", function() {
	expect(4);

	tinymce.get('elm1').setContent('<p>Editor 1</p>');

	equal($('#elm1').html(), '<p>Editor 1</p>');
	equal($('#elm1').val(), '<p>Editor 1</p>');
	equal($('#elm1').attr('value'), '<p>Editor 1</p>');
	equal($('#elm1').text(), 'Editor 1');
});

test("Set contents using jQuery", function() {
	expect(4);

	$('#elm1').html('Test 1');
	equal($('#elm1').html(), '<p>Test 1</p>');

	$('#elm1').val('Test 2');
	equal($('#elm1').html(), '<p>Test 2</p>');

	$('#elm1').text('Test 3');
	equal($('#elm1').html(), '<p>Test 3</p>');

	$('#elm1').attr('value', 'Test 4');
	equal($('#elm1').html(), '<p>Test 4</p>');
});

test("append/prepend contents using jQuery", function() {
	expect(2);

	tinymce.get('elm1').setContent('<p>Editor 1</p>');

	$('#elm1').append('<p>Test 1</p>');
	equal($('#elm1').html(), '<p>Editor 1</p>\n<p>Test 1</p>');

	$('#elm1').prepend('<p>Test 2</p>');
	equal($('#elm1').html(), '<p>Test 2</p>\n<p>Editor 1</p>\n<p>Test 1</p>');
});

test("Find using :tinymce selector", function() {
	expect(1);

	equal($('textarea:tinymce').length, 2);
});

test("Set contents using :tinymce selector", function() {
	expect(3);

	$('textarea:tinymce').val('Test 1');
	equal($('#elm1').val(), '<p>Test 1</p>');
	equal($('#elm2').val(), '<p>Test 1</p>');
	equal($('#elm3').val(), 'Textarea');
});

test("Get contents using :tinymce selector", function() {
	expect(1);

	$('textarea:tinymce').val('Test get');
	equal($('textarea:tinymce').val(), '<p>Test get</p>');
});

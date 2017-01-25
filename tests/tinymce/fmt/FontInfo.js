ModuleLoader.require(["tinymce/fmt/FontInfo"], function(FontInfo) {
	module("tinymce.fmt.FontInfo", {});

	var assertComputedFontProp = function (fontProp, html, expected) {
		var div = document.createElement('div');
		var fontGetProp = fontProp === 'fontSize' ? FontInfo.getFontSize : FontInfo.getFontFamily;

		document.body.appendChild(div);
		div.style[fontProp] = expected;
		div.innerHTML = html;
		equal(fontGetProp(div, div.getElementsByTagName('mark')[0]), expected, 'Doesn\'t match the expected computed runtime style');
		div.parentNode.removeChild(div);
	};

	var assertSpecificFontProp = function (fontProp, html, expected) {
		var div = document.createElement('div');
		var fontGetProp = fontProp === 'fontSize' ? FontInfo.getFontSize : FontInfo.getFontFamily;

		document.body.appendChild(div);
		div.innerHTML = html;
		equal(fontGetProp(div, div.getElementsByTagName('mark')[0]), expected, 'Doesn\'t match the expected specific element style');
		div.parentNode.removeChild(div);
	};

	test('toPt', function() {
		equal(FontInfo.toPt('10px'), '8pt');
		equal(FontInfo.toPt('11px'), '8pt');
		equal(FontInfo.toPt('12.5px'), '9pt');
		equal(FontInfo.toPt('13px'), '10pt');
		equal(FontInfo.toPt('36px'), '27pt');
	});

	test('getFontSize', function() {
		assertComputedFontProp('fontSize', '<mark></mark>', '10px');
		assertComputedFontProp('fontSize', '<span><mark></mark></span>', '10px');
		assertSpecificFontProp('fontSize', '<mark style="font-size: 10px"></mark>', '10px');
		assertSpecificFontProp('fontSize', '<mark style="font-size: 14px"></mark>', '14px');
		assertSpecificFontProp('fontSize', '<mark style="font-size: 14pt"></mark>', '14pt');
		assertSpecificFontProp('fontSize', '<mark style="font-size: 14em"></mark>', '14em');
		assertSpecificFontProp('fontSize', '<span style="font-size: 10px"><mark></mark></span>', '10px');
		assertSpecificFontProp('fontSize', '<span style="font-size: 14px"><mark></mark></span>', '14px');
		assertSpecificFontProp('fontSize', '<span style="font-size: 10px"><span><mark></mark></span></span>', '10px');
		assertSpecificFontProp('fontSize', '<span style="font-size: 14px"><span><mark></mark></span></span>', '14px');
	});

	test('getFontFamily', function() {
		assertComputedFontProp('fontFamily', '<mark></mark>', 'Arial,Verdana');
		assertComputedFontProp('fontFamily', '<span><mark></mark></span>', 'Arial,Helvetica,Verdana');
		assertSpecificFontProp('fontFamily', '<mark style="font-family: Arial, Verdana"></mark>', 'Arial,Verdana');
		assertSpecificFontProp('fontFamily', '<mark style="font-family: Arial, Helvetica, Verdana"></mark>', 'Arial,Helvetica,Verdana');
		assertSpecificFontProp('fontFamily', '<span style="font-family: Arial, Verdana"><mark></mark></span>', 'Arial,Verdana');
		assertSpecificFontProp('fontFamily', '<span style="font-family: Arial, Helvetica, Verdana"><mark></mark></span>', 'Arial,Helvetica,Verdana');
		assertSpecificFontProp('fontFamily', '<span style="font-family: Arial, Verdana"><span><mark></mark></span>', 'Arial,Verdana');
		assertSpecificFontProp('fontFamily', '<span style="font-family: Arial, Helvetica, Verdana"><span><mark></mark></span></span>', 'Arial,Helvetica,Verdana');
	});

	asyncTest('getFontFamily should always return string even if display: none (firefox specific bug)', function() {
				var iframe = document.createElement('iframe');
				iframe.style.display = 'none';
				document.body.appendChild(iframe);

				iframe.addEventListener('load', function () {
					QUnit.start();
					var fontFamily = FontInfo.getFontFamily(iframe.contentDocument.body, iframe.contentDocument.body.firstChild);

					equal(typeof fontFamily, 'string', 'Should always be a string');

					iframe.parentNode.removeChild(iframe);
				}, false);

				iframe.contentDocument.open();
				iframe.contentDocument.write('<html><body><p>a</p></body></html>');
				iframe.contentDocument.close();
	});
});

ModuleLoader.require([
	"tinymce/Env",
	"tinymce/caret/FakeCaret",
	"tinymce/dom/DomQuery",
	"tinymce/text/Zwsp"
], function(Env, FakeCaret, $, Zwsp) {
	var fakeCaret;

	if (!Env.ceFalse) {
		return;
	}

	module("tinymce.caret.FakeCaret", {
		setupModule: function() {
			fakeCaret = new FakeCaret($('#view')[0], isBlock);
		},

		teardownModule: function() {
			fakeCaret.destroy();
		}
	});

	function isBlock(node) {
		return node.nodeName == 'DIV';
	}

	test('show/hide (before, block)', function() {
		var rng, $fakeCaretElm;

		$('#view').html('<div>a</div>');

		rng = fakeCaret.show(true, $('#view div')[0]);
		$fakeCaretElm = $('#view').children();

		equal($fakeCaretElm[0].nodeName, 'P');
		equal($fakeCaretElm.attr('data-mce-caret'), 'before');
		Utils.assertRange(rng, Utils.createRange($fakeCaretElm[0].firstChild, 0, $fakeCaretElm[0].firstChild, 1));

		fakeCaret.hide();
		equal($('#view *[data-mce-caret]').length, 0);
	});

	test('show/hide (before, block)', function() {
		var rng, $fakeCaretElm;

		$('#view').html('<div>a</div>');

		rng = fakeCaret.show(false, $('#view div')[0]);
		$fakeCaretElm = $('#view').children();

		equal($fakeCaretElm[1].nodeName, 'P');
		equal($fakeCaretElm.eq(1).attr('data-mce-caret'), 'after');
		Utils.assertRange(rng, Utils.createRange($fakeCaretElm[1].firstChild, 0, $fakeCaretElm[1].firstChild, 1));

		fakeCaret.hide();
		equal($('#view *[data-mce-caret]').length, 0);
	});

	test('show/hide (before, inline)', function() {
		var rng, $fakeCaretText;

		$('#view').html('<span>a</span>');

		rng = fakeCaret.show(true, $('#view span')[0]);
		$fakeCaretText = $('#view').contents();

		equal($fakeCaretText[0].nodeName, '#text');
		equal($fakeCaretText[0].data, Zwsp.ZWSP);
		Utils.assertRange(rng, Utils.createRange($fakeCaretText[0], 1));

		fakeCaret.hide();
		equal($('#view').contents()[0].nodeName, 'SPAN');
	});

	test('show/hide (after, inline)', function() {
		var rng, $fakeCaretText;

		$('#view').html('<span>a</span>');

		rng = fakeCaret.show(false, $('#view span')[0]);
		$fakeCaretText = $('#view').contents();

		equal($fakeCaretText[1].nodeName, '#text');
		equal($fakeCaretText[1].data, Zwsp.ZWSP);
		Utils.assertRange(rng, Utils.createRange($fakeCaretText[1], 1));

		fakeCaret.hide();
		equal($('#view').contents()[0].nodeName, 'SPAN');
	});

	test('getCss', function() {
		equal(fakeCaret.getCss().length > 10, true);
	});
});

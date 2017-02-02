asynctest('browser.tinymce.core.noname', [
	'ephox.mcagar.api.LegacyUnit',
	'ephox.agar.api.Pipeline',
	"tinymce/Env",
	"tinymce.caret.FakeCaret",
	"tinymce.dom.DomQuery",
	"tinymce.text.Zwsp"
], function (LegacyUnit, Pipeline, Env, FakeCaret, $, Zwsp) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];
	var suite = LegacyUnit.createSuite();

	var fakeCaret;

	if (!Env.ceFalse) {
		return;
	}

	module("tinymce.caret.FakeCaret", {
		setupModule: function () {
			fakeCaret = new FakeCaret($('#view')[0], isBlock);
		},

		teardownModule: function () {
			fakeCaret.destroy();
		}
	});

	function isBlock (node) {
		return node.nodeName == 'DIV';
	}

	suite.test('show/hide (before, block)', function () {
		var rng, $fakeCaretElm;

		$('#view').html('<div>a</div>');

		rng = fakeCaret.show(true, $('#view div')[0]);
		$fakeCaretElm = $('#view').children();

		LegacyUnit.equal($fakeCaretElm[0].nodeName, 'P');
		LegacyUnit.equal($fakeCaretElm.attr('data-mce-caret'), 'before');
		Utils.assertRange(rng, Utils.createRange($fakeCaretElm[0], 0, $fakeCaretElm[0], 0));

		fakeCaret.hide();
		LegacyUnit.equal($('#view *[data-mce-caret]').length, 0);
	});

	suite.test('show/hide (before, block)', function () {
		var rng, $fakeCaretElm;

		$('#view').html('<div>a</div>');

		rng = fakeCaret.show(false, $('#view div')[0]);
		$fakeCaretElm = $('#view').children();

		LegacyUnit.equal($fakeCaretElm[1].nodeName, 'P');
		LegacyUnit.equal($fakeCaretElm.eq(1).attr('data-mce-caret'), 'after');
		Utils.assertRange(rng, Utils.createRange($fakeCaretElm[1], 0, $fakeCaretElm[1], 0));

		fakeCaret.hide();
		LegacyUnit.equal($('#view *[data-mce-caret]').length, 0);
	});

	suite.test('show/hide (before, inline)', function () {
		var rng, $fakeCaretText;

		$('#view').html('<span>a</span>');

		rng = fakeCaret.show(true, $('#view span')[0]);
		$fakeCaretText = $('#view').contents();

		LegacyUnit.equal($fakeCaretText[0].nodeName, '#text');
		LegacyUnit.equal($fakeCaretText[0].data, Zwsp.ZWSP);
		Utils.assertRange(rng, Utils.createRange($fakeCaretText[0], 1));

		fakeCaret.hide();
		LegacyUnit.equal($('#view').contents()[0].nodeName, 'SPAN');
	});

	suite.test('show/hide (after, inline)', function () {
		var rng, $fakeCaretText;

		$('#view').html('<span>a</span>');

		rng = fakeCaret.show(false, $('#view span')[0]);
		$fakeCaretText = $('#view').contents();

		LegacyUnit.equal($fakeCaretText[1].nodeName, '#text');
		LegacyUnit.equal($fakeCaretText[1].data, Zwsp.ZWSP);
		Utils.assertRange(rng, Utils.createRange($fakeCaretText[1], 1));

		fakeCaret.hide();
		LegacyUnit.equal($('#view').contents()[0].nodeName, 'SPAN');
	});

	suite.test('getCss', function () {
		LegacyUnit.equal(fakeCaret.getCss().length > 10, true);
	});

	Pipeline.async({}, suite.toSteps({}), function () {
		success();
	}, failure);
});

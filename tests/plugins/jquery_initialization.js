module("tinymce.plugins.jQueryInitialization", {
	setupModule: function() {
		document.getElementById('view').innerHTML = (
			'<textarea id="elm1"></textarea>' +
			'<textarea id="elm2"></textarea>'
		);

		this.val = $.fn.val;

		QUnit.stop();

		$(function() {
			QUnit.start();
		});
	},

	teardown: function() {
		$.fn.val = this.val;
	}
});

test("applyPatch is only called once", function() {
	expect(1);

	var options = {plugins: [
				"pagebreak,layer,table,save,emoticons,insertdatetime,preview,media,searchreplace",
				"print,contextmenu,paste,directionality,fullscreen,noneditable,visualchars,nonbreaking,template"
			]},
		oldValFn;

	$('#elm1').tinymce(options);

	oldValFn = $.fn.val = function() {
		// no-op
	};

	$('#elm2').tinymce(options);

	equal($.fn.val, oldValFn);
});

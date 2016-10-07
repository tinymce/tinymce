module("tinymce.options", {
    setup: function() {
        var i, htmlReset = '';
        for (i = 1; i < 9; i++) {
            htmlReset += '<textarea id="elm-' + i + '" class="' + (i&1 ? 'elm-odd' : 'elm-even') + '"></textarea>';
        }

        document.getElementById('view').innerHTML = htmlReset;
    },

	teardown: function() {
        var ed;
		while ((ed = tinymce.editors.pop())) {
            ed.remove();
        }
	}
});


test("target (initialised properly)", function() {
    var elm1 = document.getElementById('elm-1');

    QUnit.stop();

    tinymce.init({
        target: elm1,
        init_instance_callback: function(ed) {
            QUnit.start();

            equal(ed.targetElm, elm1);
        }
    });
});


test("target (initialise on element without id)", function() {
    var elm = document.createElement('textarea');
    document.getElementById('view').appendChild(elm);

    QUnit.stop();

    tinymce.init({
        target: elm,
        init_instance_callback: function(ed) {
            QUnit.start();

            ok(ed.id, "editors id set to: " + ed.id);
            equal(ed.targetElm, elm);
        }
    });
});


test("target (selector option takes precedence over target option)", function() {
    var elm1 = document.getElementById('elm-1');
    var elm2 = document.getElementById('elm-2');

    QUnit.stop();

    tinymce.init({
        selector: '#elm-2',
        target: elm1,
        init_instance_callback: function(ed) {
            QUnit.start();

            equal(ed.targetElm, elm2);
        }
    });
});


test("target (each editor should have a different target)", function() {
    var maxCount = $('.elm-even').length;
    var elm1 = document.getElementById('elm-1');
    var count = 0;
    var targets = [];

    QUnit.stop();

    tinymce.init({
        selector: '.elm-even',
        target: elm1,
        init_instance_callback: function(ed) {
            notEqual(ed.targetElm, elm1, "target option ignored");
            ok($.inArray(ed.targetElm, targets) === -1);

            targets.push(ed.targetElm);

            if (++count >= maxCount) {
                QUnit.start();
            }
        }
    });
});
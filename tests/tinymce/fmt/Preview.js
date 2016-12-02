ModuleLoader.require(["tinymce/fmt/Preview"], function(Preview) {
    module("tinymce.fmt.Preview", {
        setupModule: function () {
            QUnit.stop();

            tinymce.init({
                selector: "textarea",
                add_unload_trigger: false,
                disable_nodechange: true,
                skin: false,
                entities: 'raw',
                indent: false,
                init_instance_callback: function (ed) {
                    editor = ed;
                    QUnit.start();
                }
            });
        }
    });


    test('Get preview css text for formats', function () {

        function getCssText(format) {
            return Preview.getCssText(editor, format);
        }

        ok(/font-weight\:(bold|700)/.test(getCssText('bold')),
            'Bold not found in preview style');

        ok(/font-weight\:(bold|700)/.test(getCssText({inline: 'b'})),
            'Bold not found in preview style');

        ok(!/font-weight\:(bold|700)/.test(getCssText({inline: 'b', preview: 'font-size'})),
            'Bold should not be when only we only preview font-size');

        editor.dom.addStyle(
            'table .preview {' +
            'color: rgb(0, 255, 0);' + // green
            '}' +

            'ol .preview {' +
            'color: rgb(0, 0, 255);' + // blue
            '}' +

            '.preview {' +
            'color: rgb(255, 0, 0);' + // red
            '}'
        );

        ok(/color\:rgb\(0, 255, 0\)/.test(getCssText({selector: 'tr', classes: ['preview']})),
            'Style is properly inherited in preview for partial element (like TR).');


        ok(/color\:rgb\(255, 0, 0\)/.test(getCssText({selector: 'li', classes: ['preview']})),
            'For LI element default required parent is UL.');

        ok(/color\:rgb\(0, 0, 255\)/.test(getCssText({selector: 'ol li', classes: ['preview']})),
            'Parent explicitly present in the selector will have preference.');

        ok(/color\:rgb\(0, 0, 255\)/.test(getCssText({selector: 'ol > li', classes: ['preview']})),
            'ol > li previewed properly.');

        ok(/color\:rgb\(0, 0, 255\)/.test(getCssText({
                selector: 'ol.someClass > li#someId[title="someTitle"]',
                classes: ['preview']
            })),
            'ol.someClass > li#someId[title="someTitle"] previewed properly.');

        ok(/color\:rgb\(0, 0, 255\)/.test(getCssText({
                selector: 'ul + ol.someClass > li#someId',
                classes: ['preview']
            })),
            'ul + ol.someClass > li#someId previewed properly.');

        ok(/color\:rgb\(0, 0, 255\)/.test(getCssText({selector: 'ul li ol li', classes: ['preview']})),
            'ul li ol li previewed properly.');
    });


    test('Preview.parseSelector()', function() {

        deepEqual(Preview.parseSelector('li.class1.class2#id1[attr1="1"]:disabled'), [
            {
                name: 'li',
                selector: 'li.class1.class2#id1[attr1="1"]:disabled',
                classes: ['class1', 'class2'],
                attrs: {
                    id: 'id1',
                    attr1: '1',
                    disabled: 'disabled'
                }
            }
        ], 'li.class1.class2#id1 ok');


        deepEqual(Preview.parseSelector('ul.parent1 > li.class1.class2#id1'), [
            {
                name: 'li',
                selector: 'li.class1.class2#id1',
                classes: ['class1', 'class2'],
                attrs: {
                    id: 'id1'
                }
            },
            {
                name: 'ul',
                selector: 'ul.parent1',
                classes: ['parent1'],
                attrs: {}
            }
        ], 'ul.parent1 > li.class1.class2#id1 ok');


        deepEqual(Preview.parseSelector('div.class1 > ol.class2 + ul > li:hover'), [
            {
                name: 'li',
                selector: 'li:hover',
                classes: [],
                attrs: {}
            },
            {
                name: 'ul',
                selector: 'ul',
                classes: [],
                attrs: {},
                siblings: [
                    {
                        name: 'ol',
                        selector: 'ol.class2',
                        classes: ['class2'],
                        attrs: {}
                    }
                ]
            },
            {
                name: 'div',
                selector: 'div.class1',
                classes: ['class1'],
                attrs: {}
            }
        ], 'div.class1 > ol.class2 + ul > li:hover ok');

				deepEqual(Preview.parseSelector('.class > *'), [
            {
								name: "div",
								selector: "*",
								attrs: {},
								classes: []
						},
						{
								name: "div",
								selector: ".class",
								classes: ["class"],
								attrs: {}
						}
        ], '.class > * ok');

				deepEqual(Preview.parseSelector('p + *'), [
            {
								name: "div",
								selector: "*",
								attrs: {},
								classes: [],
								siblings: [
									{
											name: "p",
											selector: "p",
											attrs: {},
											classes: []
									}
								]
						}
        ], 'p + * ok');

				deepEqual(Preview.parseSelector('*.test'), [
            {
								name: "*",
								selector: "*.test",
								attrs: {},
								classes: ['test']
						}
        ], '*.test ok');

    });


    test('Preview.selectorToHtml()', function() {
        function trimSpaces(str) {
            return str.replace(/>\s+</g, '><').replace(/^\s*|\s*$/g, '');
        }

        function selectorToHtml(selector) {
            return Utils.normalizeHtml(Preview.selectorToHtml(selector).outerHTML);
        }

        equal(selectorToHtml('ul > li.class1'), trimSpaces([
            '<div>',
                '<ul>',
                    '<li class="class1"></li>',
                '</ul>',
            '</div>'
        ].join('')), 'ul > li.class1 ok');


        equal(selectorToHtml('ol + ul#id1 > li.class1[title="Some Title"]'), trimSpaces([
            '<div>',
                '<div>',
                    '<ol></ol>',
                    '<ul id="id1">',
                      '  <li class="class1" title="Some Title"></li>',
                    '</ul>',
                '</div>',
            '</div>'
        ].join('')), 'ol + ul#id1 > li.class1[title="Some Title"] ok');


        equal(selectorToHtml('tr > th + td'), trimSpaces([
            '<div>',
                '<table>',
                    '<tbody>',
                        '<tr>',
                            '<th></th>',
                            '<td></td>',
                        '</tr>',
                    '</tbody>',
                '</table>',
            '</div>'
        ].join('')), 'tr > th + td (required parental structure properly rebuilt) ok');


        equal(selectorToHtml('p li[title="Some Title"][alt="Some Alt"]'), trimSpaces([
            '<div>',
                '<p>',
                    '<ul>',
                        '<li alt="Some Alt" title="Some Title"></li>',
                    '</ul>',
                '</p>',
            '</div>'
        ].join('')), 'p li[title="Some Title"][alt="Some Alt"] (test multiple spaced attributes) ok');

    });
});
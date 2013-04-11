function fakeTypeAURL(url) {
	return function(callback) {
        // type the URL and then press the space bar
        tinymce.execCommand('mceInsertContent', false, url);
        window.robot.type(32, false, callback, editor.selection.getNode());
    };
}

function fakeTypeAnEclipsedURL(url) {
	return function(callback) {
        // type the URL and then type ')'
        tinymce.execCommand('mceInsertContent', false, '(' + url);
		window.robot.typeSymbol(")", function() {
            window.robot.type(32, false, callback, editor.selection.getNode());
        }, editor.selection.getNode());
    };
}

function fakeTypeANewlineURL(url) {
	return function(callback) {
        // type the URL and then press the enter key
        tinymce.execCommand('mceInsertContent', false, url);
        window.robot.type('\n', false, callback, editor.selection.getNode());
    };
}

createAction('Typing HTTP URL', fakeTypeAURL('http://www.ephox.com'));
createAction('Typing HTTPS URL', fakeTypeAURL('https://www.ephox.com'));
createAction('Typing SSH URL', fakeTypeAURL('ssh://www.ephox.com'));
createAction('Typing FTP URL', fakeTypeAURL('ftp://www.ephox.com'));
createAction('Typing WWW URL', fakeTypeAURL('www.ephox.com'));
createAction('Typing WWW URL With End Dot', fakeTypeAURL('www.site.com.'));
createAction('Typing Mail Addr', fakeTypeAURL('user@domain.com'));
createAction('Typing Mail Addr With Protocol', fakeTypeAURL('mailto:user@domain.com'));
createAction('Typing Dashed Mail Addr', fakeTypeAURL('first-last@domain.com'));
createAction('Typing Eclipsed HTTP URL', fakeTypeAnEclipsedURL('http://www.ephox.com'));
createAction('Typing Eclipsed HTTPS URL', fakeTypeAnEclipsedURL('https://www.ephox.com'));
createAction('Typing Eclipsed SSH URL', fakeTypeAnEclipsedURL('ssh://www.ephox.com'));
createAction('Typing Eclipsed FTP URL', fakeTypeAnEclipsedURL('ftp://www.ephox.com'));
createAction('Typing Eclipsed WWW URL', fakeTypeAnEclipsedURL('www.ephox.com'));
createAction('Typing HTTP URL And Newline', fakeTypeANewlineURL('http://www.ephox.com'));
createAction('Typing HTTPS URL And Newline', fakeTypeANewlineURL('https://www.ephox.com'));
createAction('Typing SSH URL And Newline', fakeTypeANewlineURL('ssh://www.ephox.com'));
createAction('Typing FTP URL And Newline', fakeTypeANewlineURL('ftp://www.ephox.com'));
createAction('Typing WWW URL And Newline', fakeTypeANewlineURL('www.ephox.com'));
createAction('Applying OL', 'InsertOrderedList');
createAction('Applying UL', 'InsertUnorderedList');
createAction('Indenting', 'Indent');
createAction('Outdenting', 'Outdent');
createAction('Typing Enter', fakeKeyPressAction('\n'));
createAction('Typing Tab', fakeKeyPressAction('\t'));
createAction('Typing Shift Tab', fakeKeyPressAction('\t', true));

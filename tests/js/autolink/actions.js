function fakeKeyPressAction(keyCode, shiftKey) {
	return function(callback) {
		setTimeout(function() {
			window.robot.type(keyCode, shiftKey, callback);
		}, 1);
	};
}

function createAction(name, action) {
	window[name.replace(/\s+/g, '')] = new dsl.Action(name, action);
}

function fakeTypeAURL(url)
{
	return function(callback) {
        // type the URL and then press the space bar
        tinyMCE.execCommand('mceInsertContent', false, url);
        window.robot.type(32, false, callback);
    };
}

createAction('Typing HTTP URL', fakeTypeAURL('http://www.ephox.com'));
createAction('Typing HTTPS URL', fakeTypeAURL('https://www.ephox.com'));
createAction('Typing SSH URL', fakeTypeAURL('ssh://www.ephox.com'));
createAction('Typing FTP URL', fakeTypeAURL('ftp://www.ephox.com'));
createAction('Typing WWW URL', fakeTypeAURL('www.ephox.com'));
createAction('Applying OL', 'InsertOrderedList');
createAction('Applying UL', 'InsertUnorderedList');
createAction('Indenting', 'Indent');
createAction('Outdenting', 'Outdent');
createAction('Typing Enter', fakeKeyPressAction('\n'));
createAction('Typing Tab', fakeKeyPressAction('\t'));
createAction('Typing Shift Tab', fakeKeyPressAction('\t', true));
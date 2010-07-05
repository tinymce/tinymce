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

createAction('Applying OL', 'InsertOrderedList');
createAction('Applying UL', 'InsertUnorderedList');
createAction('Indenting', 'Indent');
createAction('Outdenting', 'Outdent');
createAction('Typing Enter', fakeKeyPressAction('\n'));
createAction('Typing Tab', fakeKeyPressAction('\t'));
createAction('Typing Shift Tab', fakeKeyPressAction('\t', true));
createAction('Applying OL', 'InsertOrderedList');
createAction('Applying UL', 'InsertUnorderedList');
createAction('Indenting', 'Indent');
createAction('Outdenting', 'Outdent');
createAction('Typing Enter', fakeKeyPressAction('\n'));
createAction('Typing Tab', fakeKeyPressAction('\t'));
createAction('Typing Shift Tab', fakeKeyPressAction('\t', true));
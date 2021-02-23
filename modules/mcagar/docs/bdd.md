# BDD testing

The following are the primary modules used when testing TinyMCE using the behavior-driven development tests.

## TinyHooks

The `TinyHooks` module registers `before` and `after` hooks to set up TinyMCE in a test. It takes the TinyMCE settings and will then initialize the editor during the test suite setup phase. Additional module setup functions (such as a plugin constructor) can also be provided and will be called before the editor is initialized. The editor instance can be accessed inside a test by calling the `editor()` function on the object returned by the hook function.

> 💡 **Note:** The editor is only initialized once per suite instead of per test, so be sure to close open dialogs, or reset any state after each test.

Available functions:
- `bddSetup(settings: RawEditorSettings, setupModules?: Array<() => void>, focusOnInit?: boolean)`
  - Sets up the editor using the settings provided. This is the most common way to setup and test TinyMCE.
- `bddSetupLight(settings: RawEditorSettings, setupModules?: Array<() => void>, focusOnInit?: boolean)`
  - Similar to `bddSetup`, except that by default the editor `menubar`, `toolbar` and `statusbar` will not be rendered. This helps to speed up tests where the UI isn't required.
- `bddSetupFromElement(settings: RawEditorSettings, setupElement: () => SetupElement, setupModules?: Array<() => void>, focusOnInit?: boolean)`
  - Provides a way to setup an editor using a custom element. A callback function is required which should setup the element to use and then return a function to teardown the element when the tests have completed.
- `bddSetupInShadowRoot(settings: RawEditorSettings, setupModules?: Array<() => void>, focusOnInit?: boolean)`
  - Sets up the editor within a shadow root using the settings provided. An additional `shadowRoot` lookup function is provided in the hook return object.

### Example: Using TinyHooks to test a custom plugin

```js
import { TinyHooks } from '@ephox/mcagar';
import { Editor } from 'tinymce';

import { Plugin } from '../../main/ts/Plugin';

describe('My Custom Plugin', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'customplugin',
    toolbar: 'custom',
    customplugin_setting: true
  }, [ Plugin ]);

  it('should include a custom toolbar button', () => {
    const editor = hook.editor();
    // Assert the editor has a custom toolbar button rendered
    ...
  });
});
```

## TinyContentActions

The `TinyContentActions` module provides helper functions to perform actions in the content of the editor.

### Keyboard actions

The following functions are available to simulate keyboard events in the editor content:

- `keydown(editor: Editor, keyCode: number, modifiers?: Record<string, boolean>)`
  - Simulates a `keydown` keyboard event against the focused element in the content of the editor.
- `keyup(editor: Editor, keyCode: number, modifiers?: Record<string, boolean>)`
  - Simulates a `keuyp` keyboard event against the focused element in the content of the editor.
- `keypress(editor: Editor, keyCode: number, modifiers?: Record<string, boolean>)`
  - Simulates a `keypress` keyboard event against the focused element in the content of the editor.
- `keystroke(editor: Editor, keyCode: number, modifiers?: Record<string, boolean>)`
  - Simulates `keydown`, `keypress` and then a `keyup` keyboard events against the focused element in the content of the editor.
- `type(editor: Editor, content: string)`
  - Simulates typing the specified `content` one character at a time in the content of the editor.

## TinyUiActions

The `TinyUiActions` module provides helper functions to perform actions against the User Interface (UI) of the editor.

###  Dialog actions

The following functions are available to open or close dialogs:

- `submitDialog(editor: Editor, dialogSelector?: string))`
  - Clicks the `Save` button in the dialog to submit changes.
- `cancelDialog(editor: Editor, dialogSelector?: string)`
  - Clicks the `Cancel` button in the dialog to discard changes.
- `closeDialog(editor: Editor, dialogSelector?: string)`
  - Clicks the `X` button in the dialog to discard changes.
- `pWaitForDialog(editor: Editor, dialogSelector?: string)`
  - Returns a `Promise` that will resolve when a dialog has finished opening.

### Keyboard actions

The following functions are available to simulate keyboard events in the editor UI:

- `keydown(editor: Editor, keyCode: number, modifiers?: Record<string, boolean>)`
  - Simulates a `keydown` keyboard event against the focused element in the UI of the editor.
- `keyup(editor: Editor, keyCode: number, modifiers?: Record<string, boolean>)`
  - Simulates a `keuyp` keyboard event against the focused element in the UI of the editor.
- `keypress(editor: Editor, keyCode: number, modifiers?: Record<string, boolean>)`
  - Simulates a `keypress` keyboard event against the focused element in the UI of the editor.
- `keystroke(editor: Editor, keyCode: number, modifiers?: Record<string, boolean>)`
  - Simulates `keydown`, `keypress` and then a `keyup` keyboard events against the focused element in the UI of the editor.
- `type(editor: Editor, content: string)`
  - Simulates typing the specified `content` one character at a time in the UI of the editor.

### Other actions

The following functions are available to mouse clicks or wait for changes in the UI:

- `clickOnMenu(editor: Editor, selector: string)`
  - Clicks on a menu item that matches the specified selector.
- `clickOnToolbar(editor: Editor, selector: string)`
  - Clicks on a toolbar button that matches the specified selector.
- `clickOnUi(editor: Editor, selector: string)`
  - Clicks on UI element that matches the specified selector.
- `pTriggerContextMenu(editor: Editor, targetSelector: string, menuSelector: string)`
  - Activates the context menu on the target selector in the editor content. It will return a `Promise` that will resolve when the specified `menuSelector` is visible in the UI.
- `pWaitForPopup(editor: Editor, selector: string)`
  - Returns a `Promise` that will resolve when a UI element matching the specified selector is visible.
- `pWaitForUi(editor: Editor, selector: string)`
  - Returns a `Promise` that will resolve when a UI element matching the specified selector exists in the DOM. This is similar to `pWaitForPopup`, except the element may not be visible.

#### Example: Clicking a toolbar button and waiting for a dialog

```js
it('should open a dialog when clicking a toolbar button', async () => {
  const editor = hook.editor();
  TinyUiActions.clickOnToolbar(editor, 'button[aria-label="My Button"]');
  await TinyUiActions.pWaitForDialog(editor);
  TinyUiActions.closeDialog(editor);
});
```

## TinySelections

The `TinySelections` module provides helper functions to set the selection inside the editor.

This module relies on defining an "element path" to specify the element to be selected. The element path is a number array of child node indexes starting from the root element. As an example, take the following table. The path to the `Cell 6` text node would be `[ 0, 1, 2, 0 ]`, or to explain using the element names `[ tbody, 2nd tr, 3rd td, text ]`.

```html
<table>
  <tbody>
    <tr>
      <td>Cell 1</td>
      <td>Cell 2</td>
      <td>Cell 3</td>
    </tr>
    <tr>
      <td>Cell 4</td>
      <td>Cell 5</td>
      <td>Cell 6</td>
    </tr>
  </tbody>
</table>
```

The following functions are available:
- `setCursor(editor: Editor, path: number[], offset: number)`
  - Sets a collapsed selection in the editor using the specified element path and offset.
- `setSelection(editor: Editor, startPath: number[], startOffset: number, endPath: number[], endOffset: number)`
  - Sets a selection that extends across multiple characters or elements in the editor by using the specified element paths and offsets.
- `setSelectionFrom(editor: Editor, spec: CursorSpec | RangeSpec)`
  - Sets the selection in the editor using a `Cursors` specification from the `Agar` library.
- `select(editor: Editor, selector: string, path: number[])`
  - Select an element inside the editor, such as a `img` element using a selector and element path.

### Example: Setting the selection inside a paragraph

```js
it('should set the selection inside a paragraph', () => {
  const editor = hook.editor();
  editor.setContent('<p>Content</p>');
  TinySelections.setSelection(editor, [ 0 ], 3, [ 0 ], 7); // Selects `tent` in the paragraph
});
```

### Example: Selecting an image

```js
it('should set the selection around an image', () => {
  const editor = hook.editor();
  editor.setContent('<p><img src="..."></p>');
  TinySelections.select(editor, 'img', []);
});
```

## TinyAssertions

The `TinyAssertions` module provides helper functions to assert the state of the editor.

### Content assertions

The following functions are available to assert the editor content:

- `assertContent(editor: Editor, expectedContent: string)`
  - Assert the content of the editor matches the expected content. The content is retrieved using `editor.getContent()`.
- `assertRawContent(editor: Editor, expectedContent: string)`
  - Assert the raw content of the editor. This is the HTML directly pulled from the editor body using `editor.getBody().innerHTML`. This can be useful to assert content that only appears while editing, such as bogus br elements.
- `assertContentPresence(editor: Editor, expected: Record<string, number>)`
  - Assert the presence of content in the editor. This takes an object containing a key-value pair where the key is a CSS selector, and the value is the number of times a match should be found for that selector.
- `assertContentStructure(editor: Editor, expected: StructAssert)`
  - Assert the content structure of the editor content using an `Agar` approximate structure (`ApproxStructure`).

#### Example: Asserting content using presence and structure

```js
it('should check the editor structure', () => {
  const editor = hook.editor();
  editor.setContent('<p class="red">Content</p>');
  TinyAssertions.assertContentPresence(editor, {
    'p': 1
  });
  TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => {
    return s.element('body', {
      children: [
        s.element('p', {
          classes: [ arr.has('red') ],
          children: [
            s.text(str.is('Content'))
          ]
        })
      ]
    });
  }));
});
```

### Selection assertions

The following functions are available to assert the editor selection:

- `assertCursor(editor: Editor, path: number[], offset: number)`
  - Assert the selection location in the editor using the specified element path and offset. This is used to check that the selection is collapsed.
- `assertCursor(editor: Editor, startPath: number[], startOffset: number, endPath: number[], enndOffset: number)`
  - Assert the selection location in the editor using the specifying element paths and offsets.

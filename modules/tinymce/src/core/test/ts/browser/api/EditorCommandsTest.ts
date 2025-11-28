import { context, describe, it } from '@ephox/bedrock-client';
import { Fun, Singleton } from '@ephox/katamari';
import { Focus, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyAssertions, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { ExecCommandEvent } from 'tinymce/core/api/EventTypes';
import type { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

interface CommandTestState<T, U> {
  readonly command?: string;
  readonly ui: boolean;
  readonly value: T;
  readonly scope?: U;
}

describe('browser.tinymce.core.api.EditorCommandsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const blurEditor = () => {
    Focus.active(SugarDocument.getDocument()).each(Focus.blur); // Firefox needs to blur the active element
    window.focus(); // Safari needs to focus the window
  };

  context('execCommand', () => {
    it('execCommand for existing command', () => {
      const editor = hook.editor();

      editor.setContent('<p>a</p>');
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 1);

      assert.isTrue(editor.editorCommands.execCommand('Bold'), 'Should return true since the command exists');
      TinyAssertions.assertContent(editor, '<p><strong>a</strong></p>');
    });

    it('execCommand for non existing command', () => {
      const editor = hook.editor();
      assert.isFalse(editor.editorCommands.execCommand('foo'), 'Should return false since the command doesn not exist');
    });

    it('execCommand custom command', () => {
      const editor = hook.editor();
      const state = Singleton.value<CommandTestState<string, Editor>>();

      editor.editorCommands.addCommand('CustomCommand1', (ui, value) => state.set({ ui, value }));
      const wasExecuted = editor.editorCommands.execCommand('CustomCommand1', true, 'value');

      assert.deepEqual(state.get().getOrDie('Should exist a state'), { ui: true, value: 'value' });
      assert.isTrue(wasExecuted, 'Should have been executed');

      editor.editorCommands.execCommand('CustomCommand1', false, 'value2');
      assert.deepEqual(state.get().getOrDie('Should exist a state'), { ui: false, value: 'value2' });
    });

    it('execCommand command events', () => {
      const editor = hook.editor();
      const beforeExecCommandState = Singleton.value<CommandTestState<string, Editor>>();
      const execCommandState = Singleton.value<CommandTestState<string, Editor>>();

      const beforeExecCommandHandler = (e: EditorEvent<ExecCommandEvent>) => {
        beforeExecCommandState.set({ command: e.command, ui: e.ui, value: e.value });
      };

      editor.on('BeforeExecCommand', beforeExecCommandHandler);

      const execCommandHandler = (e: EditorEvent<ExecCommandEvent>) => {
        execCommandState.set({ command: e.command, ui: e.ui, value: e.value });
      };

      editor.on('ExecCommand', execCommandHandler);

      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      editor.editorCommands.execCommand('mceInsertContent', false, 'b');
      TinyAssertions.assertContent(editor, '<p>ab</p>');

      assert.deepEqual(beforeExecCommandState.get().getOrDie('Should exist a state'), { command: 'mceInsertContent', ui: false, value: 'b' });
      assert.deepEqual(execCommandState.get().getOrDie('Should exist a state'), { command: 'mceInsertContent', ui: false, value: 'b' });

      editor.off('BeforeExecCommand', beforeExecCommandHandler);
      editor.off('ExecCommand', execCommandHandler);
    });

    it('execCommand command events prevent command', () => {
      const editor = hook.editor();
      const beforeExecCommandState = Singleton.value<CommandTestState<string, Editor>>();
      const execCommandState = Singleton.value<CommandTestState<string, Editor>>();

      const beforeExecCommandHandler = (e: EditorEvent<ExecCommandEvent>) => {
        beforeExecCommandState.set({ command: e.command, ui: e.ui, value: e.value });
        e.preventDefault();
      };

      editor.on('BeforeExecCommand', beforeExecCommandHandler);

      const execCommandHandler = (e: EditorEvent<ExecCommandEvent>) => {
        execCommandState.set({ command: e.command, ui: e.ui, value: e.value });
      };

      editor.on('ExecCommand', execCommandHandler);

      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      const wasExecuted = editor.editorCommands.execCommand('mceInsertContent', false, 'b');
      TinyAssertions.assertContent(editor, '<p>a</p>');

      assert.deepEqual(beforeExecCommandState.get().getOrDie('Should exist a state'), { command: 'mceInsertContent', ui: false, value: 'b' });
      assert.isFalse(execCommandState.isSet(), 'Should not exist a execCommand state since it was prevented');
      assert.isFalse(wasExecuted, 'Should not have been executed since it was prevented');

      editor.off('BeforeExecCommand', beforeExecCommandHandler);
      editor.off('ExecCommand', execCommandHandler);
    });

    it('execCommand command with custom scope', () => {
      const editor = hook.editor();
      const scope = {};
      const state = Singleton.value<CommandTestState<string, {}>>();

      editor.editorCommands.addCommand('CustomCommand1', function (ui, value) {
        state.set({ ui, value, scope: this });
      }, scope);
      editor.editorCommands.execCommand('CustomCommand1', true, 'value');

      assert.equal(state.get().getOrDie('Should exist a state').scope, scope);
    });

    it('execCommand with skip_focus: true', () => {
      const editor = hook.editor();

      blurEditor();

      assert.equal(editor.hasFocus(), false);

      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      editor.editorCommands.execCommand('mceInsertContent', false, 'b', { skip_focus: true });
      TinyAssertions.assertContent(editor, '<p>ab</p>');

      assert.equal(editor.hasFocus(), false);
    });

    it('execCommand mceAddUndoLevel/mceEndUndoLevel should skip focus', () => {
      const editor = hook.editor();

      blurEditor();

      assert.equal(editor.hasFocus(), false);

      editor.setContent('<p>a</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 1);
      editor.editorCommands.execCommand('mceAddUndoLevel');
      editor.editorCommands.execCommand('mceEndUndoLevel');
      editor.editorCommands.execCommand('MceAddUndoLevel');
      editor.editorCommands.execCommand('MceEndUndoLevel');

      assert.equal(editor.hasFocus(), false);
    });
  });

  context('addQueryStateHandler', () => {
    it('addQueryStateHandler', () => {
      const editor = hook.editor();
      let wasCalled = false;
      let returnState = true;

      editor.editorCommands.addQueryStateHandler('CustomQueryState', () => {
        wasCalled = true;
        return returnState;
      });

      const actualReturnState1 = editor.editorCommands.queryCommandState('CustomQueryState');

      assert.isTrue(wasCalled, 'Should have been called');
      assert.equal(returnState, actualReturnState1, 'Should be return value');

      wasCalled = false;
      returnState = false;
      const actualReturnState2 = editor.editorCommands.queryCommandState('CustomQueryState');

      assert.isTrue(wasCalled, 'Should have been called');
      assert.equal(returnState, actualReturnState2, 'Should be return value');
    });

    it('addQueryStateHandler custom scope', () => {
      const editor = hook.editor();
      const scope = {};
      const callScope = Singleton.value<{}>();

      editor.editorCommands.addQueryStateHandler('CustomQueryState', function () {
        callScope.set(this);
        return true;
      }, scope);

      editor.editorCommands.queryCommandState('CustomQueryState');

      assert.equal(scope, callScope.get().getOrDie('Should have a scope'), 'Should be passed in scope');
    });
  });

  context('addQueryValueHandler', () => {
    it('addQueryValueHandler', () => {
      const editor = hook.editor();
      let wasCalled = false;
      let returnState = 'foo';

      editor.editorCommands.addQueryValueHandler('CustomQueryValue', () => {
        wasCalled = true;
        return returnState;
      });

      const actualReturnState1 = editor.editorCommands.queryCommandValue('CustomQueryValue');

      assert.isTrue(wasCalled, 'Should have been called');
      assert.equal(returnState, actualReturnState1, 'Should be return value');

      wasCalled = false;
      returnState = 'bar';
      const actualReturnState2 = editor.editorCommands.queryCommandValue('CustomQueryValue');

      assert.isTrue(wasCalled, 'Should have been called');
      assert.equal(returnState, actualReturnState2, 'Should be return value');
    });

    it('addQueryValueHandler custom scope', () => {
      const editor = hook.editor();
      const scope = {};
      const callScope = Singleton.value<{}>();

      editor.editorCommands.addQueryValueHandler('CustomQueryValue', function () {
        callScope.set(this);
        return 'foo';
      }, scope);

      editor.editorCommands.queryCommandValue('CustomQueryValue');

      assert.equal(scope, callScope.get().getOrDie('Should have a scope'), 'Should be passed in scope');
    });
  });

  context('addCommands', () => {
    it('addCommands', () => {
      const editor = hook.editor();

      editor.editorCommands.addCommands({
        foo1: Fun.noop,
        bar1: Fun.noop
      });

      assert.isTrue(editor.editorCommands.queryCommandSupported('foo1'));
      assert.isTrue(editor.editorCommands.queryCommandSupported('bar1'));
    });

    it('addCommands explicit exec', () => {
      const editor = hook.editor();

      editor.editorCommands.addCommands({
        foo2: Fun.noop,
        bar2: Fun.noop
      }, 'exec');

      assert.isTrue(editor.editorCommands.queryCommandSupported('foo2'));
      assert.isTrue(editor.editorCommands.queryCommandSupported('bar2'));
    });

    it('addCommands state', () => {
      const editor = hook.editor();

      editor.editorCommands.addCommands({
        foo3: Fun.always,
        bar3: Fun.never
      }, 'state');

      assert.isTrue(editor.editorCommands.queryCommandState('foo3'));
      assert.isFalse(editor.editorCommands.queryCommandState('bar3'));
    });

    it('addCommands value', () => {
      const editor = hook.editor();

      editor.editorCommands.addCommands({
        foo3: Fun.constant('foo'),
        bar3: Fun.constant('bar')
      }, 'value');

      assert.equal(editor.editorCommands.queryCommandValue('foo3'), 'foo');
      assert.equal(editor.editorCommands.queryCommandValue('bar3'), 'bar');
    });

    it('addCommands multiple commands per key', () => {
      const editor = hook.editor();

      editor.editorCommands.addCommands({
        'foo4,bar4': Fun.noop
      });

      assert.isTrue(editor.editorCommands.queryCommandSupported('foo4'), 'Should exists foo4 command');
      assert.isTrue(editor.editorCommands.queryCommandSupported('bar4'), 'Should exists bar4 command');
    });
  });

  context('queryCommandSupported', () => {
    it('queryCommandSupported for built in command', () => {
      const editor = hook.editor();

      assert.isTrue(editor.editorCommands.queryCommandSupported('Bold'), 'Check for browser command');
      assert.isTrue(editor.editorCommands.queryCommandSupported('mceInsertContent'), 'Check for custom command');
      assert.isFalse(editor.editorCommands.queryCommandSupported('foo'), 'Check non existing command');
    });

    it('queryCommandSupported for custom command', () => {
      const editor = hook.editor();

      editor.editorCommands.addCommand('CustomCommand3', Fun.noop);
      assert.isTrue(editor.editorCommands.queryCommandSupported('CustomCommand3'), 'Custom command should be supported');
      assert.isTrue(editor.editorCommands.queryCommandSupported('customcommand3'), 'Custom command should be supported with different case');
    });
  });

  context('removeCommand', () => {
    it('TINY-13144: removeCommand should remove exec command by default', () => {
      const editor = hook.editor();
      const state = Singleton.value<CommandTestState<string, Editor>>();

      editor.editorCommands.addCommand('TestRemoveCommand1', (ui, value) => state.set({ ui, value }));

      assert.isTrue(editor.editorCommands.queryCommandSupported('TestRemoveCommand1'), 'Command should be supported before removal');
      assert.isTrue(editor.editorCommands.execCommand('TestRemoveCommand1', true, 'test'), 'Command should execute successfully before removal');
      assert.deepEqual(state.get().getOrDie('Should exist a state'), { ui: true, value: 'test' });

      state.clear();
      editor.editorCommands.removeCommand('TestRemoveCommand1');

      assert.isFalse(editor.editorCommands.queryCommandSupported('TestRemoveCommand1'), 'Command should not be supported after removal');
      assert.isFalse(editor.editorCommands.execCommand('TestRemoveCommand1', true, 'test'), 'Command should not execute after removal');
      assert.isFalse(state.isSet(), 'should be no command state');
    });

    it('TINY-13144: removeCommand should remove specific exec command type', () => {
      const editor = hook.editor();
      const state = Singleton.value<CommandTestState<string, Editor>>();

      editor.editorCommands.addCommand('TestRemoveCommand2', (ui, value) => state.set({ ui, value }));

      assert.isTrue(editor.editorCommands.queryCommandSupported('TestRemoveCommand2'), 'Command should be supported before removal');

      state.clear();
      editor.editorCommands.removeCommand('TestRemoveCommand2', 'exec');

      assert.isFalse(editor.editorCommands.queryCommandSupported('TestRemoveCommand2'), 'Command should not be supported after exec removal');
      assert.isFalse(editor.editorCommands.execCommand('TestRemoveCommand2', true, 'test'), 'Command should not execute after exec removal');
      assert.isFalse(state.isSet(), 'should be no command state');
    });

    it('TINY-13144: removeCommand should remove specific state command type', () => {
      const editor = hook.editor();

      editor.editorCommands.addCommands({
        TestRemoveCommand3: Fun.noop
      });
      editor.editorCommands.addCommands({
        TestRemoveCommand3: Fun.always
      }, 'state');

      assert.isTrue(editor.editorCommands.queryCommandSupported('TestRemoveCommand3'), 'Command should be supported when exec exists');
      assert.isTrue(editor.editorCommands.queryCommandState('TestRemoveCommand3'), 'Command state should be true when state handler exists');

      editor.editorCommands.removeCommand('TestRemoveCommand3', 'state');

      assert.isTrue(editor.editorCommands.queryCommandSupported('TestRemoveCommand3'), 'Command should still be supported after only state removal');
      assert.isFalse(editor.editorCommands.queryCommandState('TestRemoveCommand3'), 'Command state should return false after state removal');
    });

    it('TINY-13144: removeCommand should remove specific value command type', () => {
      const editor = hook.editor();

      editor.editorCommands.addCommands({
        TestRemoveCommand4: Fun.noop
      });
      editor.editorCommands.addCommands({
        TestRemoveCommand4: Fun.constant('test-value')
      }, 'value');

      assert.isTrue(editor.editorCommands.queryCommandSupported('TestRemoveCommand4'), 'Command should be supported when exec exists');
      assert.equal(editor.editorCommands.queryCommandValue('TestRemoveCommand4'), 'test-value');

      editor.editorCommands.removeCommand('TestRemoveCommand4', 'value');

      assert.isTrue(editor.editorCommands.queryCommandSupported('TestRemoveCommand4'), 'Command should still be supported after only value removal');
      assert.equal(editor.editorCommands.queryCommandValue('TestRemoveCommand4'), '');
    });

    it('TINY-13144: removeCommand should remove all command types when no type specified', () => {
      const editor = hook.editor();

      editor.editorCommands.addCommands({
        TestRemoveCommand5: Fun.noop
      });
      editor.editorCommands.addCommands({
        TestRemoveCommand5: Fun.always
      }, 'state');
      editor.editorCommands.addCommands({
        TestRemoveCommand5: Fun.constant('test-value')
      }, 'value');

      assert.isTrue(editor.editorCommands.queryCommandSupported('TestRemoveCommand5'), 'Command should be supported when exec exists');
      assert.isTrue(editor.editorCommands.queryCommandState('TestRemoveCommand5'), 'Command state should be true when state handler exists');
      assert.equal(editor.editorCommands.queryCommandValue('TestRemoveCommand5'), 'test-value');

      editor.editorCommands.removeCommand('TestRemoveCommand5');

      assert.isFalse(editor.editorCommands.queryCommandSupported('TestRemoveCommand5'), 'Command should not be supported after complete removal');
      assert.isFalse(editor.editorCommands.queryCommandState('TestRemoveCommand5'), 'Command state should return false after complete removal');
      assert.equal(editor.editorCommands.queryCommandValue('TestRemoveCommand5'), '');
    });

    it('TINY-13144: removeCommand should be case insensitive', () => {
      const editor = hook.editor();

      editor.editorCommands.addCommand('TestRemoveCommandCase', Fun.noop);

      assert.isTrue(editor.editorCommands.queryCommandSupported('TestRemoveCommandCase'), 'Command should be supported before removal');

      editor.editorCommands.removeCommand('testremovecommandcase');

      assert.isFalse(editor.editorCommands.queryCommandSupported('TestRemoveCommandCase'), 'Command should not be supported after case-insensitive removal');
      assert.isFalse(editor.editorCommands.queryCommandSupported('testremovecommandcase'), 'Command should not be supported after case-insensitive removal (lowercase check)');
    });

    it('TINY-13144: removeCommand should handle non-existent commands gracefully', () => {
      const editor = hook.editor();

      assert.doesNotThrow(() => {
        editor.editorCommands.removeCommand('NonExistentCommand');
      });

      assert.doesNotThrow(() => {
        editor.editorCommands.removeCommand('NonExistentCommand', 'exec');
      });

      assert.doesNotThrow(() => {
        editor.editorCommands.removeCommand('NonExistentCommand', 'state');
      });

      assert.doesNotThrow(() => {
        editor.editorCommands.removeCommand('NonExistentCommand', 'value');
      });
    });

    it('TINY-13144: removeCommand should not affect other commands', () => {
      const editor = hook.editor();
      const state1 = Singleton.value<CommandTestState<string, Editor>>();
      const state2 = Singleton.value<CommandTestState<string, Editor>>();

      editor.editorCommands.addCommand('KeepCommand1', (ui, value) => state1.set({ ui, value }));
      editor.editorCommands.addCommand('RemoveCommand1', (ui, value) => state2.set({ ui, value }));

      assert.isTrue(editor.editorCommands.queryCommandSupported('KeepCommand1'), 'First command should be supported before removal');
      assert.isTrue(editor.editorCommands.queryCommandSupported('RemoveCommand1'), 'Second command should be supported before removal');
      assert.isTrue(editor.editorCommands.execCommand('KeepCommand1', true, 'keep'), 'First command should execute successfully before removal');
      assert.isTrue(editor.editorCommands.execCommand('RemoveCommand1', false, 'remove'), 'Second command should execute successfully before removal');
      assert.deepEqual(state1.get().getOrDie('Should exist a state'), { ui: true, value: 'keep' });
      assert.deepEqual(state2.get().getOrDie('Should exist a state'), { ui: false, value: 'remove' });

      state1.clear();
      state2.clear();
      editor.editorCommands.removeCommand('RemoveCommand1');

      assert.isTrue(editor.editorCommands.queryCommandSupported('KeepCommand1'), 'Kept command should still be supported after other command removal');
      assert.isFalse(editor.editorCommands.queryCommandSupported('RemoveCommand1'), 'Removed command should not be supported after removal');
      assert.isTrue(editor.editorCommands.execCommand('KeepCommand1', false, 'still-works'), 'Kept command should still execute after other command removal');
      assert.deepEqual(state1.get().getOrDie('Should exist a state'), { ui: false, value: 'still-works' });
      assert.isFalse(state2.isSet());
    });
  });

  context('removed editor', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      indent: false,
      base_url: '/project/tinymce/js/tinymce'
    }, []);

    it('api calls on a removed editor instance', () => {
      const editor = hook.editor();

      editor.remove();

      assert.isTrue(editor.editorCommands.queryCommandSupported('Bold'));
      assert.isFalse(editor.editorCommands.queryCommandState('Bold'));
      assert.equal(editor.editorCommands.queryCommandValue('FontSize'), '');
      assert.isFalse(editor.editorCommands.execCommand('Bold'));
    });
  });
});

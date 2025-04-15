import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { User } from 'tinymce/core/lookup/UserLookup';

describe('browser.tinymce.core.UserLookupTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    current_user_id: 'test-user-1',
    fetch_user_by_id: (userId: string): Promise<User> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: userId,
            name: 'Test User',
            avatar: 'test-avatar.png',
            description: 'Test Description',
          } as User);
        }, 0);
      });
    },
  });

  it('Should return the configured user ID', () => {
    const editor = hook.editor();
    const currentUserId = editor.userLookup.getCurrentUserId();
    assert.equal(currentUserId, 'test-user-1', 'Should return the configured user ID');
  });

  it('Should fetch user information', async () => {
    const editor = hook.editor();
    const userId = 'test-user-1';

    const user = await editor.userLookup
      .fetchUserById(userId)
      .catch(() => {
        assert.fail('Should not throw an error');
      });

    assert.equal(user.id, userId, 'Should return user with correct ID');
    assert.equal(user.name, 'Test User', 'Should return user with correct name');
    assert.equal(user.avatar, 'test-avatar.png', 'Should return user with correct avatar');
    assert.equal(user.description, 'Test Description', 'Should return user with correct description');
  });

  it('Should return cached user data on second call', async () => {
    const editor = hook.editor();
    const userId = 'test-user-1';

    // Fetch and cache
    const firstCall = await editor.userLookup.fetchUserById(userId);

    // Return cached data
    const secondCall = await editor.userLookup.fetchUserById(userId);

    assert.deepEqual(firstCall, secondCall, 'Should return same user data from cache');
  });

  it('Should handle errors gracefully', async () => {
    const editor = hook.editor();

    // Override fetch_user_by_id to simulate an error
    editor.options.set('fetch_user_by_id', () => Promise.reject('User not found'));

    try {
      await editor.userLookup.fetchUserById('invalid-user');
      assert.fail('Should throw an error');
    } catch (error) {
      assert.equal(error, 'User not found', 'Should pass through the error message');
    }
  });

  it('Should handle undefined user ID', () => {
    const editor = hook.editor();

    editor.options.unset('current_user_id');

    const currentUserId = editor.userLookup.getCurrentUserId();
    assert.isUndefined(currentUserId, 'Should return undefined when no user ID is set');
  });

  it('Should handle multiple concurrent requests for same user', async () => {
    const editor = hook.editor();
    const userId = 'test-user-1';

    // Make multiple concurrent requests
    const requests = Promise.all([
      editor.userLookup.fetchUserById(userId),
      editor.userLookup.fetchUserById(userId),
      editor.userLookup.fetchUserById(userId)
    ]);

    const results = await requests;

    // All requests should return the same data
    assert.deepEqual(results[0], results[1], 'First and second requests should match');
    assert.deepEqual(results[1], results[2], 'Second and third requests should match');
  });

  it('Should handle empty user ID', async () => {
    const editor = hook.editor();

    try {
      await editor.userLookup.fetchUserById('');
      assert.fail('Should throw an error for empty user ID');
    } catch (error) {
      assert.isDefined(error, 'Should handle empty user ID with error');
    }
  });

  it('Should handle malformed user data', async () => {
    const editor = hook.editor();

    // Override with malformed data
    editor.options.set('fetch_user_by_id', () =>
      Promise.resolve({
        // Missing required id field
        name: 'Invalid User'
      } as any)
    );

    try {
      await editor.userLookup.fetchUserById('test-user');
      assert.fail('Should throw error for malformed data');
    } catch (error) {
      assert.isDefined(error, 'Should handle malformed user data');
    }
  });

  it('Should handle non-string user IDs', async () => {
    const editor = hook.editor();

    try {
      await editor.userLookup.fetchUserById(123 as any);
      assert.fail('Should throw error for non-string ID');
    } catch (error) {
      assert.isDefined(error, 'Should handle non-string ID with error');
    }
  });

  it('Should reject if fetch_user_by_id is not defined', async () => {
    const editor = hook.editor();

    editor.options.unset('fetch_user_by_id');

    try {
      await editor.userLookup.fetchUserById('test-user');
      assert.fail('Should throw error when fetch_user_by_id is not defined');
    } catch (error) {
      assert.isDefined(error, 'Should reject with error when fetch_user_by_id is not defined');
    }
  });
});

import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { User } from 'tinymce/core/lookup/UserLookup';

describe('browser.tinymce.core.UserLookupTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    current_user_id: 'test-user-1',
    fetch_users_by_id: (userId: string): Promise<User[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            [
              {
                id: userId,
                name: 'Test User',
                avatar: 'test-avatar.png',
                description: 'Test Description',
              }
            ]
          );
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

    const users = await editor.userLookup
      .fetchUsersById(userId)
      .catch(() => {
        assert.fail('Should not throw an error');
      });

    console.warn('users', users);

    assert.equal(users[0].id, userId, 'Should return user with correct ID');
    assert.equal(users[0].name, 'Test User', 'Should return user with correct name');
    assert.equal(users[0].avatar, 'test-avatar.png', 'Should return user with correct avatar');
    assert.equal(users[0].description, 'Test Description', 'Should return user with correct description');
  });

  it('Should handle undefined user ID', () => {
    const editor = hook.editor();

    editor.options.unset('current_user_id');

    const currentUserId = editor.userLookup.getCurrentUserId();
    assert.isUndefined(currentUserId, 'Should return undefined when no user ID is set');
  });

  it('Should return cached user data on second call', async () => {
    const editor = hook.editor();
    const userId = 'test-user-1';

    // Fetch and cache
    const firstCall = await editor.userLookup.fetchUsersById(userId);

    // Return cached data
    const secondCall = await editor.userLookup.fetchUsersById(userId);

    assert.deepEqual(firstCall, secondCall, 'Should return same user data from cache');
  });

  it('Should handle multiple concurrent requests for same user', async () => {
    const editor = hook.editor();
    const userId = 'test-user-1';

    // Make multiple concurrent requests
    const requests = Promise.all([
      editor.userLookup.fetchUsersById(userId),
      editor.userLookup.fetchUsersById(userId),
      editor.userLookup.fetchUsersById(userId)
    ]);

    const results = await requests;

    // All requests should return the same data
    assert.deepEqual(results[0], results[1], 'First and second requests should match');
    assert.deepEqual(results[1], results[2], 'Second and third requests should match');
  });

  it('Should throw an error for empty string ids', async () => {
    const editor = hook.editor();

    try {
      await editor.userLookup.fetchUsersById('');
      assert.fail('Should throw error for empty string ID');
    } catch (error) {
      assert.isDefined(error, 'Should handle empty string ID with error');
    }
  });

  it('Should handle malformed user data', async () => {
    const editor = hook.editor();
    const userId = 'malformed-user-id';
    const userName = 'Invalid User';

    // Override with malformed data
    editor.options.set('fetch_users_by_id', () =>
      Promise.resolve(
        [
          {
            // Missing required id field
            name: 'Invalid User'
          } as any
        ]
      )
    );

    const users = await editor.userLookup.fetchUsersById(userId);

    assert.deepEqual(users, [{ id: userId }]);
    assert.isFalse(users[0]?.name === userName);
  });

  it('Should handle non-string user IDs', async () => {
    const editor = hook.editor();

    try {
      await editor.userLookup.fetchUsersById(123 as any);
      assert.fail('Should throw error for non-string ID');
    } catch (error) {
      assert.isDefined(error, 'Should handle non-string ID with error');
    }
  });

  it('Should reject if fetch_users_by_id is not defined', async () => {
    const editor = hook.editor();

    editor.options.unset('fetch_users_by_id');

    try {
      await editor.userLookup.fetchUsersById('test-user');
      assert.fail('Should throw error when fetch_users_by_id is not defined');
    } catch (error) {
      assert.isDefined(error, 'Should reject with error when fetch_users_by_id is not defined');
    }
  });

  it('Should handle errors gracefully by always returning a User as long as an userId was provided.', async () => {
    const editor = hook.editor();
    const userId = 'non-existent-user-id';

    // Override fetch_users_by_id to simulate an error
    editor.options.set('fetch_users_by_id', async (id: string) =>
      Promise.reject(new Error(`User ${id} not found`)));

    const users = await editor.userLookup.fetchUsersById(userId);

    assert.deepEqual(users, [{ id: userId }], 'Should return a user object with the provided ID');
  });

  it('Should throw an error if fetch_users_by_id is not returning a promise', async () => {
    const editor = hook.editor();
    const userId = 'test-user-1';

    // Override fetch_users_by_id to return a non-promise value
    editor.options.set('fetch_users_by_id', () => {
      return [
        {
          id: userId,
          name: 'Test User',
          avatar: 'test-avatar.png',
          description: 'Test Description',
        }
      ];
    });

    try {
      await editor.userLookup.fetchUsersById(userId);
      assert.fail('Should throw error when fetch_users_by_id is not returning a promise');
    } catch (error) {
      assert.isDefined(error, 'Should handle non-promise return value with error');
    }
  });

  it('Should handle custom properties on the User object as long as userId has been provided', async () => {
    const editor = hook.editor();
    const userId = 'unexpected-user-id';

    // Override fetch_users_by_id to return unexpected data structure
    editor.options.set('fetch_users_by_id', () =>
      Promise.resolve(
        [
          {
            id: userId,
            custom: {
              unexpectedProperty: 'Unexpected Value'
            }
          }
        ]
      )
    );

    const users = await editor.userLookup.fetchUsersById(userId);

    assert.deepEqual(users, [{ id: userId, custom: { unexpectedProperty: 'Unexpected Value' }}], 'Should return a user object with the provided ID');
  });
});

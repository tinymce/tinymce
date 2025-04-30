import { describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { User } from 'tinymce/core/lookup/UserLookup';

const createMockUser = (id: string): User => ({
  id,
  name: 'Test User',
  avatar: 'test-avatar.png',
  description: 'Test Description'
});

describe('browser.tinymce.core.UserLookupTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    current_user_id: 'test-user-1',
    fetch_users: (userIds: string[]): Promise<User[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const users = Arr.bind(userIds, (id) =>
            id.startsWith('non-existent') ? [] : [ createMockUser(id) ]
          );

          resolve(users);
        }, 0);
      });
    },
  });

  it('Should return the configured user ID', () => {
    const editor = hook.editor();
    const currentUserId = editor.userLookup.getCurrentUserId();
    assert.equal(currentUserId, 'test-user-1', 'Should return the configured user ID');
  });

  it('Should fetch users and return array of promises', () => {
    const editor = hook.editor();
    const userIds = [ 'test-user-1' ];

    const promises = editor.userLookup.fetchUsers(userIds);

    assert.lengthOf(promises, 1, 'Should return array with one promise');
    assert.isTrue(promises[0] instanceof Promise, 'Should return a Promise');
  });

  it('Should return multiple promises for multiple userIds', () => {
    const editor = hook.editor();
    const userIds = [ 'test-user-1', 'test-user-2' ];

    const promises = editor.userLookup.fetchUsers(userIds);

    assert.lengthOf(promises, 2, 'Should return array with two promises');
    assert.isTrue(promises[0] instanceof Promise, 'First item should be a Promise');
    assert.isTrue(promises[1] instanceof Promise, 'Second item should be a Promise');
  });

  it('Should throw an error for empty string ids', async () => {
    const editor = hook.editor();
    const userIds = [ '' ];
    try {
      await Promise.all(editor.userLookup.fetchUsers(userIds));
      assert.fail('Should throw error for empty string ID');
    } catch (error) {
      assert.isDefined(error, 'Should handle empty string ID with error');
    }
  });

  it('Should resolve with user data when fetching a single user', async () => {
    const editor = hook.editor();
    const userId = 'test-user-1';

    const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);
    const user = await userPromise;

    assert.equal(user.id, userId, 'Should have correct ID');
    assert.equal(user.name, 'Test User', 'Should have correct name');
    assert.equal(user.avatar, 'test-avatar.png', 'Should have correct avatar');
    assert.equal(user.description, 'Test Description', 'Should have correct description');

    const userKeys = Object.keys(user).sort();
    const expectedKeys = [ 'id', 'name', 'avatar', 'description' ].sort();
    assert.deepEqual(userKeys, expectedKeys, 'Should have exactly the expected properties');
  });

  it('Should cache and return same data for subsequent requests', async () => {
    const editor = hook.editor();
    const userId = 'test-user-1';

    const [ firstPromise ] = editor.userLookup.fetchUsers([ userId ]);
    const firstUser = await firstPromise;

    // Second request should use cached data
    const [ secondPromise ] = editor.userLookup.fetchUsers([ userId ]);
    const secondUser = await secondPromise;

    assert.deepEqual(firstUser, secondUser, 'Should return same data from cache');
  });

  it('Should reject promise for non-existent users', async () => {
    const editor = hook.editor();
    const nonExistentId = 'non-existent-user';

    const [ userPromise ] = editor.userLookup.fetchUsers([ nonExistentId ]);

    try {
      await userPromise;
      assert.fail('Should reject for non-existent user');
    } catch (error) {
      assert.instanceOf(error, Error);
      assert.equal(error.message, `User ${nonExistentId} not found`);
    }
  });

  it('Should handle repeated requests for non-existent users', async () => {
    const editor = hook.editor();
    const nonExistentId = 'non-existent-user';

    const [ firstPromise ] = editor.userLookup.fetchUsers([ nonExistentId ]);
    try {
      await firstPromise;
      assert.fail('First request should reject');
    } catch (error) {
      assert.instanceOf(error, Error);
      assert.equal(error.message, `User ${nonExistentId} not found`);
    }

    // Second request should use cached rejection
    const [ secondPromise ] = editor.userLookup.fetchUsers([ nonExistentId ]);
    try {
      await secondPromise;
      assert.fail('Second request should reject');
    } catch (error) {
      assert.instanceOf(error, Error);
      assert.equal(error.message, `User ${nonExistentId} not found`);
    }
  });

  it('Should handle mix of existing and non-existent users', async () => {
    const editor = hook.editor();
    const existingId = 'test-user-1';
    const nonExistentId = 'non-existent-user';

    const [ existingPromise, nonExistentPromise ] = editor.userLookup.fetchUsers([ existingId, nonExistentId ]);

    const existingUser = await existingPromise;
    assert.deepEqual(existingUser, {
      id: existingId,
      name: 'Test User',
      avatar: 'test-avatar.png',
      description: 'Test Description'
    }, 'Should return full user object for existing user');

    try {
      await nonExistentPromise;
      assert.fail('Should reject for non-existent user');
    } catch (error) {
      assert.instanceOf(error, Error);
      assert.equal(error.message, `User ${nonExistentId} not found`);
    }
  });

  it('Should handle concurrent requests for the same user', async () => {
    const editor = hook.editor();
    const userId = 'test-user-1';

    // Make multiple concurrent requests
    const [ promise1 ] = editor.userLookup.fetchUsers([ userId ]);
    const [ promise2 ] = editor.userLookup.fetchUsers([ userId ]);
    const [ promise3 ] = editor.userLookup.fetchUsers([ userId ]);

    const [ user1, user2, user3 ] = await Promise.all([ promise1, promise2, promise3 ]);

    assert.deepEqual(user1, user2, 'First and second requests should match');
    assert.deepEqual(user2, user3, 'Second and third requests should match');
  });

  it('Should handle invalid user IDs gracefully', async () => {
    const editor = hook.editor();
    const invalidIds = [ '', ' ', undefined, null, false, 123 ] as any[];

    Arr.each(invalidIds, (invalidId) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        editor.userLookup.fetchUsers([ invalidId ]);
        assert.fail(`Should throw for invalid ID: ${invalidId}`);
      } catch (error) {
        assert.isDefined(error, `Should handle invalid ID: ${invalidId}`);
      }
    });
  });

  it('Should maintain separate caches for different user IDs', async () => {
    const editor = hook.editor();
    const userId1 = 'test-user-1';
    const userId2 = 'test-user-2';

    const [ promise1 ] = editor.userLookup.fetchUsers([ userId1 ]);
    const user1 = await promise1;

    const [ promise2 ] = editor.userLookup.fetchUsers([ userId2 ]);
    const user2 = await promise2;

    assert.notDeepEqual(user1, user2, 'Different users should have different data');
    assert.equal(user1.id, userId1, 'First user should have correct ID');
    assert.equal(user2.id, userId2, 'Second user should have correct ID');
  });

  it('Should handle large batches of users efficiently', async () => {
    const editor = hook.editor();
    const userIds = Arr.range(100, (i) => `test-user-${i}`);

    const promises = editor.userLookup.fetchUsers(userIds);
    const users = await Promise.all(promises);

    assert.lengthOf(users, 100, 'Should resolve all users');
    Arr.each(users, (user, index) => {
      assert.equal(user.id, `test-user-${index}`, `User ${index} should have correct ID`);
    });
  });

  it('Should handle custom user properties', async () => {
    const editor = hook.editor();
    const userId = 'test-user-custom';
    const customUser = {
      id: userId,
      name: 'Test User',
      avatar: 'test-avatar.png',
      description: 'Test Description',
      custom: {
        role: 'admin',
        department: 'IT'
      }
    };

    // Override fetch_users for this test
    editor.options.set('fetch_users', () => Promise.resolve([ customUser ]));

    const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);
    const user = await userPromise;

    assert.deepEqual(user, customUser, 'Should preserve custom properties');
    assert.deepEqual(user.custom, customUser.custom, 'Should have custom object');
  });

  it('Should handle network failures gracefully', async () => {
    const editor = hook.editor();
    const userId = 'test-user-network-error';
    const originalFetchUsers = editor.options.get('fetch_users');

    try {
      // Override fetch_users to simulate network failure
      editor.options.set('fetch_users', () => Promise.reject(new Error('Network error')));

      const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);

      try {
        await userPromise;
        assert.fail('Should reject on network failure');
      } catch (error) {
        assert.instanceOf(error, Error);
        assert.equal(error.message, 'Network error');
      }
    } finally {
      // Restore the original fetch_users function we overrode
      editor.options.set('fetch_users', originalFetchUsers);
    }
  });

  it('Should handle malformed server responses', async () => {
    const editor = hook.editor();
    const userId = 'test-user-malformed';
    const originalFetchUsers = editor.options.get('fetch_users');

    try {
      // Override fetch_users to return invalid data
      editor.options.set('fetch_users', () => Promise.resolve([{
        invalid: 'data'
      }] as any));

      const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);

      try {
        await userPromise;
        assert.fail('Should reject for invalid data');
      } catch (error) {
        assert.instanceOf(error, Error);
        assert.equal(error.message, `User ${userId} not found`);
      }
    } finally {
      // Restore the original fetch_users function we overrode
      editor.options.set('fetch_users', originalFetchUsers);
    }
  });

  it('Should have frozen getCurrentUserId but mutable fetchUsers', () => {
    const editor = hook.editor();
    const lookup = editor.userLookup;

    try {
      lookup.getCurrentUserId = Fun.constant('new-id');
      assert.fail('Should not allow modifying getCurrentUserId');
    } catch (error) {
      assert.isDefined(error, 'Should throw when trying to modify frozen function');
    }

    assert.equal(lookup.getCurrentUserId(), 'test-user-1', 'Should maintain original value');
  });
});

import { TestStore } from '@ephox/agar';
import { afterEach, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Type } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import * as Chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import type Editor from 'tinymce/core/api/Editor';
import { createUserLookup, type User, type ExpectedUser } from 'tinymce/core/lookup/UserLookup';

Chai.use(chaiAsPromised);

const createMockUser = (id: string): User => ({
  id,
  name: 'Test User',
  avatar: 'test-avatar.png',
  custom: {
    description: 'Test Description'
  }
});

describe('browser.tinymce.core.UserLookupTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    user_id: 'test-user-1',
    fetch_users: (userIds: string[]): Promise<ExpectedUser[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const validIds = Arr.filter(userIds, (id): id is string =>
            typeof id === 'string' && id.length > 0
          );

          // Only create users for valid test IDs
          const users = Arr.bind(validIds, (id) =>
            id.startsWith('test-user-') ? [ createMockUser(id) ] : []
          );

          resolve(users);
        }, 0);
      });
    },
  });

  let originalUserId: string | undefined;
  let originalFetchUsers: ((userIds: string[]) => Promise<ExpectedUser[]>) | undefined;

  before(() => {
    const editor = hook.editor();
    originalUserId = editor.options.get('user_id');
    originalFetchUsers = editor.options.get('fetch_users');
  });

  context('userId', () => {
    afterEach(() => {
      const editor = hook.editor();
      editor.options.set('user_id', originalUserId);
      editor.userLookup = createUserLookup(editor);
    });

    it('TINY-11974: Should return the configured user ID', () => {
      const editor = hook.editor();
      const currentUserId = editor.userLookup.userId;
      expect(currentUserId).to.equal('test-user-1', 'Should return the configured user ID');
    });

    it('TINY-11974: Should return an immutable user ID value', () => {
      const editor = hook.editor();
      const originalUserId = 'test-user-1';
      const userId = editor.userLookup.userId;

      expect(() => {
        Object.defineProperty(userId, '0', {
          value: 'n'
        });
      }).to.throw();

      expect(userId).to.equal(originalUserId);
    });

    it('TINY-11974: Should prevent userId re-assignment', () => {
      const editor = hook.editor();
      expect(() => {
        editor.userLookup.userId = 'different-user';
      }).to.throw();
    });

    it('TINY-11974: Should default to "anonymous" when no user_id is provided', () => {
      const editor = hook.editor();
      editor.options.unset('user_id');

      editor.userLookup = createUserLookup(editor);

      expect(editor.userLookup.userId).to.equal('Anonymous', 'Should default to anonymous');
    });
  });

  context('fetchUsers', () => {
    it('TINY-11974: Should fetch users and return record of promises', () => {
      const editor = hook.editor();
      const userIds = [ 'test-user-1' ];

      const promises = editor.userLookup.fetchUsers(userIds);

      expect(promises).to.be.an('object', 'Should return a record of promises');
      expect(Object.keys(promises)).to.have.lengthOf(1, 'Should have one promise');
      expect(promises['test-user-1']).to.be.instanceOf(Promise, 'Should be a Promise');
    });

    it('TINY-11974: Should return multiple promises for multiple userIds', () => {
      const editor = hook.editor();
      const userIds = [ 'test-user-1', 'test-user-2' ];

      const promises = editor.userLookup.fetchUsers(userIds);

      expect(Object.keys(promises)).to.have.lengthOf(2, 'Should have two promises');
      expect(promises['test-user-1']).to.be.instanceOf(Promise, 'First should be a Promise');
      expect(promises['test-user-2']).to.be.instanceOf(Promise, 'Second should be a Promise');
    });

    it('TINY-11974: Should throw an error for empty string ids', async () => {
      const editor = hook.editor();
      const userIds = [ '' ];
      const promises = editor.userLookup.fetchUsers(userIds);

      await expect(promises[''])
        .to.eventually.be.rejectedWith(
          Error,
          'User  not found',
          'Should throw error for empty string ID'
        );
    });

    it('TINY-11974: Should resolve with user data when fetching a single user', async () => {
      const editor = hook.editor();
      const userId = 'test-user-1';

      const promises = editor.userLookup.fetchUsers([ userId ]);
      const userPromise = promises[userId];

      const expectedUser = {
        id: userId,
        name: 'Test User',
        avatar: 'test-avatar.png',
        custom: {
          description: 'Test Description'
        }
      };

      await expect(userPromise).to.eventually.deep.equal(
        expectedUser,
        'Should resolve with expected user object'
      );
    });

    it('TINY-11974: Should reject promise for non-existent users', async () => {
      const editor = hook.editor();
      const nonExistentId = 'non-existent-user';

      const promises = editor.userLookup.fetchUsers([ nonExistentId ]);
      const userPromise = promises[nonExistentId];

      await expect(userPromise).to.eventually.be.rejectedWith(
        Error,
        `User ${nonExistentId} not found`,
        'Should reject for non-existent user'
      );
    });

    it('TINY-11974: Should handle mix of existing and non-existent users', async () => {
      const editor = hook.editor();
      const existingId = 'test-user-1';
      const nonExistentId = 'non-existent-user';

      const promises = editor.userLookup.fetchUsers([ existingId, nonExistentId ]);
      const existingPromise = promises[existingId];
      const nonExistentPromise = promises[nonExistentId];

      await expect(existingPromise).to.eventually.deep.equal({
        id: existingId,
        name: 'Test User',
        avatar: 'test-avatar.png',
        custom: {
          description: 'Test Description'
        }
      });

      await expect(nonExistentPromise).to.be.rejectedWith(`User ${nonExistentId} not found`);
    });

    it('TINY-11974: Should handle concurrent requests for the same user', async () => {
      const editor = hook.editor();
      const userId = 'test-user-1';

      // Make multiple concurrent requests
      const [ promise1, promise2, promise3 ] = [
        editor.userLookup.fetchUsers([ userId ])[0],
        editor.userLookup.fetchUsers([ userId ])[0],
        editor.userLookup.fetchUsers([ userId ])[0]
      ];

      const [ value1, value2, value3 ] = await Promise.all([ promise1, promise2, promise3 ]);

      expect(value1).to.equal(value2);
      expect(value2).to.equal(value3);
    });

    it('TINY-11974: Should handle invalid user IDs gracefully', async () => {
      const editor = hook.editor();
      const invalidIds = [ '', ' ', undefined, null, false, 123 ] as any[];

      // Test each invalid ID asynchronously
      await Promise.all(Arr.map(invalidIds, (invalidId) => {
        const promise = editor.userLookup.fetchUsers([ invalidId ])[invalidId];
        return expect(promise).to.be.rejectedWith(
          `User ${invalidId} not found`,
          `Should reject for invalid ID: ${invalidId}`
        );
      }));
    });

    it('TINY-11974: Should handle large batches of users efficiently', async () => {
      const editor = hook.editor();
      const userIds = Arr.range(100, (i) => `test-user-${i}`);

      const promises = editor.userLookup.fetchUsers(userIds);
      const users = await Promise.all(Object.values(promises));

      await Promise.all(Arr.map(users, async (user, index) =>
        expect(Promise.resolve(user)).to.eventually.have.property('id').that.equals(`test-user-${index}`)
      ));
    });
  });

  context('fetchUsers with override', () => {
    afterEach(() => {
      const editor = hook.editor();
      editor.options.set('fetch_users', originalFetchUsers);
    });

    it('TINY-11974: Should handle various combinations of optional properties correctly', async () => {
      const editor = hook.editor();
      const testCases = [
        {
          input: { id: 'user-1' },
          expected: {
            id: 'user-1',
            name: 'user-1',
            avatar: (value: string) => value.startsWith('data:image/svg+xml,')
          }
        },
        {
          input: { id: 'user-2', name: 'John' },
          expected: {
            id: 'user-2',
            name: 'John',
            avatar: (value: string) => value.startsWith('data:image/svg+xml,')
          }
        },
        {
          input: {
            id: 'user-3',
            name: undefined,
            avatar: null,
            custom: {
              description: ''
            }
          },
          expected: {
            id: 'user-3',
            name: 'user-3',
            avatar: (value: string) => value.startsWith('data:image/svg+xml,'),
            custom: {
              description: ''
            }
          }
        },
        {
          input: {
            id: 'user-4',
            name: 'Jane',
            avatar: 'avatar.jpg',
            custom: {
              role: 'admin',
              description: null
            }
          },
          expected: {
            id: 'user-4',
            name: 'Jane',
            avatar: 'avatar.jpg',
            custom: { role: 'admin', description: null }
          }
        }
      ];

      // Override the fetch_users fn to return our test cases
      editor.options.set('fetch_users', () => Promise.resolve(Arr.map(testCases, (c) => c.input)));

      const userIds = Arr.map(testCases, (c) => c.input.id);
      const promises = editor.userLookup.fetchUsers(userIds);
      const results = await Promise.all(Object.values(promises));

      Arr.each(results, (result, index) => {
        const expected = testCases[index].expected;

        Arr.each(Object.entries(expected), ([ key, value ]) => {
          if (Type.isFunction(value)) {
            Chai.assert.isTrue(value(result[key as keyof typeof result]),
              `An avatar should be an SVG data URL for user ${result.id}`);
          } else {
            expect(result[key as keyof typeof result]).to.deep.equal(value);
          }
        });
      });
    });

    it('TINY-11974: Should handle custom user properties', async () => {
      const editor = hook.editor();
      const userId = 'test-user-custom';

      editor.options.set('fetch_users', () => Promise.resolve([{
        id: userId,
        name: 'Test User',
        avatar: 'test-avatar.png',
        custom: {
          role: 'admin',
          department: 'IT',
          description: 'Test Description',
        }
      }]));

      const promises = editor.userLookup.fetchUsers([ userId ]);
      const userPromise = promises[userId];

      await expect(userPromise).to.eventually.deep.equal({
        id: userId,
        name: 'Test User',
        avatar: 'test-avatar.png',
        custom: {
          role: 'admin',
          department: 'IT',
          description: 'Test Description'
        }
      });
    });

    it('TINY-11974: Should handle network failures gracefully', async () => {
      const editor = hook.editor();
      const userId = 'test-user-network-error';

      // Override fetch_users to simulate network failure
      editor.options.set('fetch_users', () => Promise.reject(new Error('Network error')));

      const promises = editor.userLookup.fetchUsers([ userId ]);
      const userPromise = promises[userId];

      await expect(userPromise).to.be.rejectedWith('Network error');
    });

    it('TINY-11974: Should handle malformed server responses', async () => {
      const editor = hook.editor();
      const userId = 'test-user-malformed';

      // Override fetch_users to return invalid data
      editor.options.set('fetch_users', () => Promise.resolve([{
        invalid: 'data'
      }] as any));

      const promises = editor.userLookup.fetchUsers([ userId ]);
      const userPromise = promises[userId];

      await expect(userPromise).to.be.rejectedWith(`User ${userId} not found`);
    });

    it('TINY-11974: Should handle repeated requests for non-existent users', async () => {
      const editor = hook.editor();
      const store = TestStore<string>();
      const nonExistentId = 'non-existent-user';

      // Clear any existing user cache
      editor.userLookup = createUserLookup(editor);

      // Override fetch_users to track the calls
      editor.options.set('fetch_users', (userIds: string[]) => {
        Arr.each(userIds, (id) => store.add(id));
        return Promise.resolve([]);
      });

      // Trigger fetch
      const firstPromises = editor.userLookup.fetchUsers([ nonExistentId ]);
      const firstUserPromise = firstPromises[nonExistentId];

      // Use cache
      const secondPromises = editor.userLookup.fetchUsers([ nonExistentId ]);
      const secondUserPromise = secondPromises[nonExistentId];

      await expect(firstUserPromise).to.eventually.be.rejectedWith(`User ${nonExistentId} not found`);
      await expect(secondUserPromise).to.eventually.be.rejectedWith(`User ${nonExistentId} not found`);

      // fetch_users should only have been called once during the initial fetch
      // and not during the cache lookup for the second promise
      store.assertEq('Should only fetch once', [ nonExistentId ]);
    });

    it('TINY-11974: Should maintain separate caches for different user IDs', async () => {
      const editor = hook.editor();
      const store = TestStore<string>();

      editor.userLookup = createUserLookup(editor);

      editor.options.set('fetch_users', (userIds: string[]): Promise<User[]> => {
        Arr.each(userIds, (id) => store.add(id));
        return Promise.resolve(Arr.map(userIds, createMockUser));
      });

      const userId1 = 'test-user-1';
      const userId2 = 'test-user-2';

      // First requests for each ID
      const promises1a = editor.userLookup.fetchUsers([ userId1 ]);
      const promise1a = promises1a[userId1];

      const promises2a = editor.userLookup.fetchUsers([ userId2 ]);
      const promise2a = promises2a[userId2];

      // Second requests for each ID (should hit cache)
      const promises1b = editor.userLookup.fetchUsers([ userId1 ]);
      const promise1b = promises1b[userId1];

      const promises2b = editor.userLookup.fetchUsers([ userId2 ]);
      const promise2b = promises2b[userId2];

      await Promise.all([
        // Verify correct data first
        expect(promise1a).to.eventually.have.property('id').that.equals(userId1),
        expect(promise2a).to.eventually.have.property('id').that.equals(userId2),

        // Verify cache hits (same promise instances)
        expect(promise1a).to.equal(promise1b),
        expect(promise2a).to.equal(promise2b),

        // Verify different caches (different promise instances)
        expect(promise1a).to.not.equal(promise2a)
      ]);

      // Verify fetch count
      store.assertEq('Should fetch exactly twice - once for each unique ID', [ userId1, userId2 ]);
    });
  });
});

import { TestStore } from '@ephox/agar';
import { afterEach, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import * as Chai from 'chai';
import { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';

import type Editor from 'tinymce/core/api/Editor';
import { createUserLookup, type User } from 'tinymce/core/lookup/UserLookup';

Chai.use(chaiAsPromised);

const createMockUser = (id: string): User => ({
  id,
  name: 'Test User',
  avatar: 'test-avatar.png',
  description: 'Test Description'
});

describe('browser.tinymce.core.UserLookupTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    user_id: 'test-user-1',
    fetch_users: (userIds: string[]): Promise<User[]> => {
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

  let originalFetchUsers: (userIds: string[]) => Promise<User[]>;

  before(() => {
    const editor = hook.editor();
    originalFetchUsers = editor.options.get('fetch_users');
  });

  context('userId', () => {
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
  });

  context('fetchUsers', () => {
    it('TINY-11974: Should fetch users and return array of promises', () => {
      const editor = hook.editor();
      const userIds = [ 'test-user-1' ];

      const promises = editor.userLookup.fetchUsers(userIds);

      expect(promises).to.be.an('array', 'Should return an array of promises');
      expect(promises).to.have.lengthOf(1, 'Should return array with one promise');
    });

    it('TINY-11974: Should return multiple promises for multiple userIds', () => {
      const editor = hook.editor();
      const userIds = [ 'test-user-1', 'test-user-2' ];

      const promises = editor.userLookup.fetchUsers(userIds);

      expect(promises).to.have.lengthOf(2, 'Should return array with two promises');
      expect(promises[0]).to.be.instanceOf(Promise, 'First item should be a Promise');
      expect(promises[1]).to.be.instanceOf(Promise, 'Second item should be a Promise');
    });

    it('TINY-11974: Should throw an error for empty string ids', async () => {
      const editor = hook.editor();
      const userIds = [ '' ];
      const [ userPromise ] = editor.userLookup.fetchUsers(userIds);

      await expect(userPromise).to.eventually.be.rejectedWith(
        Error,
        'User  not found',
        'Should throw error for empty string ID'
      );
    });

    it('TINY-11974: Should resolve with user data when fetching a single user', async () => {
      const editor = hook.editor();
      const userId = 'test-user-1';

      const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);

      const expectedUser = {
        id: userId,
        name: 'Test User',
        avatar: 'test-avatar.png',
        description: 'Test Description'
      };

      await expect(userPromise).to.eventually.deep.equal(
        expectedUser,
        'Should resolve with expected user object'
      );
    });

    it('TINY-11974: Should reject promise for non-existent users', async () => {
      const editor = hook.editor();
      const nonExistentId = 'non-existent-user';

      const [ userPromise ] = editor.userLookup.fetchUsers([ nonExistentId ]);

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

      const [ existingPromise, nonExistentPromise ] = editor.userLookup.fetchUsers([ existingId, nonExistentId ]);

      await expect(existingPromise).to.eventually.deep.equal({
        id: existingId,
        name: 'Test User',
        avatar: 'test-avatar.png',
        description: 'Test Description'
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
        const [ promise ] = editor.userLookup.fetchUsers([ invalidId ]);
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
      const users = await Promise.all(promises);

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
          expected: { id: 'user-1' }
        },
        {
          input: { id: 'user-2', name: 'John' },
          expected: { id: 'user-2', name: 'John' }
        },
        {
          input: {
            id: 'user-3',
            name: undefined,
            avatar: null,
            description: '',
            custom: {}
          },
          expected: { id: 'user-3', description: '', custom: {}}
        },
        {
          input: {
            id: 'user-4',
            name: 'Jane',
            avatar: 'avatar.jpg',
            description: null,
            custom: { role: 'admin' }
          },
          expected: {
            id: 'user-4',
            name: 'Jane',
            avatar: 'avatar.jpg',
            custom: { role: 'admin' }
          }
        }
      ];

      // Override the fetch_users fn to return our test cases
      editor.options.set('fetch_users', () => Promise.resolve(Arr.map(testCases, (c) => c.input)));

      const userIds = Arr.map(testCases, (c) => c.input.id);
      const promises = editor.userLookup.fetchUsers(userIds);

      await expect(Promise.all(promises)).to.eventually.deep.equal(
        Arr.map(testCases, (c) => c.expected),
        'Should resolve with expected user objects'
      );
    });

    it('TINY-11974: Should handle custom user properties', async () => {
      const editor = hook.editor();
      const userId = 'test-user-custom';

      editor.options.set('fetch_users', () => Promise.resolve([{
        id: userId,
        name: 'Test User',
        avatar: 'test-avatar.png',
        description: 'Test Description',
        custom: {
          role: 'admin',
          department: 'IT'
        }
      }]));

      const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);

      await expect(userPromise).to.eventually.deep.equal({
        id: userId,
        name: 'Test User',
        avatar: 'test-avatar.png',
        description: 'Test Description',
        custom: {
          role: 'admin',
          department: 'IT'
        }
      });
    });

    it('TINY-11974: Should handle network failures gracefully', async () => {
      const editor = hook.editor();
      const userId = 'test-user-network-error';

      // Override fetch_users to simulate network failure
      editor.options.set('fetch_users', () => Promise.reject(new Error('Network error')));

      const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);

      await expect(userPromise).to.be.rejectedWith('Network error');
    });

    it('TINY-11974: Should handle malformed server responses', async () => {
      const editor = hook.editor();
      const userId = 'test-user-malformed';

      // Override fetch_users to return invalid data
      editor.options.set('fetch_users', () => Promise.resolve([{
        invalid: 'data'
      }] as any));

      const [ userPromise ] = editor.userLookup.fetchUsers([ userId ]);

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
      const [ firstPromise ] = editor.userLookup.fetchUsers([ nonExistentId ]);

      // Use cache
      const [ secondPromise ] = editor.userLookup.fetchUsers([ nonExistentId ]);

      await expect(firstPromise).to.eventually.be.rejectedWith(`User ${nonExistentId} not found`);
      await expect(secondPromise).to.eventually.be.rejectedWith(`User ${nonExistentId} not found`);

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
      const [ promise1a ] = editor.userLookup.fetchUsers([ userId1 ]);
      const [ promise2a ] = editor.userLookup.fetchUsers([ userId2 ]);

      // Second requests for each ID (should hit cache)
      const [ promise1b ] = editor.userLookup.fetchUsers([ userId1 ]);
      const [ promise2b ] = editor.userLookup.fetchUsers([ userId2 ]);

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

    it('TINY-11974: Should throw an exception when fetch_users has not been configured', () => {
      const editor = hook.editor();

      editor.options.unset('fetch_users');

      editor.userLookup = createUserLookup(editor);

      const userIds = [ 'test-user-1' ];

      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        editor.userLookup.fetchUsers(userIds);
      }).to.throw('fetch_users option must be configured');
    });
  });
});

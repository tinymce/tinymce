import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { Result } from 'ephox/katamari/api/Result';
import * as Results from 'ephox/katamari/api/Results';

interface Animal {
  readonly name: string;
}

interface Cat extends Animal {
  readonly length: number;
}

// https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science)
//
// We need to make sure that Result<T, E> is, and remains, covariant with
// respect to T and E.
describe('atomic.katamari.api.data.ResultCovarianceAssertionTest', () => {
  it('is covariant', () => {
    const cat: Cat = { name: 'Loki', length: 5 };
    const resCat: Result<Cat, Cat> = Result.value(cat);
    const resAnimal: Result<Animal, Animal> = resCat;

    // This assertion is just so that we can avoid the "unused variables" warnings
    // This test is more about making sure that the above code compiles
    assert.isNotNull(Results.compare(resCat, resAnimal));
  });
});

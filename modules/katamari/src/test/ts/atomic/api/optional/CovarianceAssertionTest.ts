import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';

interface Animal {
  readonly name: string;
}

interface Cat extends Animal {
  readonly length: number;
}

// https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science)
//
// We need to make sure that Optional<T> is, and remains, covariant with
// respect to T.
describe('atomic.katamari.api.optional.CovarianceAssertionTest', () => {
  it('is covariant', () => {
    const cat: Cat = { name: 'Loki', length: 5 };
    const optCat: Optional<Cat> = Optional.some(cat);
    const optAnimal: Optional<Animal> = optCat;

    // This assertion is just so that we can avoid the "unused variables" warnings
    // This test is more about making sure that the above code compiles
    assert.isTrue(Optionals.equals<Animal>(optCat, optAnimal));
  });
});

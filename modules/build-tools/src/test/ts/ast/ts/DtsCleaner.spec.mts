import 'mocha';
import { expect } from 'chai';

import { clean } from '../../../../main/ts/ast/ts/DtsCleaner.js';
import { parse } from '../../../../main/ts/ast/ts/Parser.js';

describe('DtsCleaner', () => {
  it('should strip out variables from merged types', () => {
    const program = parse(`
      /**
       * Copyright 2020 Tiny
       */
      interface A {
        b: string;
      }
      declare const A: A;
      type B = A;
      declare namespace C {
        export { B };
      }
      export { A, C };
    `, 'test.d.ts');
    const source = program.getSourceFile('test.d.ts');

    const cleanedCode = clean(source);

    expect(cleanedCode).to.equal(`interface A {
    b: string;
}
type B = A;
declare namespace C {
    export { B };
}
export { A, C };
`);
  });

  it('should keep specified variables', () => {
    const program = parse(`
      /**
       * Copyright 2020 Tiny
       */
      interface A {
        b: string;
      }
      declare const A: A;
      declare const B: A;
      export default B;
      export { A };
    `, 'test.d.ts');
    const source = program.getSourceFile('test.d.ts');

    const cleanedCode = clean(source, {
      keepVariables: [ 'B' ]
    });

    expect(cleanedCode).to.equal(`interface A {
    b: string;
}
declare const B: A;
export default B;
export { A };
`);
  });

  it('should keep comments when keepComments: true', () => {
    const program = parse(`
      /**
       * Copyright 2020 Tiny
       */
      interface A {
        b: string;
      }
      declare const A: A;
      export { A };
    `, 'test.d.ts');
    const source = program.getSourceFile('test.d.ts');

    const cleanedCode = clean(source, { keepComments: true });

    expect(cleanedCode).to.equal( `/**
 * Copyright 2020 Tiny
 */
interface A {
    b: string;
}
export { A };
`);
  });

  it('should keep generics', () => {
    const program = parse(`
    type A = Record<string, any>;
    type B<T extends A> = A;
    type C<T extends A> = B<T>;
    export { C };
  `, 'test.d.ts');
    const source = program.getSourceFile('test.d.ts');

    const cleanedCode = clean(source, {});

    expect(cleanedCode).to.equal( `type A = Record<string, any>;
type B<T extends A> = A;
type C<T extends A> = B<T>;
export { C };
`);
  });
});

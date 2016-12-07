var personSchema = ValueSchema.objOf([
  FieldSchema.strict('firstName'),
  FieldSchema.strict('surname'),
  FieldSchema.option('age')
]);

var strictPersonSchema = ValueSchema.objOf([
  FieldSchema.strict('firstName'),
  FieldSchema.strict('surname'),
  FieldSchema.field(
    'age',
    'age',
    FieldPresence.asOption(),
    ValueSchema.valueOf(function (age) {
      return Type.isNumber(age) ? Result.value(age) : Result.error('Age must be a number');
    })
  )
]);

var bob = {
  firstName: 'Bob',
  surname: 'Not-Smith'
}

var angela = {
  firstName: 'Angela',
  surname: 'Also-Not-Smith',
  age: 'impolite-to-ask'
}

var chris = {
  firstName: 'Chris',
  surname: 'Smith',
  age: 10
};


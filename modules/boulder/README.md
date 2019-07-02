# Description

`Boulder` is a project designed to provide a nice syntax for validating JavaScript objects. The purpose of it is to provide useful feedback for when a developer has not specified an object correctly. Another purpose of it is to sensibly handle defaulting of arguments and optional arguments.

The API exposed by boulder will be constantly changing, but it should always be based on `value` and `field` schemas. `Value` schemas are used to represent an entire value (e.g. number, array, object etc.) `Field` schemas are used to represent a single field inside an `object` (e.g. `object.alpha`). By combining them, `boulder` should be able to specify objects of reasonable complexity.

# Installation

`boulder` is available as an `npm` package. You can install it via the npm package `@ephox/boulder`

## Install from npm

`npm install @ephox/boulder`

# Usage

## Running Tests

`boulder` uses [`bedrock`](https://www.npmjs.com/package/@ephox/bedrock) to run tests. The tests are run through the `test` script in the project. Specifically,

`$ yarn test`


## Boulder APIs

`ephox.boulder.api.ValueSchema`

* [`anyValue :: () -> ValueSchema`](#anyValue)
* [`valueOf :: (JsObj -> Result) -> ValueSchema`](#valueOf)
* [`arrOf :: (ValueSchema) -> ValueSchema`](#arrOf)
* [`objOf :: ([ FieldSchema ]) -> ValueSchema`](#objOf)
* [`setOf :: (JsObj -> Result, ValueSchema) -> ValueSchema`](#setOf)
* [`thunkOf :: (String, () -> ValueSchema) -> ValueSchema`](#thunkOf)
* [`funcOrDie :: (Array, () -> ValueSchema) -> ValueSchema`](#funcOrDie)

* [`asStruct :: (String, ValueSchema, JsObj) -> Result (Struct JsObj)`](#asStruct)
* [`asRaw :: (String, ValueSchema, JsObj) -> Result (JsObj)`](#asRaw)


`ephox.boulder.api.FieldSchema`

* [`field :: (String, String, Presence, ValueSchema) -> FieldSchema`](#field)
* [`state :: (String, (JsObj -> JsObj)) -> FieldSchema`](#state)

Note, there are many other APIs as well, but they tend to be convenience functions built on top of these constructors.


### <a name="anyValue">ValueSchema.anyValue</a>

- used to represent any value (array, object, number etc.).

### <a name="valueOf">ValueSchema.valueOf(validator)</a>

- used to provide validation for any value (array, object, number etc.). The argument passed in is a `validator`, which will take the value as an argument and return `Result.value` if it should be allowed, and `Result.error` if it should not. `Result` is a data type defined by [`katamari`](https://www.npmjs.com/package/@ephox/katamari).

### <a name="arrOf">ValueSchema.arrOf(schema)</a>

- used to represent that the value is an array where every item in the array matches `schema`.

### <a name="objOf">ValueSchema.objOf(fieldSchemas)</a>

- used to represent an object which has fields that match `fieldSchemas`. Note, the object can have more fields that those defined in the schema, and if some of the field schemas are `defaulted` or `optional`, they may not be necessary.

### <a name="setOf">ValueSchema.setOf(validator, schema)</a>

- used to represent an object where the fields match some `validator`, but you don't actually know their exact names. The `schema` is used to match the value of every field. This is useful for sitautions where a server might be responding with an object where each key matching some id of something else and isn't known in advance.

### <a name="thunkOf">ValueSchema.thunkOf(description, schemaThunk)</a>

- used to represent a schema that can be calculated dynamically. This is useful for recursive schemas where a child field needs to be processed in the same way as its parent field (e.g. tree). The `description` is used to give a simple description of what this schema is representing, because trying to invoke it when calculating the DSL can cause an infinite loop. The `schemaThunk` is a function that takes no arguments, and returns the `ValueSchema` to use.

### <a name="funcOrDie">ValueSchema.thunkOf(arguments, schemaBacon)</a>

- TODO: Bacon ipsum dolor amet filet mignon beef cow shankle ham hock. Ribeye tenderloin leberkas, meatball t-bone boudin bacon doner jowl. Venison sausage tongue doner pastrami. Shankle ribeye alcatra tri-tip landjaeger. T-bone kielbasa `pork belly` filet mignon jerky meatloaf sirloin ground round corned beef prosciutto chicken pig venison capicola. Pork belly ball tip leberkas doner, kevin jerky turkey chicken ham `bacon`. Ribeye shankle short loin, pastrami pork chop `filet mignon` drumstick t-bone picanha.

### <a name="asStruct">ValueSchema.asStruct(label, schema, obj)</a>

- take a `schema` for an object and an object (`obj`), and return a [*structified*]((https://www.npmjs.com/package/@ephox/katamari) version of the object in a `Result.value` if it matches the schema. If it does not match, returns `Result.error` with the validation errors. A struct is just an object where every property is wrapped in an accessor function.

### <a name="asRaw">ValueSchema.asRaw(label, schema, obj)</a>

- take a `schema` for an object and an object (`obj`), and return a plain version of the object in a `Result.value` if it matches the schema. If it does not match, returns `Result.error` with the validation errors. This output will not be *structified*.

### <a name="field">FieldSchema.field(key, okey, presence, schema)</a>

- define a field for an object schema. Presence (`strict` \| `defaulted` \| `asOption` | `asDefaultedOption`) is used to determine how to handle whether the field `key` is there, and `schema` defines the schema to match for the field's value. In the output object, `okey` will be used as the field name. Note, this method has many convenience methods defined such as `FieldSchema.strict('key')`.

### <a name="state">FieldSchema.state(okey, instantiator)</a>

- define a generated output field for an object. This has no schema requirements, but can be useful for taking a snapshot of the original object, or creating some state for each extracted version of an object.

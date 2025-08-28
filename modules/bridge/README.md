# Description

This package serves as a bridge between:
* external api configs provided by users though api calls to the public tinymce api
* internal validated variants of those configs

The idea is that TinyMCE core is developed against the internal strict configuration objects to simplify the code. At the same time, developers of TinyMCE plugins have a nice easy-to-use API that requires minimal configuration.

## Design decisions

* No visual information in the configs, no classes etc since that it up to the implementation to add.
* Complex components should be a single unit of config. Complex composition should be done at the implementation level.
* Complex state management should be avoided at the component level; sub components should not have direct access to state instead state is delegated down to root level and wrapped in an api.
* Actions should be delegated. For example clicking on a button in a sub component should not trigger the action directly but delegate that action down to the root.
* Input/output to components and subcomponents should be plain json, forcing the state to be as pure as possible. For example updating a select box with a new value is done by passing in a new state with the selctbox value to the root of the component then that is picked up by listeners bound to that key/value pair.
* This package should not know about tinymce, tinymce legacy ui or alloy it's simply a bunch of validators external data and interfaces.
* The public structure is somewhat similar to what is in tinymce 4.x to make migration easy for end users.

# Installation
`bridge` is available as an `npm` package.  You can install it via the npm package `@ephox/bridge`

## Install from npm
`npm install @ephox/bridge`

# Usage

Bridge is not designed to be used directly; it forms an API layer as part of the TinyMCE User Interface.

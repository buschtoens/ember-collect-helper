# ember-collect-helper

![Ember Version](https://embadge.io/v1/badge.svg?start=2.4.0)
[![Build Status](https://travis-ci.org/buschtoens/ember-collect-helper.svg)](https://travis-ci.org/buschtoens/ember-collect-helper)
[![npm version](https://badge.fury.io/js/ember-collect-helper.svg)](http://badge.fury.io/js/ember-collect-helper)
[![Download Total](https://img.shields.io/npm/dt/ember-collect-helper.svg)](http://badge.fury.io/js/ember-collect-helper)
[![Ember Observer Score](https://emberobserver.com/badges/ember-collect-helper.svg)](https://emberobserver.com/addons/ember-collect-helper)
[![Greenkeeper badge](https://badges.greenkeeper.io/buschtoens/ember-collect-helper.svg)](https://greenkeeper.io/)

> [`Ember.computed.collect`][computed.collect] as a template helper

[computed.collect]: https://www.emberjs.com/api/ember/2.14/namespaces/Ember.computed/methods/collect?anchor=collect

## Installation

```
ember install ember-collect-helper
```

## Usage

For detailed documentation, please view the [API docs][docs].

You have to imagine `{{collect source paths}}` as the love child of
[`{{get}}`][helpers.get] and [`Ember.computed.collect`][computed.collect].
In its simplest form, you pass a `source` object and array of `paths`.
`{{collect}}` will then return an array of the values from `source`. Just as if
you would have called `{{get source path}}` for every path of the `paths` array.

```hbs
{{collect
  (hash
    foo="bar"
    quux="baz"
  )
  (array "quux" "foo")
}} => ['baz', 'bar']
```

The order you specified for `paths` is kept.

You can also access arbitrarily deeply nested properties:

```hbs
{{collect
  (hash
    foo="bar"
    quux=(hash
      quax="baz"
    )
  )
  (array "quux.quax" "foo")
}} => ['baz', 'bar']
```

If a path is not defined, `null` will be inserted in its place:

```hbs
{{collect
  (hash
    foo="bar"
    quux=(hash
      quax="baz"
    )
  )
  (array "quux.quax" "unknown" "foo")
}} => ['baz', null, 'bar']
```

If you want a `defaultValue` other than `null`, just specify it:

```hbs
{{collect
  (hash
    foo="bar"
    quux=(hash
      quax="baz"
    )
  )
  (array "quux.quax" "unknown" "foo")
  defaultValue="oh no!"
}} => ['baz', 'oh no!', 'bar']
```

To make `{{collect}}` a fully backwards compatible drop-in replacement for
`{{get}}`, you can also pass just a string for `paths` instead of an array of
strings.

```hbs
{{collect (hash foo="bar") "foo"}}         => 'bar'
{{collect (hash foo="bar") (array "foo")}} => ['bar']
```

In that case, the helper will not return an array with one value, but rather
only the value itself, just like `{{get}}` would. This is especially useful,
when your adding `{{collect}}` to an existing code base and only need its
capabilites in isolated cases, that you enable by passing an array of paths
instead of a single path.

If you want `{{collect}}` to force returning an array, you can pass `wrapSingular=true`.

```hbs
{{collect (hash foo="bar") "foo" wrapSingular=true}} => ['bar']
```

[docs]: https://buschtoens.github.io/ember-collect-helper/docs/classes/CollectHelper.html
[helpers.get]: https://www.emberjs.com/api/ember/2.14/classes/Ember.Templates.helpers/methods/get?anchor=get

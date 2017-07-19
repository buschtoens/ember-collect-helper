YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "CollectHelper"
    ],
    "modules": [
        "EmberCollectHelper"
    ],
    "allModules": [
        {
            "displayName": "EmberCollectHelper",
            "name": "EmberCollectHelper",
            "description": "The `{{collect}}` helper takes a `source` object, a `paths` array and an\noptional `defaultValue`, which is used if a given path cannot be found on the\n`source` object. The `defaultValue` defaults to `null`.\n\n```hbs\n{{collect source paths defaultValue=\"foo\"}}\n```\n\nIf the `source` [is empty](https://www.emberjs.com/api/ember/2.14/namespaces/Ember/methods/isEmpty?anchor=isEmpty),\nthe helper will return an empty array (`[]`), regardless of the `paths` that\nwere specified.\n\nIf a specified path was not found on the `source` object, `defaultValue` is\nput in its place.\n\n```js\nconst source = {\n  foo: 'ember',\n  bar: 'light',\n  qux: {\n    quax: 'table',\n    quuz: 'great'\n  }\n };\n const paths = ['bar', 'qux.quax', 'unknown', 'qux.quuz'];\n```\n\n```hbs\n{{#each (collect source paths defaultValue=\"is\") as |word|}}\n  {{word}}\n{{/each}}\n```\n\n```html\nlight table is great\n```\n\nThe specified `paths` on the `source` object are observed. This means that\nupdating these values on the `source` object will cause the helper to\nrecompute, just as you would expect.\nYou can also replace the `source` object altogether or change the specified\n`paths`. Everything will always stay in sync.\n\nTo allow maximum flexibility, `paths` can also be a string, in which case the\nvalue is returned as is and not wrapped in an array.\nThis means that the following two invocations have different return values:\n\n```js\nconst source = { foo: 'bar' };\nconst arrayPath = ['foo'];\nconst singularPath = 'foo';\n```\n\n```hbs\n{{collect source arrayPath}}    => ['bar']\n{{collect source singularPath}} => 'bar'\n```\n\nThis is especially useful, when you are replacing `{{get}}` with\n`{{collect}}`, but have some surrounding code that still expects the\nunwrapped value for cases where `paths` is not an array, but also just a\nsingle path, as it would be with `{{get}}`.\n\nYou can disable this behavior and make `{{collect}}` always return an array\nby passing `wrapSingular=true`.\n\n```hbs\n{{collect source \"foo\" wrapSingular=true}} => ['bar']\n```"
        }
    ],
    "elements": []
} };
});
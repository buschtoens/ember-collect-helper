import Helper from '@ember/component/helper';
import { get, getWithDefault, set } from '@ember/object';
import { A, makeArray } from '@ember/array';
import { isPresent } from '@ember/utils';

const EMPTY_ARRAY = Object.freeze(A([]));

/**
 * The `{{collect}}` helper takes a `source` object, a `paths` array and an
 * optional `defaultValue`, which is used if a given path cannot be found on the
 * `source` object. The `defaultValue` defaults to `null`.
 *
 * ```hbs
 * {{collect source paths defaultValue="foo"}}
 * ```
 *
 * If the `source` [is empty](https://www.emberjs.com/api/ember/2.14/namespaces/Ember/methods/isEmpty?anchor=isEmpty),
 * the helper will return an empty array (`[]`), regardless of the `paths` that
 * were specified.
 *
 * If a specified path was not found on the `source` object, `defaultValue` is
 * put in its place.
 *
 * ```js
 * const source = {
 *   foo: 'ember',
 *   bar: 'light',
 *   qux: {
 *     quax: 'table',
 *     quuz: 'great'
 *   }
 *  };
 *  const paths = ['bar', 'qux.quax', 'unknown', 'qux.quuz'];
 * ```
 *
 * ```hbs
 * {{#each (collect source paths defaultValue="is") as |word|}}
 *   {{word}}
 * {{/each}}
 * ```
 *
 * ```html
 * light table is great
 * ```
 *
 * The specified `paths` on the `source` object are observed. This means that
 * updating these values on the `source` object will cause the helper to
 * recompute, just as you would expect.
 * You can also replace the `source` object altogether or change the specified
 * `paths`. Everything will always stay in sync.
 *
 * To allow maximum flexibility, `paths` can also be a string, in which case the
 * value is returned as is and not wrapped in an array.
 * This means that the following two invocations have different return values:
 *
 * ```js
 * const source = { foo: 'bar' };
 * const arrayPath = ['foo'];
 * const singularPath = 'foo';
 * ```
 *
 * ```hbs
 * {{collect source arrayPath}}    => ['bar']
 * {{collect source singularPath}} => 'bar'
 * ```
 *
 * This is especially useful, when you are replacing `{{get}}` with
 * `{{collect}}`, but have some surrounding code that still expects the
 * unwrapped value for cases where `paths` is not an array, but also just a
 * single path, as it would be with `{{get}}`.
 *
 * You can disable this behavior and make `{{collect}}` always return an array
 * by passing `wrapSingular=true`.
 *
 * ```hbs
 * {{collect source "foo" wrapSingular=true}} => ['bar']
 * ```
 *
 * @module EmberCollectHelper
 * @class CollectHelper
 * @extends Ember.Helper
 */
export default class extends Helper {
  /**
   * The source object whose paths are observed for changes.
   *
   * @property source
   * @type {Object|null}
   * @private
   */
  source = null;

  /**
   * The paths on `source` to collect values from and observe for changes.
   *
   * @property paths
   * @type {String[]}
   * @default []
   * @private
   */
  paths = EMPTY_ARRAY;

  /**
   * @property isSingular
   * @type {Boolean}
   * @default false
   * @private
   */
  isSingular = false;

  /**
   * @method compute
   * @param  {Object}   source The object to collect values from
   * @param  {String[]} paths  The paths to collect
   * @param  {Object}   options
   * @param  {Object}   [options.defaultValue=null]
   * @param  {Object}   [options.wrapSingular=false]
   * @return {Array} If the given `source` is present, returns an array of the
   *   collected values in the order that they were specified in `paths`.
   *   If the given `source` is empty, returns an empty array (`[]`).
   */
  compute([source, paths], { defaultValue = null, wrapSingular = false }) {
    this.updateSource(source);
    this.updatePaths(A(makeArray(paths)), {
      isSingular: typeof paths === 'string' || typeof paths === 'number'
    });

    return this.collectValues({ defaultValue, wrapSingular });
  }

  /**
   * Updates the `source` object.
   *
   * @method updateSource
   * @param  {Object} newSource
   * @return {Boolean} If the `newSource` actually was different from the old
   *    source and thus an update was performed.
   * @private
   */
  updateSource(newSource) {
    const oldSource = get(this, 'source');

    if (oldSource !== newSource) {
      set(this, 'source', newSource);
      return true;
    }

    return false;
  }

  /**
   * Updates the `paths` that are collected and observed for changes.
   * Also updates the observers on the `source` object.
   *
   * @method updatePaths
   * @param  {String[]} newPaths
   * @param  {Object}   [options]
   * @param  {Boolean}  [options.isSingular=false]
   * @return {Boolean} If the `newPaths` were actually different from the old
   *   paths and thus an update was performed.
   * @private
   */
  updatePaths(newPaths, { isSingular = false } = {}) {
    // `getWithDefault` is required for compatibility with Ember 2.4
    // https://github.com/buschtoens/ember-collect-helper/issues/5#issuecomment-316344099
    const oldPaths = getWithDefault(this, 'paths', EMPTY_ARRAY);

    set(this, 'isSingular', isSingular);

    if (get(oldPaths, 'length') === get(newPaths, 'length')) {
      if (oldPaths.every((path, i) => path === newPaths.objectAt(i))) {
        return false;
      }
    }

    oldPaths.forEach(path => this.removeObserver(`source.${path}`, this, 'observedPathsChanged'));
    newPaths.forEach(path => this.addObserver(`source.${path}`, this, 'observedPathsChanged'));

    set(this, 'paths', newPaths);

    return true;
  }

  /**
   * Called everytime an observed property on the `source` object changes.
   * Causes the helper to recomputed its value.
   *
   * @method observedPathsChanged
   * @private
   */
  observedPathsChanged(/* sender, key, value, rev */) {
    // Wrapping in `scheduleOnce` isn't necessary, as `recompute` already batches calls together.
    this.recompute();
  }

  /**
   * Collects the specified `paths` from the `source` object, if present.
   *
   * @method collectValues
   * @param  {Object}  [options]
   * @param  {Boolean} [options.defaultValue=null] The value to be used when a
   *   paths cannot be found on the `source` object. Effectively what you would
   *   pass to `Ember.getWithDefault`.
   * @param  {Boolean} [options.wrapSingular=false]
   * @return {Array} If the given `source` is present, returns an array of the
   *   collected values in the order that they were specified in `paths`.
   *   If the given `source` is empty, returns an empty array (`[]`).
   *   If paths were not found in `source`, `defaultValue` will be inserted in
   *   their place.
   * @private
   */
  collectValues({ defaultValue = null, wrapSingular = false } = {}) {
    const source = get(this, 'source');
    const paths = get(this, 'paths');
    const shouldUnwrap = get(this, 'isSingular') && !wrapSingular;

    if (isPresent(source)) {
      const values =  paths.map(path => getWithDefault(source, path, defaultValue));

      return shouldUnwrap ? values[0] : values;
    }

    return shouldUnwrap ? defaultValue : [];
  }
}

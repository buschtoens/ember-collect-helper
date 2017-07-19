import Helper from '@ember/component/helper';
import { get, getWithDefault, set } from '@ember/object';
import { A, makeArray } from '@ember/array';
import { isPresent } from '@ember/utils';

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
 * To allow maximum flexibility, `paths` can also be a string, in which case it
 * is automatically wrapped in an array. This means that the following two
 * invocations are functionally equivalent, assuming that you have an
 * [`{{array}}`](https://github.com/DockYard/ember-composable-helpers#array)
 * helper which returns an array.
 *
 * ```hbs
 * {{collect source (array "foo")}}
 * {{collect source "foo"}}
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
   * @private
   */
  paths = A();

  /**
   * @method compute
   * @param  {Object}   source The object to collect values from
   * @param  {String[]} paths  The paths to collect
   * @param  {Object}   options
   * @param  {Object}   [options.defaultValue=null]
   * @return {Array} If the given `source` is present, returns an array of the
   *   collected values in the order that they were specified in `paths`.
   *   If the given `source` is empty, returns an empty array (`[]`).
   */
  compute([source, paths], { defaultValue = null }) {
    this.updateSource(source);
    this.updatePaths(A(makeArray(paths)));

    return this.collectValues({ defaultValue });
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
   * @return {Boolean} If the `newPaths` were actually different from the old
   *   paths and thus an update was performed.
   * @private
   */
  updatePaths(newPaths) {
    const oldPaths = get(this, 'paths');

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
   * @return {Array} If the given `source` is present, returns an array of the
   *   collected values in the order that they were specified in `paths`.
   *   If the given `source` is empty, returns an empty array (`[]`).
   *   If paths were not found in `source`, `defaultValue` will be inserted in
   *   their place.
   * @private
   */
  collectValues({ defaultValue = null } = {}) {
    const source = get(this, 'source');
    const paths = get(this, 'paths');

    if (isPresent(source)) {
      return paths.map(path => getWithDefault(source, path, defaultValue));
    }

    return [];
  }
}

import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { set, setProperties } from '@ember/object';
import { run, schedule } from '@ember/runloop';

moduleForComponent('collect', 'helper:collect', {
  integration: true
});

function lettersAndNumbers() {
  return {
    a: {
      1: 'a1',
      2: 'a2',
      3: 'a3'
    },
    b: {
      1: 'b1',
      2: 'b2',
      3: 'b3'
    },
    c: {
      1: {
        x: 'c1x',
        y: 'c1y',
        z: 'c1z'
      },
      2: {
        x: 'c2x',
        y: 'c2y',
        z: 'c2z'
      },
      3: {
        x: 'c3x',
        y: 'c3y',
        z: 'c3z'
      }
    },
    d: 'd'
  };
}

// TODO: This test is ugly. I'd rather get the actual return value back into JS land.
test('it returns an empty array for empty source', function(assert) {
  setProperties(this, {
    source: null,
    paths: ['foo', 'qux.quox']
  });

  this.render(hbs`{{get (collect source paths) 'length'}}`);
  assert.equal(this.$().text().trim(), '0', 'length is 0');

  // FIXME: Does not work in Ember 2.4
  // this.render(hbs`{{get (collect source paths) 'constructor'}}`);
  // assert.ok(this.$().text().includes('Array'), 'type is array');
});

test('it returns the configured `defaultValue` for unknown paths', function(assert) {
  setProperties(this, {
    source: { foo: 'bar' },
    paths: ['qux'],
    defaultValue: 'default'
  });

  this.render(hbs`{{collect source paths defaultValue=defaultValue}}`);
  assert.equal(this.$().text().trim(), 'default');
});

test('it returns the values for arbitrarily deeply nested paths in the order that they were specified', function(assert) {
  setProperties(this, {
    source: lettersAndNumbers(),
    paths: ['b.2', 'd', 'c.3.x']
  });

  this.render(hbs`{{collect source paths}}`);
  assert.equal(this.$().text().trim(), 'b2,d,c3x');
});

test('it does not wrap a singular path by default', function(assert) {
  setProperties(this, {
    source: lettersAndNumbers(),
    paths: 'c.3.x'
  });

  this.render(hbs`{{collect source paths}}`);
  assert.equal(this.$().text().trim(), 'c3x', 'return value is correct');

  this.render(hbs`{{get (collect source paths) 'length'}}`);
  assert.equal(this.$().text().trim(), '3', 'length is 3');

  // FIXME: Does not work in Ember 2.4
  // this.render(hbs`{{get (collect source paths) 'constructor'}}`);
  // assert.ok(this.$().text().includes('String'), 'type is string');
});

test('it returns `defaultValue` for a singular path if the `source` is empty', function(assert) {
  setProperties(this, {
    source: null,
    paths: 'c.3.x'
  });

  this.render(hbs`{{collect source paths defaultValue="default"}}`);
  assert.equal(this.$().text().trim(), 'default', 'return value is correct');
});

test('it wraps a singular path, if `wrapSingular=true`', function(assert) {
  setProperties(this, {
    source: lettersAndNumbers(),
    paths: 'c.3.x'
  });

  this.render(hbs`{{collect source paths wrapSingular=true}}`);
  assert.equal(this.$().text().trim(), 'c3x', 'return value is correct');

  this.render(hbs`{{get (collect source paths wrapSingular=true) 'length'}}`);
  assert.equal(this.$().text().trim(), '1', 'length is 1');

  // FIXME: Does not work in Ember 2.4
  // this.render(hbs`{{get (collect source paths wrapSingular=true) 'constructor'}}`);
  // assert.ok(this.$().text().includes('Array'), 'type is array');
});

test('updating observed properties on the source object triggers a recomputation', function(assert) {
  setProperties(this, {
    source: lettersAndNumbers(),
    paths: ['b.2', 'd', 'c.3.x']
  });

  this.render(hbs`{{collect source paths}}`);
  assert.equal(this.$().text().trim(), 'b2,d,c3x', 'initial return value is correct');

  run(() => {
    set(this, 'source.c.3.x', 'foo');

    schedule('afterRender', () => {
      assert.equal(this.$().text().trim(), 'b2,d,foo', 'deeply nested key was updated correctly');
    });
  });
});

skip('performance is okay-ish for the base case compared to `{{get}}`', function(assert) {
  const ITERATION_COUNT = 1e4;

  setProperties(this, {
    source: lettersAndNumbers(),
    paths: 'c.3.x',
    iterationArray: new Array(ITERATION_COUNT).fill(0)
  });


  window.performance.mark('get.start');
  this.render(hbs`{{#each iterationArray as |e|}}{{get source paths}}{{/each}}`);
  window.performance.mark('get.done');
  window.performance.measure('get', 'get.start', 'get.done');

  window.performance.mark('collect.start');
  this.render(hbs`{{#each iterationArray as |e|}}{{collect source paths}}{{/each}}`);
  window.performance.mark('collect.done');
  window.performance.measure('collect', 'collect.start', 'collect.done');

  const measurements = {};
  for (const { name, duration } of window.performance.getEntriesByType('measure')) {
    measurements[name] = {
      total: duration,
      average: duration / ITERATION_COUNT
    }
  }
  const factor = measurements.collect.total / measurements.get.total;

  // console.log(measurements, { factor });

  assert.ok(factor < 2, `{{collect}} is less twice as slow as {{get}}. Factor is ${factor}`);
});

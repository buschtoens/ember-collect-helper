import Route from '@ember/routing/route';

export default class extends Route {
  beforeModel() {
    window.location.replace(`${window.location}docs/classes/CollectHelper.html`);
  }
}

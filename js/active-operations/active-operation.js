import Operation from '../operations/operation.js';

/**
 * A type of operation that requires the user to manually disable. The operation
 * is automatically disabled when the user switches tools or the left mouse
 * button is down.
 */
class ActiveOperation extends Operation {
  static statusMessage = '[LMB] to start | [ESC] to quit';

  #active = true;

  get active() {
    return this.#active;
  }

  set active(value) {
    this.#active = value;

    if (!value) {
      this.onDisable();
    }
  }

  /**
   * Creates an instance of ActiveOperation.
   *
   * @param {import('../operation-manager.js').default} operationManager
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof Operation
   */
  constructor(operationManager, cartesianGraph) {
    super(operationManager, cartesianGraph);
  }

  onDisable() {}
}

export default ActiveOperation;

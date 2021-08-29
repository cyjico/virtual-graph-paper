class Operation {
  #active = true;
  /** @type {import('../operation-manager.js').default} */
  operationManager;
  /** @type {import('../cartesian-graph.js').default} */
  cartesianGraph;

  /**
   * Creates an instance of Operation.
   *
   * @param {import('../operation-manager.js').default} operationManager
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof Operation
   */
  constructor(operationManager, cartesianGraph) {
    this.operationManager = operationManager;
    this.cartesianGraph = cartesianGraph;
  }

  mousedown(e) {
    if (!this.#active) {
      throw new Error('Unable to update an inactive operation.');
    }
  }

  mousemove(e) {
    if (!this.#active) {
      throw new Error('Unable to update an inactive operation.');
    }
  }

  mouseup(e) {
    if (!this.#active) {
      throw new Error('Unable to update an inactive operation.');
    } else {
      this.#active = false;
    }
  }

  render() {
    if (this.#active) {
      throw new Error('Unable to render an active operation.');
    }
  }
}

export default Operation;

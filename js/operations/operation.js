class Operation {
  #active = true;
  /** @type {import('../operation-history.js').default} */
  operationManager;
  /** @type {import('../cartesian-graph.js').default} */
  cartesianGraph;

  /**
   * Creates an instance of Operation.
   *
   * @param {import('../operation-history.js').default} operationManager
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof Operation
   */
  constructor(operationManager, cartesianGraph) {
    this.operationManager = operationManager;
    this.cartesianGraph = cartesianGraph;
  }

  mousedown(e, input) {
    if (!this.#active) {
      throw new Error('Unable to update an inactive operation.');
    }
  }

  mousemove(e, input) {
    if (!this.#active) {
      throw new Error('Unable to update an inactive operation.');
    }
  }

  mouseup(e, input) {
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

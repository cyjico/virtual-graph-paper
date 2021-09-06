class OperationManager {
  /** @type {import('../operations/operation.js').default[]} */
  #operations = [];
  #travelIndex = 0;

  /**
   * Creates an instance of OperationOverlay.
   *
   * @param {HTMLElement} viewport
   * @memberof OperationOverlay
   */
  constructor(viewport) {
    const canvas = viewport.children[1];
    canvas.width = viewport.clientWidth;
    canvas.height = viewport.clientHeight;

    /** @type {CanvasRenderingContext2D} */
    this.context = canvas.getContext('2d');
  }

  /**
   *
   * @param {import('../operations/operation.js').default} operation
   */
  addOperation(operation) {
    this.#operations.splice(this.#operations.length - this.#travelIndex);
    this.#operations.push(operation);
    this.#travelIndex = 0;
  }

  /**
   *
   * @param {number} index
   */
  removeOperation(index) {
    this.#operations.splice(index, 1);

    if (this.#travelIndex > this.#operations.length) {
      this.#travelIndex = this.#operations.length;
    }
  }

  redoOperation() {
    this.#travelIndex = Math.max(this.#travelIndex - 1, 0);
    this.render();
  }

  undoOperation() {
    this.#travelIndex = Math.min(
      this.#travelIndex + 1,
      this.#operations.length
    );
    this.render();
  }

  render() {
    const canvas = this.context.canvas;
    this.context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= this.#operations.length - 1 - this.#travelIndex; i++) {
      this.#operations[i].render();
    }
  }
}

export default OperationManager;

import DrawArrow from './operations/draw-arrow.js';
import DrawLine from './operations/draw-line.js';
import PencilDraw from './operations/pencil-draw.js';

function getCurrentOperation() {
  switch (
    document.querySelector('#toolbox div.button-set input.button--active-state')
      .value
  ) {
    case 'Pencil':
      return PencilDraw;
    case 'Line':
      return DrawLine;
    case 'Arrow':
      return DrawArrow;
    case 'Circle':
      break;
    case 'Rectangle':
      break;
    case 'Text':
      break;
  }
}

class OperationManager {
  /** @type {import('./operations/operation.js').default[]} */
  #history = [];

  /**
   * Creates an instance of OperationOverlay.
   *
   * @param {HTMLElement} viewport
   * @param {import('./cartesian-graph.js').default} cartesianGraph
   * @memberof OperationOverlay
   */
  constructor(viewport, cartesianGraph) {
    const canvas = viewport.children[1];
    canvas.width = viewport.clientWidth;
    canvas.height = viewport.clientHeight;

    /** @type {CanvasRenderingContext2D} */
    this.context = canvas.getContext('2d');

    let isMouseDown = false;
    this.relativeCursorPosition = { x: 0, y: 0 };
    viewport.addEventListener('mousedown', (e) => {
      isMouseDown = true;

      this.#history.push(new (getCurrentOperation())(this, cartesianGraph));
      this.#history[this.#history.length - 1].mousedown(e);
    });

    viewport.addEventListener('mousemove', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      this.relativeCursorPosition.x = cartesianGraph.scaleDownX(
        e.clientX - rect.left
      );
      this.relativeCursorPosition.y = cartesianGraph.scaleDownY(
        e.clientY - rect.top
      );

      if (isMouseDown) {
        this.#history[this.#history.length - 1].mousemove(e);
      }
    });

    viewport.addEventListener('mouseup', (e) => {
      if (isMouseDown) {
        this.#history[this.#history.length - 1].mouseup(e);
        this.#history[this.#history.length - 1].render();
        isMouseDown = false;
      }
    });
  }

  render() {
    const canvas = this.context.canvas;
    this.context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i <= this.#history.length - 1; i++) {
      this.#history[i].render();
    }
  }
}

export default OperationManager;

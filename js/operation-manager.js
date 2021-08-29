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

    let isLeftMouseDown = false;
    let isWheelMouseDown = false;
    this.relativeCursorPosition = { x: 0, y: 0 };
    viewport.addEventListener('mousedown', (e) => {
      if (e.button == 0) {
        isLeftMouseDown = true;
        this.#history.push(new (getCurrentOperation())(this, cartesianGraph));
        this.#history[this.#history.length - 1].mousedown(e);
      }

      isWheelMouseDown = e.button == 1;
    });

    viewport.addEventListener('mousemove', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = cartesianGraph.scaleDownX(e.clientX - rect.left);
      const y = cartesianGraph.scaleDownY(e.clientY - rect.top);

      if (isWheelMouseDown) {
        cartesianGraph.offset.x -= (this.relativeCursorPosition.x - x) * 0.95;
        cartesianGraph.offset.y -= (this.relativeCursorPosition.y - y) * 0.95;
        cartesianGraph.render();
        this.render();
      }

      this.relativeCursorPosition.x = x;
      this.relativeCursorPosition.y = y;

      if (isLeftMouseDown) {
        this.#history[this.#history.length - 1].mousemove(e);
      }
    });

    viewport.addEventListener('mouseup', (e) => {
      if (isLeftMouseDown && e.button == 0) {
        this.#history[this.#history.length - 1].mouseup(e);
        isLeftMouseDown = false;
      } else if (isWheelMouseDown && e.button == 1) {
        isWheelMouseDown = false;
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

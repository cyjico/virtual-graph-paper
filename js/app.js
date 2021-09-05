import CartesianGraph from './cartesian-graph.js';
import OperationHistory from './operation-history.js';
import ActiveOperation from './operations/active-operations/active-operation.js';
import DrawText from './operations/active-operations/draw-text.js';
import DrawArcText from './operations/draw-arc-text.js';
import DrawArc from './operations/draw-arc.js';
import DrawArrow from './operations/draw-arrow.js';
import DrawLine from './operations/draw-line.js';
import Operation from './operations/operation.js';
import PencilDraw from './operations/pencil-draw.js';

function getSelectedOperation() {
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
    case 'Arc':
      return DrawArc;
    case 'Arc (w/ text)':
      return DrawArcText;
    case 'Rectangle':
      break;
    case 'Text':
      return DrawText;
  }
}

window.addEventListener('load', () => {
  const viewport = document.getElementById('viewport');
  const operationHistory = new OperationHistory(viewport);
  const cartesianGraph = new CartesianGraph(viewport);
  /** @type {import('./operations/operation.js').default|import('./operations/active-operations/active-operation.js').default} */
  let currentOperation = null;

  {
    // Setting up the tools.
    const tools = document.querySelectorAll(
      '#toolbox div.button-set input[type="button"]'
    );
    let activeTool = tools[0];
    for (let i = 0; i < tools.length; i++) {
      tools[i].addEventListener('click', (e) => {
        activeTool.classList.remove('button--active-state');
        activeTool = e.currentTarget;
        activeTool.classList.add('button--active-state');
        document.getElementById('status-line__message').innerText =
          getSelectedOperation().statusMessage || Operation.statusMessage;

        if (currentOperation instanceof ActiveOperation) {
          currentOperation.active = false;
          operationHistory.addOperation(currentOperation);
        }

        currentOperation = null;
      });
    }

    // Setting up the buttons of the right panel.
    const buttons = document.querySelectorAll(
      '#right-panel .button-set input[type="button"]'
    );
    buttons[0].addEventListener('click', () => {
      operationHistory.undoOperation();
    });
    buttons[1].addEventListener('click', () => {
      operationHistory.redoOperation();
    });
  }

  const input = {
    isLeftMouseDown: false,
    isWheelMouseDown: false,
    relativeCursorPosition: {
      x: 0,
      y: 0,
    },
    keys: [],
  };

  /**
   * @type {{
   *   get isDegreeSnapping: boolean,
   *   get isGridSnapping: boolean,
   *   get strokeWidth: number,
   *   get foregroundColor: number,
   *   get backgroundColor: number,
   * }}
   */
  const env = {
    get isDegreeSnapping() {
      return document.getElementById('snap--deg').checked;
    },
    get isGridSnapping() {
      return document.getElementById('snap--grid').checked;
    },
    get strokeWidth() {
      return parseFloat(
        document.getElementById('stroke-picker').children[1].value
      );
    },
    get foregroundColor() {
      return document.getElementById('foreground-color').value;
    },
    get backgroundColor() {
      return document.getElementById('background-color').value;
    },
  };

  document.addEventListener('keydown', (e) => {
    if (!input.keys.includes(e.key)) {
      input.keys.push(e.key);

      if (currentOperation != null) {
        document.activeElement?.blur?.();
        currentOperation.onKeydown({ e, input, env });
      }
    }

    // Undo and redo for history.
    if (input.keys[0] == 'Control') {
      if (input.keys.length == 2 && input.keys[1].toUpperCase() == 'Z') {
        operationHistory.undoOperation();
      } else if (
        input.keys.length == 3 &&
        input.keys[1] == 'Shift' &&
        input.keys[2].toUpperCase() == 'Z'
      ) {
        operationHistory.redoOperation();
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    for (let i = 0; i < input.keys.length; i++) {
      if (input.keys[i].toUpperCase() == e.key.toUpperCase()) {
        input.keys.splice(i, 1);

        currentOperation?.onKeyup?.({ e, input, env });
        break;
      }
    }
  });

  viewport.addEventListener('mousedown', (e) => {
    input.isLeftMouseDown = (e.buttons & 1) != 0;
    input.isWheelMouseDown = (e.buttons & 4) != 0;

    if (input.isLeftMouseDown) {
      if (currentOperation instanceof ActiveOperation) {
        currentOperation.active = false;
        operationHistory.addOperation(currentOperation);
        currentOperation = null;
      }

      if (currentOperation == null) {
        currentOperation = new (getSelectedOperation())(
          operationHistory,
          cartesianGraph
        );
        currentOperation.onMousedown({ e, input, env });
      }
    }
  });

  viewport.addEventListener('mousemove', (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const rx = cartesianGraph.scaleDownX(e.clientX - bounds.left);
    const ry = cartesianGraph.scaleDownY(e.clientY - bounds.top);

    if (input.isWheelMouseDown) {
      cartesianGraph.offset.x -= (input.relativeCursorPosition.x - rx) * 0.5;
      cartesianGraph.offset.y -= (input.relativeCursorPosition.y - ry) * 0.5;
      operationHistory.render();
      cartesianGraph.render();
    }

    if (env.isGridSnapping) {
      input.relativeCursorPosition.x = Math.round(rx);
      input.relativeCursorPosition.y = Math.round(ry);
    } else {
      input.relativeCursorPosition.x = rx;
      input.relativeCursorPosition.y = ry;
    }

    if (
      (input.isLeftMouseDown && currentOperation != null) ||
      currentOperation instanceof ActiveOperation
    ) {
      currentOperation.onMousemove({ e, input, env });
    }
  });

  document.addEventListener('mouseup', (e) => {
    input.isLeftMouseDown = input.isLeftMouseDown && (e.buttons & 1) != 0;
    input.isWheelMouseDown = input.isWheelMouseDown && (e.buttons & 4) != 0;

    if (!input.isLeftMouseDown && currentOperation != null) {
      currentOperation.onMouseup({ e, input, env });

      if (!(currentOperation instanceof ActiveOperation)) {
        operationHistory.addOperation(currentOperation);
        currentOperation = null;
      }
    }
  });

  viewport.addEventListener(
    'wheel',
    (e) => {
      cartesianGraph.scale = Math.min(
        Math.max(
          cartesianGraph.scale -
            e.deltaY *
              0.0075 *
              (cartesianGraph.scale / cartesianGraph.baseScale),
          4.5
        ),
        75.825
      );

      cartesianGraph.render();
      operationHistory.render();
    },
    { passive: true }
  );

  cartesianGraph.render();
});

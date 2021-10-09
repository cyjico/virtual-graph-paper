import CartesianGraph from './cartesian-graph.js';
import OperationManager from './operation-manager.js';
import ActiveOperation from './active-operations/active-operation.js';
import DrawText from './active-operations/draw-text.js';
import DrawArcText from './operations/draw-arc-text.js';
import DrawArc from './operations/draw-arc.js';
import DrawArrow from './operations/draw-arrow.js';
import DrawLine from './operations/draw-line.js';
import DrawRectangle from './operations/draw-rectangle.js';
import Operation from './operations/operation.js';
import DrawPencil from './operations/draw-pencil.js';

function getSelectedOperation() {
  switch (
    document.querySelector('#toolbox div.button-set input.button--active-state')
      .value
  ) {
    case 'Pencil':
      return DrawPencil;
    case 'Line':
      return DrawLine;
    case 'Arrow':
      return DrawArrow;
    case 'Arc':
      return DrawArc;
    case 'Arc (w/ text)':
      return DrawArcText;
    case 'Rectangle':
      return DrawRectangle;
    case 'Text':
      return DrawText;
  }
}

/**
 *
 * @param {any} env
 * @return {{
 *   get isDegreeSnapping: boolean,
 *   isGridSnapping: boolean,
 *   strokeWidth: number,
 *   get foregroundColor: number,
 *   get backgroundColor: number,
 * }}
 */
function constructEnvironment(env) {
  const gridSnappingElement = document.getElementById('snap--grid');
  gridSnappingElement.addEventListener('change', (e) => {
    env.isGridSnapping = e.target.checked;
  });

  env.isGridSnapping = gridSnappingElement.checked;

  const strokeWidthElement =
    document.getElementById('stroke-picker').children[1];
  strokeWidthElement.addEventListener('change', (e) => {
    env.strokeWidth = parseFloat(e.target.value);
  });

  env.strokeWidth = parseFloat(strokeWidthElement.value);

  return env;
}

window.addEventListener('load', () => {
  const statusBar = {
    coordsElement: document.getElementById('status-bar__coords'),
    messageElement: document.getElementById('status-bar__message'),
  };
  const viewportElement = document.getElementById('viewport');
  const cartesianGraph = new CartesianGraph(viewportElement);
  const operationManager = new OperationManager(
    viewportElement,
    cartesianGraph
  );
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
        statusBar.messageElement.innerText =
          getSelectedOperation().statusMessage || Operation.statusMessage;

        if (currentOperation instanceof ActiveOperation) {
          currentOperation.active = false;
          operationManager.addOperation(currentOperation);
        }

        currentOperation = null;
      });
    }

    // Setting up the buttons of the right panel.
    const buttons = document.querySelectorAll(
      '#right-panel .button-set input[type="button"]'
    );
    buttons[0].addEventListener('click', () => {
      operationManager.undoOperation();
    });
    buttons[1].addEventListener('click', () => {
      operationManager.redoOperation();
    });
    buttons[2].addEventListener('click', () => {
      operationManager.saveOperation().then((canvas) => {
        const link = document.createElement('a');
        link.setAttribute('download', 'GraphPaper.png');
        link.setAttribute(
          'href',
          canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream')
        );
        link.click();
      });
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

  const env = constructEnvironment({
    get isDegreeSnapping() {
      return document.getElementById('snap--deg').checked;
    },
    isGridSnapping: false,
    strokeWidth: 0,
    get foregroundColor() {
      return document.getElementById('foreground-color').value;
    },
    get backgroundColor() {
      return document.getElementById('background-color').value;
    },
  });

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
        operationManager.undoOperation();
        e.preventDefault();
      } else if (
        input.keys.length == 3 &&
        input.keys[1] == 'Shift' &&
        input.keys[2].toUpperCase() == 'Z'
      ) {
        operationManager.redoOperation();
        e.preventDefault();
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

  viewportElement.addEventListener('mousedown', (e) => {
    input.isLeftMouseDown = (e.buttons & 1) != 0;
    input.isWheelMouseDown = (e.buttons & 4) != 0;

    if (input.isLeftMouseDown) {
      if (currentOperation instanceof ActiveOperation) {
        currentOperation.active = false;
        operationManager.addOperation(currentOperation);
        currentOperation = null;
      }

      if (currentOperation == null) {
        currentOperation = new (getSelectedOperation())(
          operationManager,
          cartesianGraph
        );
        currentOperation.onMousedown({ e, input, env });
      }
    }
  });

  viewportElement.addEventListener('mousemove', (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const rx = cartesianGraph.scaleDownX(e.clientX - bounds.left);
    const ry = cartesianGraph.scaleDownY(e.clientY - bounds.top);

    if (input.isWheelMouseDown) {
      cartesianGraph.offset.x -= (input.relativeCursorPosition.x - rx) * 0.5;
      cartesianGraph.offset.y -= (input.relativeCursorPosition.y - ry) * 0.5;
      operationManager.render();
      cartesianGraph.render();
    }

    if (env.isGridSnapping) {
      input.relativeCursorPosition.x = Math.round(rx);
      input.relativeCursorPosition.y = Math.round(ry);
    } else {
      input.relativeCursorPosition.x = rx;
      input.relativeCursorPosition.y = ry;
    }

    statusBar.coordsElement.innerText = `X: ${rx.toFixed(2)} Y: ${-ry.toFixed(
      2
    )}`;

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
        operationManager.addOperation(currentOperation);
        currentOperation = null;
      }
    }
  });

  viewportElement.addEventListener(
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
      operationManager.render();
    },
    { passive: true }
  );

  // main()
  cartesianGraph.render();
});

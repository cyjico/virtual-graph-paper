import CartesianGraph from './cartesian-graph.js';
import OperationHistory from './operation-history.js';
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
      break;
  }
}

window.addEventListener('load', () => {
  const viewport = document.getElementById('viewport');
  const operationHistory = new OperationHistory(viewport);
  const cartesianGraph = new CartesianGraph(viewport);

  {
    // Setting up the toolbox.
    const buttons = document.querySelectorAll(
      '#toolbox div.button-set input[type="button"]'
    );
    let active = buttons[0];
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', (e) => {
        active.classList.remove('button--active-state');
        active = e.currentTarget;
        active.classList.add('button--active-state');
        document.getElementById('status-line__message').innerText =
          getSelectedOperation().statusMessage || Operation.statusMessage;
      });
    }
  }

  {
    // Setting up the buttons of the right panel..
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

  {
    /** @type {import('./operations/operation.js').default} */
    let currentOperation = null;

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

        if (currentOperation) {
          currentOperation.keydown({ e, input, env });
        }
      }

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
        if (input.keys[i] === e.code) {
          input.keys.splice(i, 1);

          if (currentOperation) {
            currentOperation.keyup({ e, input, env });
          }
          break;
        }
      }
    });

    viewport.addEventListener('mousedown', (e) => {
      input.isLeftMouseDown = (e.buttons & 1) != 0;
      input.isWheelMouseDown = (e.buttons & 4) != 0;

      if (input.isLeftMouseDown) {
        currentOperation = new (getSelectedOperation())(
          operationHistory,
          cartesianGraph
        );
        currentOperation.mousedown({ e, input, env });
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

      if (input.isLeftMouseDown && currentOperation) {
        currentOperation.mousemove({ e, input, env });
      }
    });

    document.addEventListener('mouseup', (e) => {
      input.isLeftMouseDown = input.isLeftMouseDown && (e.buttons & 1) != 0;
      input.isWheelMouseDown = input.isWheelMouseDown && (e.buttons & 4) != 0;

      if (!input.isLeftMouseDown && currentOperation) {
        currentOperation.mouseup({ e, input, env });
        operationHistory.addOperation(currentOperation);
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
  }

  cartesianGraph.render();
});

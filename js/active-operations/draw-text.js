import ActiveOperation from './active-operation.js';

/**
 * Clamp a value between min and max (inclusive).
 *
 * @param {number} x
 * @param {number} min
 * @param {number} max
 * @return {number}
 */
function clamp(x, min, max) {
  return Math.max(Math.min(x, max), min);
}

class DrawText extends ActiveOperation {
  static statusMessage = 'Press any key to type | [ESC] to stop typing';

  /**
   * Creates an instance of DrawText.
   *
   * @param {import('../operation-manager/operation-manager.js').default} operationManager
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof DrawText
   */
  constructor(operationManager, cartesianGraph) {
    super(operationManager, cartesianGraph);

    this._enableDrawIndicator = true;

    /** @type {string[]} */
    this.text = [''];
    this.textPos = {
      x: 0,
      y: 0,
    };
    this.x = 0;
    this.y = 0;

    this.foregroundColor = '';
    this.strokeWidth = 0;
  }

  #removeCharacter(x, y) {
    y = clamp(y, 0, this.text.length);
    x = clamp(x, -1, this.text[y].length);

    const line = this.text[y];

    if (y > 0 && x == -1) {
      x = this.text[y - 1].length;
      this.text[y - 1] += line;
      this.text.splice(y, 1);
      y -= 1;
    } else if (y < this.text.length && x == line.length) {
      this.text[y] += this.text[y + 1];
      this.text.splice(y + 1, 1);
    } else {
      if (x < 0) {
        x = 0;
      } else {
        this.text[y] = line.slice(0, x) + line.slice(x + 1);
      }
    }

    return {
      x: x,
      y: y,
    };
  }

  onMousedown({ env, input }) {
    this.foregroundColor = env.foregroundColor;
    this.strokeWidth = env.strokeWidth;
    this.x = input.relativeCursorPosition.x;
    this.y = input.relativeCursorPosition.y;

    this.renderIndicator();
  }

  onMousemove({ input }) {
    if (input.isWheelMouseDown) {
      this.renderIndicator();
      this.render();
    }
  }

  onKeydown({ input }) {
    if (this.active) {
      const key = input.keys[input.keys.length - 1];

      if (key.length == 1) {
        const text = this.text[this.textPos.y];
        this.text[this.textPos.y] =
          text.slice(0, this.textPos.x) + key + text.slice(this.textPos.x++);
      } else {
        switch (key) {
          case 'Escape': // Stop typing.
            this.active = false;
            break;
          case 'Enter': // Create new line
            const line = this.text[this.textPos.y].slice(this.textPos.x);
            this.text[this.textPos.y] = this.text[this.textPos.y].slice(
              0,
              this.textPos.x
            );
            this.textPos.x = 0;
            this.textPos.y += 1;
            this.text.splice(this.textPos.y, 0, line);
            break;
          case 'Backspace': // Remove previous character
            this.textPos = this.#removeCharacter(
              this.textPos.x - 1,
              this.textPos.y
            );
            break;
          case 'Delete': // Remove current character
            this.textPos = this.#removeCharacter(
              this.textPos.x,
              this.textPos.y
            );
            break;
          case 'ArrowRight':
            this.textPos.x = clamp(
              this.textPos.x + 1,
              0,
              this.text[this.textPos.y].length
            );
            break;
          case 'ArrowLeft':
            this.textPos.x = clamp(
              this.textPos.x - 1,
              0,
              this.text[this.textPos.y].length
            );
            break;
          case 'ArrowUp':
            this.textPos.y = clamp(this.textPos.y - 1, 0, this.text.length - 1);
            this.textPos.x = clamp(
              this.textPos.x,
              0,
              this.text[this.textPos.y].length
            );
            break;
          case 'ArrowDown':
            this.textPos.y = clamp(this.textPos.y + 1, 0, this.text.length - 1);
            this.textPos.x = clamp(
              this.textPos.x,
              0,
              this.text[this.textPos.y].length
            );
            break;
          case 'Home':
            this.textPos.x = 0;
            break;
          case 'End':
            this.textPos.x = this.text[this.textPos.y].length;
            break;
        }
      }

      this.operationManager.render();

      if (this.active) {
        this.renderIndicator();
      }

      this.render();
    }
  }

  onDisable() {
    this.operationManager.render();
    this.render();
  }

  render() {
    const context = this.operationManager.context;

    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.fillStyle = this.foregroundColor;
    context.font = `${
      10 * this.cartesianGraph.scale * this.strokeWidth * 0.75
    }px sans-serif`;

    for (let i = 0; i < this.text.length; i++) {
      context.fillText(
        this.text[i],
        this.cartesianGraph.scaleUpX(this.x),
        this.cartesianGraph.scaleUpY(
          this.y + i * this.cartesianGraph.scale * this.strokeWidth * 0.5
        )
      );
    }
  }

  renderIndicator() {
    if (this._enableDrawIndicator) {
      const context = this.operationManager.context;
      const metrics = context.measureText(
        this.text[this.textPos.y].slice(0, this.textPos.x)
      );

      context.beginPath();
      context.moveTo(
        this.cartesianGraph.scaleUpX(this.x) + metrics.width,
        this.cartesianGraph.scaleUpY(this.y + this.textPos.y)
      );
      context.lineTo(
        this.cartesianGraph.scaleUpX(this.x) + metrics.width,
        this.cartesianGraph.scaleUpY(this.y + this.textPos.y + this.strokeWidth)
      );
      context.strokeStyle = '#000000';
      context.stroke();
    }
  }
}

export default DrawText;

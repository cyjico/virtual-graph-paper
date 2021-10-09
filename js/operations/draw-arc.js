import Operation from './operation.js';

const RAD_CONSTANTS = [Math.PI * 0.5, Math.PI, Math.PI * 1.5];

const RAD_15 = 15 * (Math.PI / 180);

class DrawArc extends Operation {
  static statusMessage =
    '[LMB] to draw | [Q] to set starting degree | [E] to switch clockwise';

  /**
   * Creates an instance of DrawArc.
   *
   * @param {import('../operation-manager.js').default} operationManager
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof DrawArc
   */
  constructor(operationManager, cartesianGraph) {
    super(operationManager, cartesianGraph);

    this.center = {
      x: 0,
      y: 0,
    };
    this.radius = 0;
    this.startRad = 0;
    this.endRad = 0;
    this.counterClockwise = true;

    this.foregroundColor = '';
    this.strokeWidth = 0;
  }

  onMousedown({ input, env }) {
    this.foregroundColor = env.foregroundColor;
    this.strokeWidth = env.strokeWidth;
    this.center.x = input.relativeCursorPosition.x;
    this.center.y = input.relativeCursorPosition.y;
  }

  onMousemove({ input, env }, render = true) {
    const x = input.relativeCursorPosition.x - this.center.x;
    const y = input.relativeCursorPosition.y - this.center.y;
    this.radius = Math.sqrt(x * x + y * y);

    if (env.isDegreeSnapping) {
      this.endRad =
        Math.round((Math.atan2(x, y) - RAD_CONSTANTS[0]) / RAD_15) * RAD_15;
    } else {
      this.endRad = Math.atan2(x, y) - RAD_CONSTANTS[0];
    }

    if (Math.abs(this.endRad - this.startRad) <= Number.EPSILON) {
      this.endRad =
        this.startRad + Math.PI * 2 * (this.counterClockwise ? -1 : 1);
    }

    if (render) {
      this.operationManager.render();
      this.render();
    }
  }

  #setBounds(x, y) {
    if (x < this.bounds.min.x) {
      this.bounds.min.x = x;
    }

    if (x > this.bounds.max.x) {
      this.bounds.max.x = x;
    }

    if (y < this.bounds.min.y) {
      this.bounds.min.y = y;
    }

    if (y > this.bounds.max.y) {
      this.bounds.max.y = y;
    }
  }

  /**
   * Converts a number that ranges from `180 to -180` to `-360 to 360`.
   *
   * @param {number} rad
   * @return {number}
   */
  convertToRange(rad) {
    if (this.counterClockwise && rad > 0) {
      rad -= Math.PI * 2 * (1 + Math.floor(rad / (Math.PI * 2)));
    } else if (!this.counterClockwise && rad < 0) {
      rad += Math.PI * 2 * (1 + Math.floor(-rad / (Math.PI * 2)));
    }

    return rad;
  }

  onMouseup() {
    const rangeRad = this.convertToRange(this.endRad - this.startRad);
    const halfSWidth = this.strokeWidth / 2;

    for (let i = 0; i < RAD_CONSTANTS.length; i++) {
      const sign = this.counterClockwise ? -1 : 1;
      const radConstant = this.startRad + RAD_CONSTANTS[i] * sign;

      if (Math.abs(rangeRad) > RAD_CONSTANTS[i]) {
        const cos = Math.cos(radConstant);
        const sin = Math.sin(radConstant);

        this.#setBounds(
          this.center.x + cos * this.radius + halfSWidth * Math.sign(cos),
          this.center.y - (sin * this.radius + halfSWidth * Math.sign(sin))
        );
      }
    }

    const startCos = Math.cos(this.startRad);
    const startSin = Math.sin(this.startRad);
    const xStart = this.center.x + startCos * this.radius;
    const yStart = this.center.y - startSin * this.radius;

    this.#setBounds(
      xStart + halfSWidth * Math.sign(startCos),
      yStart + halfSWidth * Math.sign(startSin)
    );
    this.#setBounds(
      xStart - halfSWidth * Math.sign(startCos),
      yStart - halfSWidth * Math.sign(startSin)
    );

    const endRad = this.startRad + rangeRad;
    const endCos = Math.cos(endRad);
    const endSin = Math.sin(endRad);
    const xEnd = this.center.x + endCos * this.radius;
    const yEnd = this.center.y - endSin * this.radius;

    this.#setBounds(
      xEnd + halfSWidth * Math.sign(endCos),
      yEnd + halfSWidth * Math.sign(endSin)
    );
    this.#setBounds(
      xEnd - halfSWidth * Math.sign(endCos),
      yEnd - halfSWidth * Math.sign(endSin)
    );
  }

  onKeydown({ input, env }) {
    if (input.keys.length == 1) {
      switch (input.keys[0].toUpperCase()) {
        case 'Q':
          this.startRad =
            Math.atan2(
              input.relativeCursorPosition.x - this.center.x,
              input.relativeCursorPosition.y - this.center.y
            ) - RAD_CONSTANTS[0];

          if (env.isDegreeSnapping) {
            this.startRad = Math.round(this.startRad / RAD_15) * RAD_15;
          }

          this.operationManager.render();
          this.render();
          break;
        case 'E':
          this.counterClockwise = !this.counterClockwise;
          this.operationManager.render();
          this.render();
          break;
      }
    }
  }

  render() {
    const context = this.operationManager.context;

    context.beginPath();
    context.arc(
      this.cartesianGraph.scaleUpX(this.center.x),
      this.cartesianGraph.scaleUpY(this.center.y),
      this.radius * this.cartesianGraph.scale,
      this.startRad,
      this.endRad,
      this.counterClockwise
    );

    context.strokeStyle = this.foregroundColor;
    context.lineWidth = this.strokeWidth * this.cartesianGraph.scale;
    context.stroke();
  }
}

export default DrawArc;

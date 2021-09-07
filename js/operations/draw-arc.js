import Operation from './operation.js';

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
      this.endRad = Math.round(Math.atan2(y, x) / RAD_15) * RAD_15;
    } else {
      this.endRad = Math.atan2(y, x);
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

  onKeydown({ input, env }) {
    if (input.keys.length == 1) {
      switch (input.keys[0].toUpperCase()) {
        case 'Q':
          this.startRad = Math.atan2(
            input.relativeCursorPosition.y - this.center.y,
            input.relativeCursorPosition.x - this.center.x
          );

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

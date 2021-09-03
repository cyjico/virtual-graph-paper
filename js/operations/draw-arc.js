import Operation from './operation.js';

class DrawArc extends Operation {
  static statusMessage =
    '[LMB] to draw | [Q] to set starting degree | [E] to switch clockwise';

  /**
   * Creates an instance of DrawArc.
   *
   * @param {import('../operation-history.js').default} operationManager
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

    this.strokeWidth = 0;
  }

  mousedown({ input, env }) {
    this.strokeWidth = env.strokeWidth;
    this.center.x = input.relativeCursorPosition.x;
    this.center.y = input.relativeCursorPosition.y;
  }

  mousemove({ input }) {
    const x = input.relativeCursorPosition.x - this.center.x;
    const y = input.relativeCursorPosition.y - this.center.y;
    this.radius = Math.sqrt(x * x + y * y);
    this.endRad = Math.atan2(y, x);

    const PI2 = Math.PI * 2;
    if ((this.endRad / PI2) % 1 == (this.startRad / PI2) % 1) {
      this.endRad =
        this.startRad + Math.PI * 2 * (this.counterClockwise ? -1 : 1);
    }

    this.operationManager.render();
    this.render();
  }

  keydown({ input }) {
    if (input.keys.length == 1) {
      switch (input.keys[0]) {
        case 'KeyQ':
          this.startRad = Math.atan2(
            input.relativeCursorPosition.y - this.center.y,
            input.relativeCursorPosition.x - this.center.x
          );
          this.operationManager.render();
          this.render();
          break;
        case 'KeyE':
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
    context.lineWidth = this.strokeWidth;
    context.stroke();
  }
}

export default DrawArc;

import Operation from './operation.js';

class DrawArc extends Operation {
  static statusMessage =
    '[LMB] to draw | [Q] to set starting degree | [E] to switch clockwise';

  /**
   * Creates an instance of DrawArc.
   *
   * @param {import('../operation-history.js').default} operationHistory
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof DrawArc
   */
  constructor(operationHistory, cartesianGraph) {
    super(operationHistory, cartesianGraph);

    this.center = {
      x: 0,
      y: 0,
    };
    this.radius = 0;
    this.startRad = 0;
    this.endRad = 0;
    this.counterClockwise = true;

    this.foregroundColor = '#000000';
    this.strokeWidth = 0;
  }

  onMousedown({ input, env }) {
    this.foregroundColor = env.foregroundColor;
    this.strokeWidth = env.strokeWidth;
    this.center.x = input.relativeCursorPosition.x;
    this.center.y = input.relativeCursorPosition.y;
  }

  onMousemove({ input, env }) {
    const x = input.relativeCursorPosition.x - this.center.x;
    const y = input.relativeCursorPosition.y - this.center.y;
    this.radius = Math.sqrt(x * x + y * y);

    if (env.isDegreeSnapping) {
      const rad15 = 15 * (Math.PI / 180);
      this.endRad = Math.round(Math.atan2(y, x) / rad15) * rad15;
    } else {
      this.endRad = Math.atan2(y, x);
    }

    const PI2 = Math.PI * 2;
    if ((this.endRad / PI2) % 1 == (this.startRad / PI2) % 1) {
      this.endRad =
        this.startRad + Math.PI * 2 * (this.counterClockwise ? -1 : 1);
    }

    this.operationHistory.render();
    this.render();
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
            const rad15 = 15 * (Math.PI / 180);
            this.startRad = Math.round(this.startRad / rad15) * rad15;
          }

          this.operationHistory.render();
          this.render();
          break;
        case 'E':
          this.counterClockwise = !this.counterClockwise;
          this.operationHistory.render();
          this.render();
          break;
      }
    }
  }

  render() {
    const context = this.operationHistory.context;

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
    context.lineWidth =
      this.strokeWidth *
      (this.cartesianGraph.scale / this.cartesianGraph.baseScale);
    context.stroke();
  }
}

export default DrawArc;

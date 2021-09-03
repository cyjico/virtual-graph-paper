import DrawArc from './draw-arc.js';

class DrawArcText extends DrawArc {
  #isKeyDown = false;

  /**
   * Creates an instance of DrawArc.
   *
   * @param {import('../operation-history.js').default} operationManager
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof DrawArcText
   */
  constructor(operationManager, cartesianGraph) {
    super(operationManager, cartesianGraph);

    this.text = '';
    this.textOffset = {
      x: 0,
      y: 0,
    };
    this.backgroundColor = '#ffffff';
  }

  mousedown(args) {
    super.mousedown.call(this, args);

    this.backgroundColor = args.env.backgroundColor;
  }

  mousemove(args) {
    const PI2 = Math.PI * 2;
    const CCW_SIGN = this.counterClockwise ? 1 : -1;

    const startRad =
      (this.counterClockwise && this.startRad > 0) ||
      (!this.counterClockwise && this.startRad < 0)
        ? this.startRad - PI2 * CCW_SIGN
        : this.startRad;
    const endRad = (() => {
      const baseRad =
        (this.counterClockwise && this.endRad > 0) ||
        (!this.counterClockwise && this.endRad < 0)
          ? this.endRad - PI2 * CCW_SIGN
          : this.endRad;

      return (
        baseRad - (Math.abs(baseRad) <= Math.abs(startRad) ? PI2 * CCW_SIGN : 0)
      );
    })();
    const rangeRad = endRad - startRad;
    const medianRad = rangeRad / 2;

    this.text = `  ${(
      Math.round(rangeRad * (180 / Math.PI) * -100) / 100
    ).toFixed(2)}°`;
    this.textOffset.x = Math.cos(startRad + medianRad);
    this.textOffset.y = Math.sin(startRad + medianRad);

    super.mousemove.call(this, args);
  }

  keydown(args) {
    super.keydown(args);
    this.#isKeyDown = true;
  }

  keyup() {
    this.#isKeyDown = false;
  }

  render() {
    if (this.#isKeyDown) {
      // The parent rendered while some key was down!
      this.operationManager.render();
    }

    const context = this.operationManager.context;
    let scalar = 1.5;

    switch (this.text) {
      case '  -90.00°':
      case '  90.00°':
        {
          context.beginPath();
          const radius = this.radius * this.cartesianGraph.scale;
          const signX = Math.sign(this.textOffset.x);
          const signY = Math.sign(this.textOffset.y);
          const cx = this.cartesianGraph.scaleUpX(this.center.x);
          const cy = this.cartesianGraph.scaleUpY(this.center.y);

          context.moveTo(cx, cy + radius * signY);
          context.lineTo(cx + radius * signX, cy + radius * signY);
          context.lineTo(cx + radius * signX, cy);
          context.strokeStyle = this.foregroundColor;
          context.stroke();
          scalar = 1.75;
        }
        break;
      default:
        super.render.call(this);
        break;
    }

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = this.backgroundColor;
    context.font = `${
      ((10 * this.cartesianGraph.scale) / this.cartesianGraph.baseScale) *
      this.strokeWidth *
      0.75
    }px sans-serif`;
    context.fillText(
      this.text,
      this.cartesianGraph.scaleUpX(
        this.center.x + this.textOffset.x * this.radius * scalar
      ),
      this.cartesianGraph.scaleUpY(
        this.center.y + this.textOffset.y * this.radius * scalar
      )
    );
  }
}

export default DrawArcText;

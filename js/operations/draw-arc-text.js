import DrawArc from './draw-arc.js';

class DrawArcText extends DrawArc {
  #isKeyDown = false;

  /**
   * Creates an instance of DrawArc.
   *
   * @param {import('../operation-history.js').default} operationHistory
   * @param {import('../cartesian-graph.js').default} cartesianGraph
   * @memberof DrawArcText
   */
  constructor(operationHistory, cartesianGraph) {
    super(operationHistory, cartesianGraph);

    this.text = '';
    this.textOffset = {
      x: 0,
      y: 0,
    };
    this.backgroundColor = '#ffffff';
  }

  /**
   * Converts a number that ranges from `180 to -180` to `-360 to 360`.
   *
   * @param {number} rad
   * @return {number}
   */
  #convertToRange(rad) {
    if (this.counterClockwise && rad > 0) {
      rad -= Math.PI * 2 * (1 + Math.floor(rad / (Math.PI * 2)));
    } else if (!this.counterClockwise && rad < 0) {
      rad += Math.PI * 2 * (1 + Math.floor(-rad / (Math.PI * 2)));
    }

    return rad;
  }

  onMousedown(args) {
    super.onMousedown.call(this, args);

    this.backgroundColor = args.env.backgroundColor;
  }

  onMousemove(args) {
    super.onMousemove.call(this, args, false);

    const rangeRad = this.#convertToRange(this.endRad - this.startRad);
    this.text = `  ${Math.round(rangeRad * (180 / Math.PI) * -100) / 100}°`;

    const headingRad = this.#convertToRange(this.startRad) + rangeRad / 2;
    this.textOffset.x = Math.cos(headingRad);
    this.textOffset.y = Math.sin(headingRad);

    this.operationHistory.render();
    this.render();
  }

  onKeydown(args) {
    super.onKeydown.call(this, args);
    this.#isKeyDown = true;
  }

  onKeyup() {
    this.#isKeyDown = false;
  }

  render() {
    if (this.#isKeyDown) {
      // The parent rendered while some key was down!
      this.operationHistory.render();
    }

    const context = this.operationHistory.context;
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
          context.lineWidth =
            this.strokeWidth *
            (this.cartesianGraph.scale / this.cartesianGraph.baseScale);
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
      10 *
      (this.cartesianGraph.scale / this.cartesianGraph.baseScale) *
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

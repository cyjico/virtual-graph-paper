import DrawArc from './draw-arc.js';

class DrawArcText extends DrawArc {
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

    this.text = `${(Math.round(rangeRad * (180 / Math.PI) * 100) / 100).toFixed(
      2
    )}°`;
    this.textOffset.x = Math.cos(this.startRad + medianRad) * 2;
    this.textOffset.y = Math.sin(this.startRad + medianRad) * CCW_SIGN;

    super.mousemove.call(this, args);
  }

  render() {
    const context = this.operationManager.context;

    switch (this.text) {
      case '90.00°':
        {
          context.beginPath();
          const sign = this.counterClockwise ? 1 : -1;
          const radius = this.radius * this.cartesianGraph.scale;
          const cx = this.cartesianGraph.scaleUpX(this.center.x);
          const cy = this.cartesianGraph.scaleUpY(this.center.y);

          context.moveTo(cx, cy - radius * sign);
          context.lineTo(cx + radius * sign, cy - radius * sign);
          context.lineTo(cx + radius * sign, cy);
          context.lineTo(cx + radius * sign, cy);
          context.stroke();
        }
        break;
      default:
        super.render.call(this);
        break;
    }

    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(
      this.text,
      this.cartesianGraph.scaleUpX(this.center.x + this.textOffset.x),
      this.cartesianGraph.scaleUpY(this.center.y + this.textOffset.y)
    );
  }
}

export default DrawArcText;

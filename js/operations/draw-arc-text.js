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
    const endRad = -(this.endRad > 0 ? this.endRad - Math.PI * 2 : this.endRad);
    this.text = `${(Math.round(endRad * (180 / Math.PI) * 100) / 100).toFixed(
      2
    )}°`;

    const rad = endRad / 2;
    this.textOffset.x = Math.cos(rad);
    this.textOffset.y = -Math.sin(rad);

    super.mousemove.call(this, args);
  }

  render() {
    const context = this.operationManager.context;

    switch (this.text) {
      case '90.00°':
        context.beginPath();
        const radius = this.radius * this.cartesianGraph.scale;
        const cx = this.cartesianGraph.scaleUpX(this.center.x);
        const cy = this.cartesianGraph.scaleUpY(this.center.y);
        context.moveTo(cx, cy - radius);
        context.lineTo(cx + radius, cy - radius);
        context.lineTo(cx + radius, cy);
        context.lineTo(cx + radius, cy);
        context.stroke();
        break;
      default:
        super.render.call(this);
        break;
    }

    context.fillText(
      this.text,
      this.cartesianGraph.scaleUpX(this.center.x + this.textOffset.x),
      this.cartesianGraph.scaleUpY(this.center.y + this.textOffset.y)
    );
  }
}

export default DrawArcText;

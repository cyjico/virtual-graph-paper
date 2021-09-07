import DrawArc from './draw-arc.js';

class DrawArcText extends DrawArc {
  #isKeyDown = false;

  /**
   * Creates an instance of DrawArc.
   *
   * @param {import('../operation-manager.js').default} operationManager
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

  onMousedown(args) {
    super.onMousedown.call(this, args);

    this.backgroundColor = args.env.backgroundColor;
  }

  onMousemove(args) {
    super.onMousemove.call(this, args, false);

    const rangeRad = this.convertToRange(this.endRad - this.startRad);
    this.text = `  ${Math.round(rangeRad * (180 / Math.PI) * -100) / 100}°`;

    const headingRad = this.convertToRange(this.startRad) + rangeRad / 2;
    this.textOffset.x = Math.cos(headingRad);
    this.textOffset.y = Math.sin(headingRad);

    this.operationManager.render();
    this.render();
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

  onMouseup() {
    super.onMouseup.call(this);

    const rangeRad = this.convertToRange(this.endRad - this.startRad);
    const headingRad = this.convertToRange(this.startRad) + rangeRad / 2;
    const headingCos = Math.cos(headingRad);
    const headingSin = Math.sin(headingRad);

    let scalar = 1.5;
    if (this.text == '  -90°' || this.text == '  90°') {
      scalar = 1.75;
    }

    const xHeading =
      this.center.x + headingCos * this.radius * 10 * this.strokeWidth * scalar;
    const yHeading =
      this.center.y + headingSin * this.radius * 10 * this.strokeWidth * scalar;
    const halfWidth = this.strokeWidth / 2;

    this.#setBounds(
      xHeading + halfWidth * Math.sign(headingCos),
      yHeading + halfWidth * Math.sign(headingSin)
    );
    this.#setBounds(
      xHeading - halfWidth * Math.sign(headingCos),
      yHeading - halfWidth * Math.sign(headingSin)
    );
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
      this.operationManager.render();
    }

    const context = this.operationManager.context;
    let scalar = 1.5;

    switch (this.text) {
      case '  -90°':
      case '  90°':
        {
          context.beginPath();
          const radius = this.radius * this.cartesianGraph.scale;
          const sign = this.counterClockwise ? -1 : 1;
          const cx = this.cartesianGraph.scaleUpX(this.center.x);
          const cy = this.cartesianGraph.scaleUpY(this.center.y);

          context.translate(cx, cy);
          context.rotate(this.startRad);

          context.moveTo(0, radius * sign);
          context.lineTo(radius, radius * sign);
          context.lineTo(radius, 0);
          context.strokeStyle = this.foregroundColor;
          context.lineWidth = this.strokeWidth * this.cartesianGraph.scale;
          context.stroke();

          context.setTransform(1, 0, 0, 1, 0, 0);

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
      10 * this.cartesianGraph.scale * this.strokeWidth * 0.75
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

class CartesianGraph {
  /**
   * Creates an instance of CartesianGraph.
   *
   * @param {HTMLElement} viewport
   * @memberof CartesianGraph
   */
  constructor(viewport) {
    const canvas = viewport.children[0];
    canvas.width = viewport.clientWidth;
    canvas.height = viewport.clientHeight;

    /** @type {CanvasRenderingContext2D} */
    this.context = canvas.getContext('2d');

    this.offset = {
      x: 0,
      y: 0,
    };
    this.baseScale = Math.min(canvas.width, canvas.height) * 0.025;
    this.scale = this.baseScale;
    this.markerLine = 5;
  }

  get viewportBounds() {
    const canvas = this.context.canvas;
    const halfWidth = canvas.width / 2 / this.scale;
    const halfHeight = canvas.height / 2 / this.scale;

    return {
      min: {
        x: -halfWidth - this.offset.x,
        y: this.offset.y - halfHeight,
      },
      max: {
        x: halfWidth - this.offset.x,
        y: this.offset.y + halfHeight,
      },
    };
  }

  /**
   * Draws a vertical line according to scale.
   *
   * @param {HTMLCanvasElement} canvas
   * @param {number} centerX
   * @param {number} centerY
   * @param {number} x
   * @memberof CartesianGraph
   */
  #drawVerticalLine(
    canvas,
    centerX,
    centerY,
    x,
    viewportBounds,
    isMarkerSticky
  ) {
    const globalIndex = Math.round((x - centerX) / this.scale);
    if (
      globalIndex %
        Math.ceil((this.baseScale / this.scale) * this.markerLine) ==
      0
    ) {
      const maxX = viewportBounds.max.x - globalIndex;
      const minX = viewportBounds.min.x - globalIndex;
      const maxY = viewportBounds.max.y - 1;
      const minY = viewportBounds.min.y;

      this.context.textAlign = maxX <= 0 ? 'right' : 'left';
      this.context.fillText(
        globalIndex,
        x +
          ((minX >= 0) * minX + (maxX <= 0) * maxX) *
            this.scale *
            isMarkerSticky,
        centerY -
          ((minY >= 0) * minY + (maxY <= 0) * maxY) *
            this.scale *
            isMarkerSticky
      );
      this.context.strokeStyle = 'hsl(0, 0%, 0%, 60%)';
    } else {
      this.context.strokeStyle = 'hsl(0, 0%, 0%, 20%)';
    }
    this.context.beginPath();
    this.context.moveTo(x, 0);
    this.context.lineTo(x, canvas.height);
    this.context.stroke();
  }

  /**
   * Draws a horizontal line according to scale.
   *
   * @param {HTMLCanvasElement} canvas
   * @param {number} centerX
   * @param {number} centerY
   * @param {number} y
   * @memberof CartesianGraph
   */
  #drawHorizontalLine(
    canvas,
    centerX,
    centerY,
    y,
    viewportBounds,
    isMarkerSticky
  ) {
    const globalIndex = Math.round((centerY - y) / this.scale);
    if (
      globalIndex %
        Math.ceil((this.baseScale / this.scale) * this.markerLine) ==
      0
    ) {
      const maxY = viewportBounds.max.y - globalIndex - 1;
      const minY = viewportBounds.min.y - globalIndex;
      const maxX = viewportBounds.max.x;
      const minX = viewportBounds.min.x;

      this.context.textAlign = maxX <= 0 ? 'right' : 'left';
      this.context.fillText(
        globalIndex,
        centerX +
          ((minX >= 0) * minX + (maxX <= 0) * maxX) *
            this.scale *
            isMarkerSticky,
        y -
          ((minY >= 0) * minY + (maxY <= 0) * maxY) *
            this.scale *
            isMarkerSticky
      );
      this.context.strokeStyle = 'hsl(0, 0%, 0%, 60%)';
    } else {
      this.context.strokeStyle = 'hsl(0, 0%, 0%, 20%)';
    }
    this.context.beginPath();
    this.context.moveTo(0, y);
    this.context.lineTo(canvas.width, y);
    this.context.stroke();
  }

  render(isMarkerSticky = true) {
    const canvas = this.context.canvas;

    this.context.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2 + this.offset.x * this.scale;
    const centerY = canvas.height / 2 + this.offset.y * this.scale;
    const viewportBounds = this.viewportBounds;

    this.context.save();

    this.context.strokeStyle = 'hsl(0, 50%, 65%)';
    if (centerX >= 0 && centerX <= canvas.width) {
      this.context.beginPath();
      this.context.moveTo(centerX, 0);
      this.context.lineTo(centerX, canvas.height);
      this.context.stroke();
    }

    if (centerY >= 0 && centerY <= canvas.height) {
      this.context.beginPath();
      this.context.moveTo(0, centerY);
      this.context.lineTo(canvas.width, centerY);
      this.context.stroke();
    }

    this.context.fillStyle = 'hsl(0, 50%, 65%)';
    const addendX = (() => {
      if (centerX < 0) {
        return this.scale * Math.round(Math.abs(centerX) / this.scale);
      } else if (centerX > canvas.width) {
        return (
          this.scale * Math.round(Math.abs(centerX - canvas.width) / this.scale)
        );
      }

      return this.scale;
    })();

    for (
      let x = centerX + addendX;
      x < canvas.width + this.scale;
      x += this.scale
    ) {
      this.#drawVerticalLine(
        canvas,
        centerX,
        centerY,
        x,
        viewportBounds,
        isMarkerSticky
      );
    }

    for (let x = centerX - addendX; x > -this.scale; x -= this.scale) {
      this.#drawVerticalLine(
        canvas,
        centerX,
        centerY,
        x,
        viewportBounds,
        isMarkerSticky
      );
    }

    const addendY = (() => {
      if (centerY < 0) {
        return this.scale * Math.round(Math.abs(centerY) / this.scale);
      } else if (centerY > canvas.height) {
        return (
          this.scale *
          Math.round(Math.abs(centerY - canvas.height) / this.scale)
        );
      }

      return this.scale;
    })();

    for (
      let y = centerY + addendY;
      y < canvas.height + this.scale;
      y += this.scale
    ) {
      this.#drawHorizontalLine(
        canvas,
        centerX,
        centerY,
        y,
        viewportBounds,
        isMarkerSticky
      );
    }

    for (let y = centerY - addendY; y > -this.scale; y -= this.scale) {
      this.#drawHorizontalLine(
        canvas,
        centerX,
        centerY,
        y,
        viewportBounds,
        isMarkerSticky
      );
    }

    this.context.restore();
  }

  /**
   * Scales up a unit based on the x-axis.
   *
   * @param {number} x
   * @return {number}
   * @memberof CartesianGraph
   */
  scaleUpX(x) {
    return (x + this.offset.x) * this.scale + this.context.canvas.width / 2;
  }

  /**
   * Scales up a unit based on the y-axis.
   *
   * @param {number} x
   * @return {number}
   * @memberof CartesianGraph
   */
  scaleUpY(x) {
    return -((x - this.offset.y) * this.scale - this.context.canvas.height / 2);
  }

  /**
   * Scales down a unit based on the x-axis.
   *
   * @param {number} x
   * @return {number}
   * @memberof CartesianGraph
   */
  scaleDownX(x) {
    return (x - this.context.canvas.width / 2) / this.scale - this.offset.x;
  }

  /**
   * Scales down a unit based on the y-axis.
   *
   * @param {number} x
   * @return {number}
   * @memberof CartesianGraph
   */
  scaleDownY(x) {
    return (this.context.canvas.height / 2 - x) / this.scale + this.offset.y;
  }
}

export default CartesianGraph;

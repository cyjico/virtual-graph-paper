((that) => {
  that.operationManager.context.beginPath();
  const max = {
    x: that.cartesianGraph.scaleUpX(that.bounds.max.x),
    y: that.cartesianGraph.scaleUpY(that.bounds.max.y),
  };
  const min = {
    x: that.cartesianGraph.scaleUpX(that.bounds.min.x),
    y: that.cartesianGraph.scaleUpY(that.bounds.min.y),
  };
  that.operationManager.context.moveTo(max.x, max.y);
  that.operationManager.context.lineTo(max.x, min.y);
  that.operationManager.context.lineTo(min.x, min.y);
  that.operationManager.context.lineTo(min.x, max.y);
  that.operationManager.context.closePath();
  that.operationManager.context.lineWidth = 1;
  that.operationManager.context.stroke();
})(this);

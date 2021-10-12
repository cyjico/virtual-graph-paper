export function drawBounds(thisArg) {
  thisArg.operationManager.context.beginPath();
  const max = {
    x: thisArg.cartesianGraph.scaleUpX(thisArg.bounds.max.x),
    y: thisArg.cartesianGraph.scaleUpY(thisArg.bounds.max.y),
  };
  const min = {
    x: thisArg.cartesianGraph.scaleUpX(thisArg.bounds.min.x),
    y: thisArg.cartesianGraph.scaleUpY(thisArg.bounds.min.y),
  };
  thisArg.operationManager.context.moveTo(max.x, max.y);
  thisArg.operationManager.context.lineTo(max.x, min.y);
  thisArg.operationManager.context.lineTo(min.x, min.y);
  thisArg.operationManager.context.lineTo(min.x, max.y);
  thisArg.operationManager.context.closePath();
  thisArg.operationManager.context.lineWidth = 1;
  thisArg.operationManager.context.stroke();
}

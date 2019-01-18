/* eslint-disable */

function S4() {
  return (((1 + Math.random()) * 0x10000) | 0)
    .toString(16)
    .substring(1);
}

class Helpers {
  constructor() {

  }

  generateRandomInteger(min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min))
  }

  generateRandomFloat(max) {
    return Math.random() * max;
  }

  generateGuid() {
    let guid = (S4() + S4() + "-" + S4() + "-4" + S4()
        .substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4())
      .toLowerCase();
    return guid;
  }

  generateRandomFloat() {
    return Math.random();
  }

  rotateToPoint(mx, my, px, py) {
    var self = this;
    var dist_Y = my - py;
    var dist_X = mx - px;

    // Arcotangente entre dos puntos y convierto a grados
    // multiplico por -1 ya que necesito que el sprite cambie de direccion
    // al opuesto del que se encuentra ahora
    //http://desktop.arcgis.com/es/arcmap/10.3/tools/spatial-analyst-toolbox/atan2.htm
    //https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/Objetos_globales/Math/atan2
    var angle = Math.atan2(dist_Y, dist_X);
    return ((angle * 180 / Math.PI) * -1);
  }

  CheckDistanceBetweenSprites(r1, r2) {

    let vx, vy;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
    let squareX, squareY;
    squareX = vx * vx;
    squareY = vy * vy;

    let returnData = {
      distance: Math.sqrt(squareX + squareY),
      angle: this.rotateToPoint(r1.x, r1.y, r2.x, r2.y)
    };

    return returnData;
  }

  Log(message) {
    console.dir(message);
  }
}

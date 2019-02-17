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
    var self = this; // TODO: que mierda es esto, revisar
    var dist_Y = my - py;
    var dist_X = mx - px;

    // obtener el angulo como parte de la conversion de coordenadas cartesianas a polares
    // basandome en los lados (distancia x / distancia y) del triangulo. 
    // multiplico por -1 ya que necesito que el sprite cambie de direccion hacia el punto 
    var angle = Math.atan2(dist_Y, dist_X);
    return ((angle * 180 / Math.PI) * -1);
  }

  getAngleBetweenSprites(r1, r2) {
    var dist_Y = r1.y - r2.y;
    var dist_X = r1.x - r2.x;

    // obtener el angulo como parte de la conversion de coordenadas cartesianas a polares
    // basandome en los lados (distancia x / distancia y) del triangulo. 
    var angle = Math.atan2(dist_Y, dist_X);
    return angle;
  }

  
  getDistanceBetweenSprites(r1,r2) {
    let vx, vy;

    //Find the center points of each sprite
    let center1X = r1.x + r1.width / 2;
    let center1Y = r1.y + r1.height / 2;
    let center2X = r2.x + r2.width / 2;
    let center2Y = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    //let halfWidth1 = r1.width / 2;
    //let halfHeight1 = r1.height / 2;
    //let halfWidth2 = r2.width / 2;
    //let halfHeight2 = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = center1X - center2X
    vy = center1Y - center2Y;
    let squareX, squareY;
    squareX = vx * vx;
    squareY = vy * vy;

    return Math.sqrt(squareX + squareY); //hipotenusa

  }

  //TODO : esta funcion esta fucker, ademas de devolver la distancia
  // entrega el angulo, pero con rotacion wtf!!.
  CheckDistanceBetweenSprites(r1, r2) {

    let vx, vy;

    //Find the center points of each sprite
    let center1X = r1.x + r1.width / 2;
    let center1Y = r1.y + r1.height / 2;
    let center2X = r2.x + r2.width / 2;
    let center2Y = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    //let halfWidth1 = r1.width / 2;
    //let halfHeight1 = r1.height / 2;
    //let halfWidth2 = r2.width / 2;
    //let halfHeight2 = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = center1X - center2X;
    vy = center1Y - center2Y;
    let squareX, squareY;
    squareX = vx * vx;
    squareY = vy * vy;

    //conversion de coordenadas cartesianas a polares 
    //(x,y) => (distancia, angulo)
    // distancia (r) = sqrt(x²+y²)
    // angulo (a) = atan( y / x)
    let returnData = {
      distance: Math.sqrt(squareX + squareY), //hipotenusa
      angle: this.rotateToPoint(r1.x, r1.y, r2.x, r2.y)
    };

    return returnData;
  }



  /**
   * 
   * @param {*} r1  sprite central
   * @param {*} r2  sprite que rota
   * @param {*} increment velocidad
   */
  /*
  rotateArroundSprite(r1, r2, increment) {

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

      let centerX = r1.centerX;
      let centerY = r1.centerY;

      //angle from center to target Sprite
      let angle = this.getAngleBetweenSprites(r1, r2);
      let distance = this.getDistanceBetweenSprites(r1,r2);

      //nuevas coordenadas del sprite que rota sobre el sprite centro
      let obj = {
        x : Math.cos(angle+increment),
        Y : Math.sin(angle+increment),
        angle : angle
      }
      return obj;
  }
  */

  /**
   * Construye la barra que se muestra sobre el sprite
   * @param {int} energy 
   */
  getEnergyBar(energy) {
    let x = energy / config.creature.maxEnergy;
    if (x == 0) { 
      return "d";
    }
    if (x > 0 && x <=0.25)
      return "*";
    
    if (x > 0.25 && x <= 0.5)
      return "**";

    if (x > 0.5 && x <= 0.75)
      return "***";

    if (x > 0.75 && x <= 1) {
      return "****";
    }
      
  }
}

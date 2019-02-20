class Bump {
  constructor(renderingEngine = PIXI) {
    if (renderingEngine === undefined) throw new Error(
      "Please assign a rendering engine in the constructor before using bump.js");

    this.renderer = "pixi";

  }

  //`addCollisionProperties` adds extra properties to sprites to help
  //simplify the collision code. It won't add these properties if they
  //already exist on the sprite. After these properties have been
  //added, this methods adds a Boolean property to the sprite called `_bumpPropertiesAdded` 
  //and sets it to `true` to flag that the sprite has these
  //new properties
  addCollisionProperties(sprite) {

    //Add properties to Pixi sprites
    if (this.renderer === "pixi") {

      //gx
      if (sprite.gx === undefined) {
        Object.defineProperty(sprite, "gx", {
          get() {
            return sprite.getGlobalPosition()
              .x
          },
          enumerable: true,
          configurable: true
        });
      }

      //gy
      if (sprite.gy === undefined) {
        Object.defineProperty(sprite, "gy", {
          get() {
            return sprite.getGlobalPosition()
              .y
          },
          enumerable: true,
          configurable: true
        });
      }

      //centerX
      if (sprite.centerX === undefined) {
        Object.defineProperty(sprite, "centerX", {
          get() { return sprite.x + sprite.width / 2 },
          enumerable: true,
          configurable: true
        });
      }

      //centerY
      if (sprite.centerY === undefined) {
        Object.defineProperty(sprite, "centerY", {
          get() { return sprite.y + sprite.height / 2 },
          enumerable: true,
          configurable: true
        });
      }

      //halfWidth
      if (sprite.halfWidth === undefined) {
        Object.defineProperty(sprite, "halfWidth", {
          get() { return sprite.width / 2 },
          enumerable: true,
          configurable: true
        });
      }

      //halfHeight
      if (sprite.halfHeight === undefined) {
        Object.defineProperty(sprite, "halfHeight", {
          get() { return sprite.height / 2 },
          enumerable: true,
          configurable: true
        });
      }

      //xAnchorOffset
      if (sprite.xAnchorOffset === undefined) {
        Object.defineProperty(sprite, "xAnchorOffset", {
          get() {
            if (sprite.anchor !== undefined) {
              return sprite.width * sprite.anchor.x;
            } else {
              return 0;
            }
          },
          enumerable: true,
          configurable: true
        });
      }

      //yAnchorOffset
      if (sprite.yAnchorOffset === undefined) {
        Object.defineProperty(sprite, "yAnchorOffset", {
          get() {
            if (sprite.anchor !== undefined) {
              return sprite.height * sprite.anchor.y;
            } else {
              return 0;
            }
          },
          enumerable: true,
          configurable: true
        });
      }

      if (sprite.circular && sprite.radius === undefined) {
        Object.defineProperty(sprite, "radius", {
          get() { return sprite.width / 2 },
          enumerable: true,
          configurable: true
        });
      }

      //Earlier code - not needed now.
      /*
      Object.defineProperties(sprite, {
        "gx": {
          get(){return sprite.getGlobalPosition().x},
          enumerable: true, configurable: true
        },
        "gy": {
          get(){return sprite.getGlobalPosition().y},
          enumerable: true, configurable: true
        },
        "centerX": {
          get(){return sprite.x + sprite.width / 2},
          enumerable: true, configurable: true
        },
        "centerY": {
          get(){return sprite.y + sprite.height / 2},
          enumerable: true, configurable: true
        },
        "halfWidth": {
          get(){return sprite.width / 2},
          enumerable: true, configurable: true
        },
        "halfHeight": {
          get(){return sprite.height / 2},
          enumerable: true, configurable: true
        },
        "xAnchorOffset": {
          get(){
            if (sprite.anchor !== undefined) {
              return sprite.height * sprite.anchor.x;
            } else {
              return 0;
            }
          },
          enumerable: true, configurable: true
        },
        "yAnchorOffset": {
          get(){
            if (sprite.anchor !== undefined) {
              return sprite.width * sprite.anchor.y;
            } else {
              return 0;
            }
          },
          enumerable: true, configurable: true
        }
      });
      */
    }

    //Add a Boolean `_bumpPropertiesAdded` property to the sprite to flag it
    //as having these new properties
    sprite._bumpPropertiesAdded = true;
  }

  /*
  hitTestPoint
  ------------

  Use it to find out if a point is touching a circlular or rectangular sprite.
  Parameters: 
  a. An object with `x` and `y` properties.
  b. A sprite object with `x`, `y`, `centerX` and `centerY` properties.
  If the sprite has a `radius` property, the function will interpret
  the shape as a circle.
  */

  hitTestPoint(point, sprite) {

    //Add collision properties
    if (!sprite._bumpPropertiesAdded) this.addCollisionProperties(sprite);

    let shape, left, right, top, bottom, vx, vy, magnitude, hit;

    //Find out if the sprite is rectangular or circular depending
    //on whether it has a `radius` property
    if (sprite.radius) {
      shape = "circle";
    } else {
      shape = "rectangle";
    }

    //Rectangle
    if (shape === "rectangle") {

      //Get the position of the sprite's edges
      left = sprite.x - sprite.xAnchorOffset;
      right = sprite.x + sprite.width - sprite.xAnchorOffset;
      top = sprite.y - sprite.yAnchorOffset;
      bottom = sprite.y + sprite.height - sprite.yAnchorOffset;

      //Find out if the point is intersecting the rectangle
      hit = point.x > left && point.x < right && point.y > top && point.y < bottom;
    }

    //Circle
    if (shape === "circle") {

      //Find the distance between the point and the
      //center of the circle
      let vx = point.x - sprite.x - (sprite.width / 2) + sprite.xAnchorOffset,
        vy = point.y - sprite.y - (sprite.height / 2) + sprite.yAnchorOffset,
        magnitude = Math.sqrt(vx * vx + vy * vy);

      //The point is intersecting the circle if the magnitude
      //(distance) is less than the circle's radius
      hit = magnitude < sprite.radius;
    }

    //`hit` will be either `true` or `false`
    return hit;
  }

  /*
  hitTestCircle
  -------------

  Use it to find out if two circular sprites are touching.
  Parameters: 
  a. A sprite object with `centerX`, `centerY` and `radius` properties.
  b. A sprite object with `centerX`, `centerY` and `radius`.
  */

  hitTestCircle(c1, c2, global = false) {

    //Add collision properties
    if (!c1._bumpPropertiesAdded) this.addCollisionProperties(c1);
    if (!c2._bumpPropertiesAdded) this.addCollisionProperties(c2);

    let vx, vy, magnitude, combinedRadii, hit;

    //Calculate the vector between the circles’ center points
    if (global) {
      //Use global coordinates
      vx = (c2.gx + (c2.width / 2) - c2.xAnchorOffset) - (c1.gx + (c1.width / 2) - c1.xAnchorOffset);
      vy = (c2.gy + (c2.width / 2) - c2.yAnchorOffset) - (c1.gy + (c1.width / 2) - c1.yAnchorOffset);
    } else {
      //Use local coordinates
      vx = (c2.x + (c2.width / 2) - c2.xAnchorOffset) - (c1.x + (c1.width / 2) - c1.xAnchorOffset);
      vy = (c2.y + (c2.width / 2) - c2.yAnchorOffset) - (c1.y + (c1.width / 2) - c1.yAnchorOffset);
    }

    //Find the distance between the circles by calculating
    //the vector's magnitude (how long the vector is)
    magnitude = Math.sqrt(vx * vx + vy * vy);

    //Add together the circles' total radii
    combinedRadii = c1.radius + c2.radius;

    //Set `hit` to `true` if the distance between the circles is
    //less than their `combinedRadii`
    hit = magnitude < combinedRadii;

    //`hit` will be either `true` or `false`
    return hit;
  }

  /*
  circleCollision
  ---------------

  Use it to prevent a moving circular sprite from overlapping and optionally
  bouncing off a non-moving circular sprite.
  Parameters: 
  a. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
  b. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
  c. Optional: true or false to indicate whether or not the first sprite
  should bounce off the second sprite.
  The sprites can contain an optional mass property that should be greater than 1.

  */

  circleCollision(c1, c2, bounce = false, global = false) {

    //Add collision properties
    if (!c1._bumpPropertiesAdded) this.addCollisionProperties(c1);
    if (!c2._bumpPropertiesAdded) this.addCollisionProperties(c2);

    let magnitude, combinedRadii, overlap,
      vx, vy, dx, dy, s = {},
      hit = false;

    //Calculate the vector between the circles’ center points

    if (global) {
      //Use global coordinates
      vx = (c2.gx + (c2.width / 2) - c2.xAnchorOffset) - (c1.gx + (c1.width / 2) - c1.xAnchorOffset);
      vy = (c2.gy + (c2.width / 2) - c2.yAnchorOffset) - (c1.gy + (c1.width / 2) - c1.yAnchorOffset);
    } else {
      //Use local coordinates
      vx = (c2.x + (c2.width / 2) - c2.xAnchorOffset) - (c1.x + (c1.width / 2) - c1.xAnchorOffset);
      vy = (c2.y + (c2.width / 2) - c2.yAnchorOffset) - (c1.y + (c1.width / 2) - c1.yAnchorOffset);
    }

    //Find the distance between the circles by calculating
    //the vector's magnitude (how long the vector is)
    magnitude = Math.sqrt(vx * vx + vy * vy);

    //Add together the circles' combined half-widths
    combinedRadii = c1.radius + c2.radius;

    //Figure out if there's a collision
    if (magnitude < combinedRadii) {

      //Yes, a collision is happening
      hit = true;

      //Find the amount of overlap between the circles
      overlap = combinedRadii - magnitude;

      //Add some "quantum padding". This adds a tiny amount of space
      //between the circles to reduce their surface tension and make
      //them more slippery. "0.3" is a good place to start but you might
      //need to modify this slightly depending on the exact behaviour
      //you want. Too little and the balls will feel sticky, too much
      //and they could start to jitter if they're jammed together
      let quantumPadding = 0.3;
      overlap += quantumPadding;

      //Normalize the vector
      //These numbers tell us the direction of the collision
      dx = vx / magnitude;
      dy = vy / magnitude;

      //Move circle 1 out of the collision by multiplying
      //the overlap with the normalized vector and subtract it from
      //circle 1's position
      c1.x -= overlap * dx;
      c1.y -= overlap * dy;

      //Bounce
      if (bounce) {
        //Create a collision vector object, `s` to represent the bounce "surface".
        //Find the bounce surface's x and y properties
        //(This represents the normal of the distance vector between the circles)
        s.x = vy;
        s.y = -vx;

        //Bounce c1 off the surface
        this.bounceOffSurface(c1, s);
      }
    }
    return hit;
  }

  /*
  movingCircleCollision
  ---------------------

  Use it to make two moving circles bounce off each other.
  Parameters: 
  a. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
  b. A sprite object with `x`, `y` `centerX`, `centerY` and `radius` properties.
  The sprites can contain an optional mass property that should be greater than 1.

  */

  movingCircleCollision(c1, c2, global = false) {

    //Add collision properties
    if (!c1._bumpPropertiesAdded) this.addCollisionProperties(c1);
    if (!c2._bumpPropertiesAdded) this.addCollisionProperties(c2);

    let combinedRadii, overlap, xSide, ySide,
      //`s` refers to the distance vector between the circles
      s = {},
      p1A = {},
      p1B = {},
      p2A = {},
      p2B = {},
      hit = false;

    //Apply mass, if the circles have mass properties
    c1.mass = c1.mass || 1;
    c2.mass = c2.mass || 1;

    //Calculate the vector between the circles’ center points
    if (global) {

      //Use global coordinates
      s.vx = (c2.gx + c2.radius - c2.xAnchorOffset) - (c1.gx + c1.radius - c1.xAnchorOffset);
      s.vy = (c2.gy + c2.radius - c2.yAnchorOffset) - (c1.gy + c1.radius - c1.yAnchorOffset);
    } else {

      //Use local coordinates
      s.vx = (c2.x + c2.radius - c2.xAnchorOffset) - (c1.x + c1.radius - c1.xAnchorOffset);
      s.vy = (c2.y + c2.radius - c2.yAnchorOffset) - (c1.y + c1.radius - c1.yAnchorOffset);
    }

    //Find the distance between the circles by calculating
    //the vector's magnitude (how long the vector is)
    s.magnitude = Math.sqrt(s.vx * s.vx + s.vy * s.vy);

    //Add together the circles' combined half-widths
    combinedRadii = c1.radius + c2.radius;

    //Figure out if there's a collision
    if (s.magnitude < combinedRadii) {

      //Yes, a collision is happening
      hit = true;

      //Find the amount of overlap between the circles
      overlap = combinedRadii - s.magnitude;

      //Add some "quantum padding" to the overlap
      overlap += 0.3;

      //Normalize the vector.
      //These numbers tell us the direction of the collision
      s.dx = s.vx / s.magnitude;
      s.dy = s.vy / s.magnitude;

      //Find the collision vector.
      //Divide it in half to share between the circles, and make it absolute
      s.vxHalf = Math.abs(s.dx * overlap / 2);
      s.vyHalf = Math.abs(s.dy * overlap / 2);

      //Find the side that the collision is occurring on
      (c1.x > c2.x) ? xSide = 1: xSide = -1;
      (c1.y > c2.y) ? ySide = 1: ySide = -1;

      //Move c1 out of the collision by multiplying
      //the overlap with the normalized vector and adding it to
      //the circles' positions
      c1.x = c1.x + (s.vxHalf * xSide);
      c1.y = c1.y + (s.vyHalf * ySide);

      //Move c2 out of the collision
      c2.x = c2.x + (s.vxHalf * -xSide);
      c2.y = c2.y + (s.vyHalf * -ySide);

      //1. Calculate the collision surface's properties

      //Find the surface vector's left normal
      s.lx = s.vy;
      s.ly = -s.vx;

      //2. Bounce c1 off the surface (s)

      //Find the dot product between c1 and the surface
      let dp1 = c1.vx * s.dx + c1.vy * s.dy;

      //Project c1's velocity onto the collision surface
      p1A.x = dp1 * s.dx;
      p1A.y = dp1 * s.dy;

      //Find the dot product of c1 and the surface's left normal (s.lx and s.ly)
      let dp2 = c1.vx * (s.lx / s.magnitude) + c1.vy * (s.ly / s.magnitude);

      //Project the c1's velocity onto the surface's left normal
      p1B.x = dp2 * (s.lx / s.magnitude);
      p1B.y = dp2 * (s.ly / s.magnitude);

      //3. Bounce c2 off the surface (s)

      //Find the dot product between c2 and the surface
      let dp3 = c2.vx * s.dx + c2.vy * s.dy;

      //Project c2's velocity onto the collision surface
      p2A.x = dp3 * s.dx;
      p2A.y = dp3 * s.dy;

      //Find the dot product of c2 and the surface's left normal (s.lx and s.ly)
      let dp4 = c2.vx * (s.lx / s.magnitude) + c2.vy * (s.ly / s.magnitude);

      //Project c2's velocity onto the surface's left normal
      p2B.x = dp4 * (s.lx / s.magnitude);
      p2B.y = dp4 * (s.ly / s.magnitude);

      //4. Calculate the bounce vectors

      //Bounce c1
      //using p1B and p2A
      c1.bounce = {};
      c1.bounce.x = p1B.x + p2A.x;
      c1.bounce.y = p1B.y + p2A.y;

      //Bounce c2
      //using p1A and p2B
      c2.bounce = {};
      c2.bounce.x = p1A.x + p2B.x;
      c2.bounce.y = p1A.y + p2B.y;

      //Add the bounce vector to the circles' velocity
      //and add mass if the circle has a mass property
      c1.vx = c1.bounce.x / c1.mass;
      c1.vy = c1.bounce.y / c1.mass;
      c2.vx = c2.bounce.x / c2.mass;
      c2.vy = c2.bounce.y / c2.mass;
    }
    return hit;
  }
  /*
  multipleCircleCollision
  -----------------------

  Checks all the circles in an array for a collision against
  all the other circles in an array, using `movingCircleCollision` (above)
  */

  multipleCircleCollision(arrayOfCircles, global = false) {
    for (let i = 0; i < arrayOfCircles.length; i++) {

      //The first circle to use in the collision check
      var c1 = arrayOfCircles[i];
      for (let j = i + 1; j < arrayOfCircles.length; j++) {

        //The second circle to use in the collision check
        let c2 = arrayOfCircles[j];

        //Check for a collision and bounce the circles apart if
        //they collide. Use an optional `mass` property on the sprite
        //to affect the bounciness of each marble
        this.movingCircleCollision(c1, c2, global);
      }
    }
  }

  /*
  rectangleCollision
  ------------------

  Use it to prevent two rectangular sprites from overlapping.
  Optionally, make the first rectangle bounce off the second rectangle.
  Parameters:
  a. A sprite object with `x`, `y` `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
  b. A sprite object with `x`, `y` `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
  c. Optional: true or false to indicate whether or not the first sprite
  should bounce off the second sprite.
  */

  rectangleCollision(
    r1, r2, bounce = false, global = true
  ) {

    //Add collision properties
    if (!r1._bumpPropertiesAdded) this.addCollisionProperties(r1);
    if (!r2._bumpPropertiesAdded) this.addCollisionProperties(r2);

    let collision, combinedHalfWidths, combinedHalfHeights,
      overlapX, overlapY, vx, vy;

    //Calculate the distance vector
    if (global) {
      vx = (r1.gx + Math.abs(r1.halfWidth) - r1.xAnchorOffset) - (r2.gx + Math.abs(r2.halfWidth) - r2.xAnchorOffset);
      vy = (r1.gy + Math.abs(r1.halfHeight) - r1.yAnchorOffset) - (r2.gy + Math.abs(r2.halfHeight) - r2.yAnchorOffset);
    } else {
      //vx = r1.centerX - r2.centerX;
      //vy = r1.centerY - r2.centerY;
      vx = (r1.x + Math.abs(r1.halfWidth) - r1.xAnchorOffset) - (r2.x + Math.abs(r2.halfWidth) - r2.xAnchorOffset);
      vy = (r1.y + Math.abs(r1.halfHeight) - r1.yAnchorOffset) - (r2.y + Math.abs(r2.halfHeight) - r2.yAnchorOffset);
    }

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = Math.abs(r1.halfWidth) + Math.abs(r2.halfWidth);
    combinedHalfHeights = Math.abs(r1.halfHeight) + Math.abs(r2.halfHeight);

    //Check whether vx is less than the combined half widths
    if (Math.abs(vx) < combinedHalfWidths) {

      //A collision might be occurring!
      //Check whether vy is less than the combined half heights
      if (Math.abs(vy) < combinedHalfHeights) {

        //A collision has occurred! This is good!
        //Find out the size of the overlap on both the X and Y axes
        overlapX = combinedHalfWidths - Math.abs(vx);
        overlapY = combinedHalfHeights - Math.abs(vy);

        //The collision has occurred on the axis with the
        //*smallest* amount of overlap. Let's figure out which
        //axis that is

        if (overlapX >= overlapY) {
          //The collision is happening on the X axis
          //But on which side? vy can tell us

          if (vy > 0) {
            collision = "top";
            //Move the rectangle out of the collision
            r1.y = r1.y + overlapY;
          } else {
            collision = "bottom";
            //Move the rectangle out of the collision
            r1.y = r1.y - overlapY;
          }

          //Bounce
          if (bounce) {
            r1.vy *= -1;

            /*Alternative
            //Find the bounce surface's vx and vy properties
            var s = {};
            s.vx = r2.x - r2.x + r2.width;
            s.vy = 0;

            //Bounce r1 off the surface
            //this.bounceOffSurface(r1, s);
            */

          }
        } else {
          //The collision is happening on the Y axis
          //But on which side? vx can tell us

          if (vx > 0) {
            collision = "left";
            //Move the rectangle out of the collision
            r1.x = r1.x + overlapX;
          } else {
            collision = "right";
            //Move the rectangle out of the collision
            r1.x = r1.x - overlapX;
          }

          //Bounce
          if (bounce) {
            r1.vx *= -1;

            /*Alternative
            //Find the bounce surface's vx and vy properties
            var s = {};
            s.vx = 0;
            s.vy = r2.y - r2.y + r2.height;

            //Bounce r1 off the surface
            this.bounceOffSurface(r1, s);
            */

          }
        }
      } else {
        //No collision
      }
    } else {
      //No collision
    }

    //Return the collision string. it will be either "top", "right",
    //"bottom", or "left" depending on which side of r1 is touching r2.
    return collision;
  }

  /*
  hitTestRectangle
  ----------------

  Use it to find out if two rectangular sprites are touching.
  Parameters: 
  a. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
  b. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.

  */

  hitTestRectangle(r1, r2, global = false) {

    //Add collision properties
    if (!r1._bumpPropertiesAdded) this.addCollisionProperties(r1);
    if (!r2._bumpPropertiesAdded) this.addCollisionProperties(r2);

    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //A variable to determine whether there's a collision
    hit = false;

    //Calculate the distance vector
    if (global) {
      vx = (r1.gx + Math.abs(r1.halfWidth) - r1.xAnchorOffset) - (r2.gx + Math.abs(r2.halfWidth) - r2.xAnchorOffset);
      vy = (r1.gy + Math.abs(r1.halfHeight) - r1.yAnchorOffset) - (r2.gy + Math.abs(r2.halfHeight) - r2.yAnchorOffset);
    } else {
      vx = (r1.x + Math.abs(r1.halfWidth) - r1.xAnchorOffset) - (r2.x + Math.abs(r2.halfWidth) - r2.xAnchorOffset);
      vy = (r1.y + Math.abs(r1.halfHeight) - r1.yAnchorOffset) - (r2.y + Math.abs(r2.halfHeight) - r2.yAnchorOffset);
    }

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = Math.abs(r1.halfWidth) + Math.abs(r2.halfWidth);
    combinedHalfHeights = Math.abs(r1.halfHeight) + Math.abs(r2.halfHeight);

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {

      //A collision might be occuring. Check for a collision on the y axis
      if (Math.abs(vy) < combinedHalfHeights) {

        //There's definitely a collision happening
        hit = true;
      } else {

        //There's no collision on the y axis
        hit = false;
      }
    } else {

      //There's no collision on the x axis
      hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
  }

  /*
  hitTestCircleRectangle
  ----------------

  Use it to find out if a circular shape is touching a rectangular shape
  Parameters: 
  a. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
  b. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.

  */

  hitTestCircleRectangle(c1, r1, global = false) {

    //Add collision properties
    if (!r1._bumpPropertiesAdded) this.addCollisionProperties(r1);
    if (!c1._bumpPropertiesAdded) this.addCollisionProperties(c1);

    let region, collision, c1x, c1y, r1x, r1y;

    //Use either global or local coordinates
    if (global) {
      c1x = c1.gx;
      c1y = c1.gy
      r1x = r1.gx;
      r1y = r1.gy;
    } else {
      c1x = c1.x;
      c1y = c1.y;
      r1x = r1.x;
      r1y = r1.y;
    }

    //Is the circle above the rectangle's top edge?
    if (c1y - c1.yAnchorOffset < r1y - Math.abs(r1.halfHeight) - r1.yAnchorOffset) {

      //If it is, we need to check whether it's in the
      //top left, top center or top right
      if (c1x - c1.xAnchorOffset < r1x - 1 - Math.abs(r1.halfWidth) - r1.xAnchorOffset) {
        region = "topLeft";
      } else if (c1x - c1.xAnchorOffset > r1x + 1 + Math.abs(r1.halfWidth) - r1.xAnchorOffset) {
        region = "topRight";
      } else {
        region = "topMiddle";
      }
    }

    //The circle isn't above the top edge, so it might be
    //below the bottom edge
    else if (c1y - c1.yAnchorOffset > r1y + Math.abs(r1.halfHeight) - r1.yAnchorOffset) {

      //If it is, we need to check whether it's in the bottom left,
      //bottom center, or bottom right
      if (c1x - c1.xAnchorOffset < r1x - 1 - Math.abs(r1.halfWidth) - r1.xAnchorOffset) {
        region = "bottomLeft";
      } else if (c1x - c1.xAnchorOffset > r1x + 1 + Math.abs(r1.halfWidth) - r1.xAnchorOffset) {
        region = "bottomRight";
      } else {
        region = "bottomMiddle";
      }
    }

    //The circle isn't above the top edge or below the bottom edge,
    //so it must be on the left or right side
    else {
      if (c1x - c1.xAnchorOffset < r1x - Math.abs(r1.halfWidth) - r1.xAnchorOffset) {
        region = "leftMiddle";
      } else {
        region = "rightMiddle";
      }
    }

    //Is this the circle touching the flat sides
    //of the rectangle?
    if (region === "topMiddle" || region === "bottomMiddle" || region === "leftMiddle" || region === "rightMiddle") {

      //Yes, it is, so do a standard rectangle vs. rectangle collision test
      collision = this.hitTestRectangle(c1, r1, global);
    }

    //The circle is touching one of the corners, so do a
    //circle vs. point collision test
    else {
      let point = {};

      switch (region) {
        case "topLeft":
          point.x = r1x - r1.xAnchorOffset;
          point.y = r1y - r1.yAnchorOffset;
          break;

        case "topRight":
          point.x = r1x + r1.width - r1.xAnchorOffset;
          point.y = r1y - r1.yAnchorOffset;
          break;

        case "bottomLeft":
          point.x = r1x - r1.xAnchorOffset;
          point.y = r1y + r1.height - r1.yAnchorOffset;
          break;

        case "bottomRight":
          point.x = r1x + r1.width - r1.xAnchorOffset;
          point.y = r1y + r1.height - r1.yAnchorOffset;
      }

      //Check for a collision between the circle and the point
      collision = this.hitTestCirclePoint(c1, point, global);
    }

    //Return the result of the collision.
    //The return value will be `undefined` if there's no collision
    if (collision) {
      return region;
    } else {
      return collision;
    }
  }

  /*
  hitTestCirclePoint
  ------------------

  Use it to find out if a circular shape is touching a point
  Parameters: 
  a. A sprite object with `centerX`, `centerY`, and `radius` properties.
  b. A point object with `x` and `y` properties.

  */

  hitTestCirclePoint(c1, point, global = false) {

    //Add collision properties
    if (!c1._bumpPropertiesAdded) this.addCollisionProperties(c1);

    //A point is just a circle with a diameter of
    //1 pixel, so we can cheat. All we need to do is an ordinary circle vs. circle
    //Collision test. Just supply the point with the properties
    //it needs
    point.diameter = 1;
    point.width = point.diameter;
    point.radius = 0.5;
    point.centerX = point.x;
    point.centerY = point.y;
    point.gx = point.x;
    point.gy = point.y;
    point.xAnchorOffset = 0;
    point.yAnchorOffset = 0;
    point._bumpPropertiesAdded = true;
    return this.hitTestCircle(c1, point, global);
  }

  /*
  circleRectangleCollision
  ------------------------

  Use it to bounce a circular shape off a rectangular shape
  Parameters: 
  a. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.
  b. A sprite object with `centerX`, `centerY`, `halfWidth` and `halfHeight` properties.

  */

  circleRectangleCollision(
    c1, r1, bounce = false, global = false
  ) {

    //Add collision properties
    if (!r1._bumpPropertiesAdded) this.addCollisionProperties(r1);
    if (!c1._bumpPropertiesAdded) this.addCollisionProperties(c1);

    let region, collision, c1x, c1y, r1x, r1y;

    //Use either the global or local coordinates
    if (global) {
      c1x = c1.gx;
      c1y = c1.gy;
      r1x = r1.gx;
      r1y = r1.gy;
    } else {
      c1x = c1.x;
      c1y = c1.y;
      r1x = r1.x;
      r1y = r1.y;
    }

    //Is the circle above the rectangle's top edge?
    if (c1y - c1.yAnchorOffset < r1y - Math.abs(r1.halfHeight) - r1.yAnchorOffset) {

      //If it is, we need to check whether it's in the
      //top left, top center or top right
      if (c1x - c1.xAnchorOffset < r1x - 1 - Math.abs(r1.halfWidth) - r1.xAnchorOffset) {
        region = "topLeft";
      } else if (c1x - c1.xAnchorOffset > r1x + 1 + Math.abs(r1.halfWidth) - r1.xAnchorOffset) {
        region = "topRight";
      } else {
        region = "topMiddle";
      }
    }

    //The circle isn't above the top edge, so it might be
    //below the bottom edge
    else if (c1y - c1.yAnchorOffset > r1y + Math.abs(r1.halfHeight) - r1.yAnchorOffset) {

      //If it is, we need to check whether it's in the bottom left,
      //bottom center, or bottom right
      if (c1x - c1.xAnchorOffset < r1x - 1 - Math.abs(r1.halfWidth) - r1.xAnchorOffset) {
        region = "bottomLeft";
      } else if (c1x - c1.xAnchorOffset > r1x + 1 + Math.abs(r1.halfWidth) - r1.xAnchorOffset) {
        region = "bottomRight";
      } else {
        region = "bottomMiddle";
      }
    }

    //The circle isn't above the top edge or below the bottom edge,
    //so it must be on the left or right side
    else {
      if (c1x - c1.xAnchorOffset < r1x - Math.abs(r1.halfWidth) - r1.xAnchorOffset) {
        region = "leftMiddle";
      } else {
        region = "rightMiddle";
      }
    }

    //Is this the circle touching the flat sides
    //of the rectangle?
    if (region === "topMiddle" || region === "bottomMiddle" || region === "leftMiddle" || region === "rightMiddle") {

      //Yes, it is, so do a standard rectangle vs. rectangle collision test
      collision = this.rectangleCollision(c1, r1, bounce, global);
    }

    //The circle is touching one of the corners, so do a
    //circle vs. point collision test
    else {
      let point = {};

      switch (region) {
        case "topLeft":
          point.x = r1x - r1.xAnchorOffset;
          point.y = r1y - r1.yAnchorOffset;
          break;

        case "topRight":
          point.x = r1x + r1.width - r1.xAnchorOffset;
          point.y = r1y - r1.yAnchorOffset;
          break;

        case "bottomLeft":
          point.x = r1x - r1.xAnchorOffset;
          point.y = r1y + r1.height - r1.yAnchorOffset;
          break;

        case "bottomRight":
          point.x = r1x + r1.width - r1.xAnchorOffset;
          point.y = r1y + r1.height - r1.yAnchorOffset;
      }

      //Check for a collision between the circle and the point
      collision = this.circlePointCollision(c1, point, bounce, global);
    }

    if (collision) {
      return region;
    } else {
      return collision;
    }
  }

  /*
  circlePointCollision
  --------------------

  Use it to boucnce a circle off a point.
  Parameters: 
  a. A sprite object with `centerX`, `centerY`, and `radius` properties.
  b. A point object with `x` and `y` properties.

  */

  circlePointCollision(c1, point, bounce = false, global = false) {

    //Add collision properties
    if (!c1._bumpPropertiesAdded) this.addCollisionProperties(c1);

    //A point is just a circle with a diameter of
    //1 pixel, so we can cheat. All we need to do is an ordinary circle vs. circle
    //Collision test. Just supply the point with the properties
    //it needs
    point.diameter = 1;
    point.width = point.diameter;
    point.radius = 0.5;
    point.centerX = point.x;
    point.centerY = point.y;
    point.gx = point.x;
    point.gy = point.y;
    point.xAnchorOffset = 0;
    point.yAnchorOffset = 0;
    point._bumpPropertiesAdded = true;
    return this.circleCollision(c1, point, bounce, global);
  }

  /*
  bounceOffSurface
  ----------------

  Use this to bounce an object off another object.
  Parameters: 
  a. An object with `v.x` and `v.y` properties. This represents the object that is colliding
  with a surface.
  b. An object with `x` and `y` properties. This represents the surface that the object
  is colliding into.
  The first object can optionally have a mass property that's greater than 1. The mass will
  be used to dampen the bounce effect.
  */

  bounceOffSurface(o, s) {

    //Add collision properties
    if (!o._bumpPropertiesAdded) this.addCollisionProperties(o);

    let dp1, dp2,
      p1 = {},
      p2 = {},
      bounce = {},
      mass = o.mass || 1;

    //1. Calculate the collision surface's properties
    //Find the surface vector's left normal
    s.lx = s.y;
    s.ly = -s.x;

    //Find its magnitude
    s.magnitude = Math.sqrt(s.x * s.x + s.y * s.y);

    //Find its normalized values
    s.dx = s.x / s.magnitude;
    s.dy = s.y / s.magnitude;

    //2. Bounce the object (o) off the surface (s)

    //Find the dot product between the object and the surface
    dp1 = o.vx * s.dx + o.vy * s.dy;

    //Project the object's velocity onto the collision surface
    p1.vx = dp1 * s.dx;
    p1.vy = dp1 * s.dy;

    //Find the dot product of the object and the surface's left normal (s.lx and s.ly)
    dp2 = o.vx * (s.lx / s.magnitude) + o.vy * (s.ly / s.magnitude);

    //Project the object's velocity onto the surface's left normal
    p2.vx = dp2 * (s.lx / s.magnitude);
    p2.vy = dp2 * (s.ly / s.magnitude);

    //Reverse the projection on the surface's left normal
    p2.vx *= -1;
    p2.vy *= -1;

    //Add up the projections to create a new bounce vector
    bounce.x = p1.vx + p2.vx;
    bounce.y = p1.vy + p2.vy;

    //Assign the bounce vector to the object's velocity
    //with optional mass to dampen the effect
    o.vx = bounce.x / mass;
    o.vy = bounce.y / mass;
  }

  /*
  contain
  -------
  `contain` can be used to contain a sprite with `x` and
  `y` properties inside a rectangular area.

  The `contain` function takes four arguments: a sprite with `x` and `y`
  properties, an object literal with `x`, `y`, `width` and `height` properties. The 
  third argument is a Boolean (true/false) value that determines if the sprite
  should bounce when it hits the edge of the container. The fourth argument
  is an extra user-defined callback function that you can call when the
  sprite hits the container
  ```js
  contain(anySprite, {x: 0, y: 0, width: 512, height: 512}, true, callbackFunction);
  ```
  The code above will contain the sprite's position inside the 512 by
  512 pixel area defined by the object. If the sprite hits the edges of
  the container, it will bounce. The `callBackFunction` will run if 
  there's a collision.

  An additional feature of the `contain` method is that if the sprite
  has a `mass` property, it will be used to dampen the sprite's bounce
  in a natural looking way.

  If the sprite bumps into any of the containing object's boundaries,
  the `contain` function will return a value that tells you which side
  the sprite bumped into: “left”, “top”, “right” or “bottom”. Here's how
  you could keep the sprite contained and also find out which boundary
  it hit:
  ```js
  //Contain the sprite and find the collision value
  let collision = contain(anySprite, {x: 0, y: 0, width: 512, height: 512});

  //If there's a collision, display the boundary that the collision happened on
  if(collision) {
    if collision.has("left") console.log("The sprite hit the left");  
    if collision.has("top") console.log("The sprite hit the top");  
    if collision.has("right") console.log("The sprite hit the right");  
    if collision.has("bottom") console.log("The sprite hit the bottom");  
  }
  ```
  If the sprite doesn't hit a boundary, the value of
  `collision` will be `undefined`. 
  */

  /*
   contain(sprite, container, bounce = false, extra = undefined) {

     //Helper methods that compensate for any possible shift the the
     //sprites' anchor points
     let nudgeAnchor = (o, value, axis) => {
       if (o.anchor !== undefined) {
         if (o.anchor[axis] !== 0) {
           return value * ((1 - o.anchor[axis]) - o.anchor[axis]);
         } else {
           return value;
         }
       } else {
         return value; 
       }
     };

     let compensateForAnchor = (o, value, axis) => {
       if (o.anchor !== undefined) {
         if (o.anchor[axis] !== 0) {
           return value * o.anchor[axis];
         } else {
           return 0;
         }
       } else {
         return 0; 
       }
     };

     let compensateForAnchors = (a, b, property1, property2) => {
        return compensateForAnchor(a, a[property1], property2) + compensateForAnchor(b, b[property1], property2)
     };    
     //Create a set called `collision` to keep track of the
     //boundaries with which the sprite is colliding
     let collision = new Set();

     //Left
     if (sprite.x - compensateForAnchor(sprite, sprite.width, "x") < container.x - sprite.parent.gx - compensateForAnchor(container, container.width, "x")) {
       //Bounce the sprite if `bounce` is true
       if (bounce) sprite.vx *= -1;

       //If the sprite has `mass`, let the mass
       //affect the sprite's velocity
       if(sprite.mass) sprite.vx /= sprite.mass;

       //Keep the sprite inside the container
       sprite.x = container.x - sprite.parent.gx + compensateForAnchor(sprite, sprite.width, "x") - compensateForAnchor(container, container.width, "x");

       //Add "left" to the collision set
       collision.add("left");
     }

     //Top
     if (sprite.y - compensateForAnchor(sprite, sprite.height, "y") < container.y - sprite.parent.gy - compensateForAnchor(container, container.height, "y")) {
       if (bounce) sprite.vy *= -1;
       if(sprite.mass) sprite.vy /= sprite.mass;
       sprite.y = container.x - sprite.parent.gy + compensateForAnchor(sprite, sprite.height, "y") - compensateForAnchor(container, container.height, "y");
       collision.add("top");
     }

     //Right
     if (sprite.x - compensateForAnchor(sprite, sprite.width, "x") + sprite.width > container.width - compensateForAnchor(container, container.width, "x")) {
       if (bounce) sprite.vx *= -1;
       if(sprite.mass) sprite.vx /= sprite.mass;
       sprite.x = container.width - sprite.width + compensateForAnchor(sprite, sprite.width, "x") - compensateForAnchor(container, container.width, "x");
       collision.add("right");
     }

     //Bottom
     if (sprite.y - compensateForAnchor(sprite, sprite.height, "y") + sprite.height > container.height - compensateForAnchor(container, container.height, "y")) {
       if (bounce) sprite.vy *= -1;
       if(sprite.mass) sprite.vy /= sprite.mass;
       sprite.y = container.height - sprite.height + compensateForAnchor(sprite, sprite.height, "y") - compensateForAnchor(container, container.height, "y");
       collision.add("bottom");
     }

     //If there were no collisions, set `collision` to `undefined`
     if (collision.size === 0) collision = undefined;

     //The `extra` function runs if there was a collision
     //and `extra` has been defined
     if (collision && extra) extra(collision);

     //Return the `collision` value
     return collision;
   }
   */
  contain(sprite, container, bounce = false, extra = undefined) {

    //Add collision properties
    if (!sprite._bumpPropertiesAdded) this.addCollisionProperties(sprite);

    //Give the container x and y anchor offset values, if it doesn't
    //have any
    if (container.xAnchorOffset === undefined) container.xAnchorOffset = 0;
    if (container.yAnchorOffset === undefined) container.yAnchorOffset = 0;
    if (sprite.parent.gx === undefined) sprite.parent.gx = 0;
    if (sprite.parent.gy === undefined) sprite.parent.gy = 0;

    //Create a Set called `collision` to keep track of the
    //boundaries with which the sprite is colliding
    let collision = new Set();

    //Left
    if (sprite.x - sprite.xAnchorOffset < container.x - sprite.parent.gx - container.xAnchorOffset) {

      //Bounce the sprite if `bounce` is true
      if (bounce) sprite.vx *= -1;

      //If the sprite has `mass`, let the mass
      //affect the sprite's velocity
      if (sprite.mass) sprite.vx /= sprite.mass;

      //Reposition the sprite inside the container
      sprite.x = container.x - sprite.parent.gx - container.xAnchorOffset + sprite.xAnchorOffset;

      //Make a record of the side which the container hit
      collision.add("left");
    }

    //Top
    if (sprite.y - sprite.yAnchorOffset < container.y - sprite.parent.gy - container.yAnchorOffset) {
      if (bounce) sprite.vy *= -1;
      if (sprite.mass) sprite.vy /= sprite.mass;
      sprite.y = container.y - sprite.parent.gy - container.yAnchorOffset + sprite.yAnchorOffset;;
      collision.add("top");
    }

    //Right
    if (sprite.x - sprite.xAnchorOffset + sprite.width > container.width - container.xAnchorOffset) {
      if (bounce) sprite.vx *= -1;
      if (sprite.mass) sprite.vx /= sprite.mass;
      sprite.x = container.width - sprite.width - container.xAnchorOffset + sprite.xAnchorOffset;
      collision.add("right");
    }

    //Bottom
    if (sprite.y - sprite.yAnchorOffset + sprite.height > container.height - container.yAnchorOffset) {
      if (bounce) sprite.vy *= -1;
      if (sprite.mass) sprite.vy /= sprite.mass;
      sprite.y = container.height - sprite.height - container.yAnchorOffset + sprite.yAnchorOffset;
      collision.add("bottom");
    }

    //If there were no collisions, set `collision` to `undefined`
    if (collision.size === 0) collision = undefined;

    //The `extra` function runs if there was a collision
    //and `extra` has been defined
    if (collision && extra) extra(collision);

    //Return the `collision` value
    return collision;
  }

  //`outsideBounds` checks whether a sprite is outide the boundary of
  //another object. It returns an object called `collision`. `collision` will be `undefined` if there's no
  //collision. But if there is a collision, `collision` will be
  //returned as a Set containg strings that tell you which boundary
  //side was crossed: "left", "right", "top" or "bottom" 
  outsideBounds(s, bounds, extra) {

    let x = bounds.x,
      y = bounds.y,
      width = bounds.width,
      height = bounds.height;

    //The `collision` object is used to store which
    //side of the containing rectangle the sprite hits
    let collision = new Set();

    //Left
    if (s.x < x - s.width) {
      collision.add("left");
    }
    //Top
    if (s.y < y - s.height) {
      collision.add("top");
    }
    //Right
    if (s.x > width + s.width) {
      collision.add("right");
    }
    //Bottom
    if (s.y > height + s.height) {
      collision.add("bottom");
    }

    //If there were no collisions, set `collision` to `undefined`
    if (collision.size === 0) collision = undefined;

    //The `extra` function runs if there was a collision
    //and `extra` has been defined
    if (collision && extra) extra(collision);

    //Return the `collision` object
    return collision;
  }

  /*
  _getCenter
  ----------

  A utility that finds the center point of the sprite. If it's anchor point is the
  sprite's top left corner, then the center is calculated from that point.
  If the anchor point has been shifted, then the anchor x/y point is used as the sprite's center
  */

  _getCenter(o, dimension, axis) {
    if (o.anchor !== undefined) {
      if (o.anchor[axis] !== 0) {
        return 0;
      } else {
        //console.log(o.anchor[axis])
        return dimension / 2;
      }
    } else {
      return dimension;
    }
  }

  /*
  hit
  ---
  A convenient universal collision function to test for collisions
  between rectangles, circles, and points.
  */

  hit(a, b, react = false, bounce = false, global, extra = undefined) {

    //Local references to bump's collision methods
    let hitTestPoint = this.hitTestPoint.bind(this),
      hitTestRectangle = this.hitTestRectangle.bind(this),
      hitTestCircle = this.hitTestCircle.bind(this),
      movingCircleCollision = this.movingCircleCollision.bind(this),
      circleCollision = this.circleCollision.bind(this),
      hitTestCircleRectangle = this.hitTestCircleRectangle.bind(this),
      rectangleCollision = this.rectangleCollision.bind(this),
      circleRectangleCollision = this.circleRectangleCollision.bind(this);

    let collision,
      aIsASprite = a.parent !== undefined,
      bIsASprite = b.parent !== undefined;

    //Check to make sure one of the arguments isn't an array
    if (aIsASprite && b instanceof Array || bIsASprite && a instanceof Array) {
      //If it is, check for a collision between a sprite and an array
      spriteVsArray();
    } else {
      //If one of the arguments isn't an array, find out what type of
      //collision check to run
      collision = findCollisionType(a, b);
      if (collision && extra) extra(collision);
    }

    //Return the result of the collision.
    //It will be `undefined` if there's no collision and `true` if 
    //there is a collision. `rectangleCollision` sets `collsision` to
    //"top", "bottom", "left" or "right" depeneding on which side the
    //collision is occuring on
    return collision;

    function findCollisionType(a, b) {
      //Are `a` and `b` both sprites?
      //(We have to check again if this function was called from
      //`spriteVsArray`)
      let aIsASprite = a.parent !== undefined;
      let bIsASprite = b.parent !== undefined;

      if (aIsASprite && bIsASprite) {
        //Yes, but what kind of sprites?
        if (a.diameter && b.diameter) {
          //They're circles
          return circleVsCircle(a, b);
        } else if (a.diameter && !b.diameter) {
          //The first one is a circle and the second is a rectangle
          return circleVsRectangle(a, b);
        } else {
          //They're rectangles
          return rectangleVsRectangle(a, b);
        }
      }
      //They're not both sprites, so what are they?
      //Is `a` not a sprite and does it have x and y properties?
      else if (bIsASprite && !(a.x === undefined) && !(a.y === undefined)) {
        //Yes, so this is a point vs. sprite collision test
        return hitTestPoint(a, b);
      } else {
        //The user is trying to test some incompatible objects
        throw new Error(`I'm sorry, ${a} and ${b} cannot be use together in a collision test.'`);
      }
    }

    function spriteVsArray() {
      //If `a` happens to be the array, flip it around so that it becomes `b`
      if (a instanceof Array) {
        let [a, b] = [b, a];
      }
      //Loop through the array in reverse
      for (let i = b.length - 1; i >= 0; i--) {
        let sprite = b[i];
        collision = findCollisionType(a, sprite);
        if (collision && extra) extra(collision, sprite);
      }
    }

    function circleVsCircle(a, b) {
      //If the circles shouldn't react to the collision,
      //just test to see if they're touching
      if (!react) {
        return hitTestCircle(a, b);
      }
      //Yes, the circles should react to the collision
      else {
        //Are they both moving?
        if (a.vx + a.vy !== 0 && b.vx + b.vy !== 0) {
          //Yes, they are both moving
          //(moving circle collisions always bounce apart so there's
          //no need for the third, `bounce`, argument)
          return movingCircleCollision(a, b, global);
        } else {
          //No, they're not both moving
          return circleCollision(a, b, bounce, global);
        }
      }
    }

    function rectangleVsRectangle(a, b) {
      //If the rectangles shouldn't react to the collision, just
      //test to see if they're touching
      if (!react) {
        return hitTestRectangle(a, b, global);
      } else {
        return rectangleCollision(a, b, bounce, global);
      }
    }

    function circleVsRectangle(a, b) {
      //If the rectangles shouldn't react to the collision, just
      //test to see if they're touching
      if (!react) {
        return hitTestCircleRectangle(a, b, global);
      } else {
        return circleRectangleCollision(a, b, bounce, global);
      }
    }
  }
}

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

  getDistanceBetweenSprites(r1, r2) {
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
    if (x > 0 && x <= 0.25)
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

class CreatureHud {
  constructor(app) {

  }
}

class DeviceRotation {
  constructor(app) {

    this.rotateText = new PIXI.Text('Please rotate your device', {
      align: 'center',
      fill: 'rgba(255, 255, 255, .9)',
      fontSize: 30,
      fontWeight: 100,
      fontFamily: 'FuturaICG, Roboto, Tahoma, Geneva, sans-serif',
      letterSpacing: 5
    });

    this.rotateScreen = new PIXI.Sprite(PIXI.loader.resources["img/icons/rotate-screen-48.png"].texture);
    this.rotateScreen.anchor.set(0.5); //center texture to sprite
    this.rotateScreen.scale.set(1);
    //this.rotateScreen.tint = Constants.colors.BLUE;

    this.setPosition(app.screen.width, app.screen.height);

    app.stage.addChild(this.rotateText);
    app.stage.addChild(this.rotateScreen);

  }

  setPosition(width, height) {
    this.rotateText.x = width / 2 - this.rotateText.width / 2;
    this.rotateText.y = height / 2 + 100;

    this.rotateScreen.x = width / 2;
    this.rotateScreen.y = height / 2;
  }

  showScene() {
    this.rotateText.alpha = 0.9;
    this.rotateScreen.alpha = 0.9;
  }

  hideScene() {
    this.rotateText.alpha = 0;
    this.rotateScreen.alpha = 0;
  }

  removeScene(app) {
    app.stage.removeChild(this.rotateText);
    app.stage.removeChild(this.rotateScreen);
  }
}

class InGameInformation {

  constructor(app) {

    //UI Information
    this.uiTextInfo = new PIXI.Text("TEST", {
      fontWeight: 'bold',
      //fontStyle: 'italic',
      fontSize: 17,
      //fontFamily: 'Arvo',
      fill: '#FFFFFF',
      align: 'center',
      //stroke: '#a4410e',
      strokeThickness: 2
    });

    //this.uiTextInfo.x = app.screen.width / 2;
    //this.uiTextInfo.y = app.screen.height - 30;
    this.setPosition(app.screen.width, app.screen.height);
    this.uiTextInfo.anchor.x = 0.5;
    this.hideScene();

    this.containers = {
      uiTextInfo: this.uiTextInfo
    }

    app.stage.addChild(this.uiTextInfo);

  }

  showScene() {
    /*
    for (var key in this.containers) {
      if (this.containers.hasOwnProperty(key)) {
        this.containers[key].visible = true;
      }
    }
    */
    this.uiTextInfo.visible = true;
  }

  hideScene() {
    /*
    for (var key in this.containers) {
      if (this.containers.hasOwnProperty(key)) {
        this.containers[key].visible = false;
      }
    }
    */

    this.uiTextInfo.visible = false;
  }

  updateUi(sprites, predators, food, iteration, generationNumber, generationStats, fps) {
    this.uiTextInfo.text = "Generation N° : " + generationNumber + " - Iteration N° : " + iteration +
      " - Best Generation Fitness : " + generationStats.BestFitness + " - [ #Food : " + food + " - #Survivors : " +
      sprites + " - #Predators: " + predators + " ] - FPS : " + Math.round(fps);
  }

  setPosition(width, height) {

    this.uiTextInfo.x = width / 2;
    this.uiTextInfo.y = height - 30;

  }
}

class Splash {
  constructor(app) {

    this.splashText = new PIXI.Text('WILL', {
      align: 'center',
      fill: 'rgba(255, 255, 255, .9)',
      fontSize: 30,
      fontWeight: 100,
      fontFamily: 'FuturaICG, Roboto, Tahoma, Geneva, sans-serif',
      letterSpacing: 100
    });

    this.startText = new PIXI.Text('- start - ', {
      align: 'center',
      fill: 'rgba(255, 255, 255, .9)',
      fontSize: 20,
      fontWeight: 100,
      fontFamily: 'FuturaICG, Roboto, Tahoma, Geneva, sans-serif',
      letterSpacing: 5
    });

    this.setPosition(app.screen.width, app.screen.height);

    app.stage.addChild(this.splashText);
    app.stage.addChild(this.startText);

    this.startText.interactive = true;
  }

  setPosition(width, height) {
    this.splashText.x = width / 2 - this.splashText.width / 2;
    this.splashText.y = height / 2;

    this.startText.x = width / 2 - this.startText.width / 2;
    this.startText.y = height / 2 + 100;

  }

  showScene() {
    this.splashText.alpha = 0.9;
    this.startText.alpha = 0.9;
  }

  hideScene() {
    this.splashText.alpha = 0;
    this.startText.alpha = 0;
  }

  removeScene(app) {
    app.stage.removeChild(this.splashText);
    app.stage.removeChild(this.startText);
  }
}

class UiControls {

  constructor(app) {

    this.buttonAddCreature = new PIXI.Sprite(PIXI.loader.resources[
      "img/icons/baseline_add_circle_outline_white_48dp.png"].texture);
    this.buttonAddCreature.anchor.set(0.5); //center texture to sprite
    this.buttonAddCreature.scale.set(1);
    this.setPosition(app.screen.width, app.screen.height);
    this.buttonAddCreature.alpha = 0.4;
    app.stage.addChild(this.buttonAddCreature);
  }

  setPosition(width, height) {
    this.buttonAddCreature.x = width - this.buttonAddCreature.width / 2 - 100;
    this.buttonAddCreature.y = height - 100;

  }

  showScene() {
    this.buttonAddCreature.alpha = 0.3;
  }

  hideScene() {
    this.buttonAddCreature.alpha = 0;
  }
}

class World {
  constructor(app, b) {

    // global : create an array to store all the sprites and information
    this.survivorsInfo = [];
    this.childInfo = [];
    this.predatorsInfo = [];
    this.foodInfo = [];
    this.targetMateLineInfo = [];
    this.debugInfo = [];
    this.creatureHudInfo = [];

    this.b = b; //bump

    //var totalSurvivors = app.renderer instanceof PIXI.WebGLRenderer ? 10000 : 100;
    this.totalSurvivors = config.world.survivors;
    this.totalPredators = config.world.predators;
    this.totalFood = config.world.food;

    //collect status
    this.deadSurvivors = [];

    this.survivorsContainer = new PIXI.particles.ParticleContainer(10000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    app.stage.addChild(this.survivorsContainer);

    this.predatorsContainer = new PIXI.particles.ParticleContainer(100, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    app.stage.addChild(this.predatorsContainer);

    this.foodContainer = new PIXI.particles.ParticleContainer(1000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    app.stage.addChild(this.foodContainer);

    this.debugContainer = new PIXI.particles.ParticleContainer(1000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    app.stage.addChild(this.debugContainer);

    this.creatureHudContainer = new PIXI.Container(1000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    })
    app.stage.addChild(this.creatureHudContainer);

    this.targetMateLineContainer = new PIXI.Container(1000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    app.stage.addChild(this.targetMateLineContainer);

    this.containers = {
      predatorsContainer: this.predatorsContainer,
      survivorsContainer: this.survivorsContainer,
      foodContainer: this.foodContainer,
      debugContainer: this.debugContainer,
      creatureHudContainer: this.creatureHudContainer,
      targetMateLineContainer: this.targetMateLineContainer
    };

    this.worldInfo = {
      survivorsInfo: this.survivorsInfo,
      childInfo: this.childInfo,
      predatorsInfo: this.predatorsInfo,
      foodInfo: this.foodInfo,
      debugInfo: this.debugInfo,
      creatureHudInfo: this.creatureHudInfo,
      targetMateLineInfo: this.targetMateLineInfo,
      deadSurvivors: this.deadSurvivors
    };

  }

  init() {
    this.initPredators(this.totalPredators);
    this.initSurvivors(this.totalSurvivors);
    this.loadFood(this.totalFood);
  }

  showScene() {
    for (var key in this.containers) {
      if (this.containers.hasOwnProperty(key)) {
        this.containers[key].alpha = 1;
      }
    }
  }

  hideScene() {
    for (var key in this.containers) {
      if (this.containers.hasOwnProperty(key)) {
        this.containers[key].alpha = 0;
      }
    }
  }

  /**
   * Generate food objects (both PIXI sprites and Food attributes)
   * @param {*} numSprites config.world.food  
   */
  loadFood(numSprites) {

    if (this.foodInfo.length >= config.world.maxFood)
      return;

    for (var i = 0; i < numSprites; i++) {

      let opt = {
        i: i,
        screenWidth: app.screen.width,
        screenHeight: app.screen.height
      }

      let obj = SpriteFactory.create("FoodSprite", opt);
      this.foodInfo.push(obj.getSprite());
      this.foodContainer.addChild(obj.getSprite());

    }

  }

  /**
   * Check deads, food status, predators and environment
   * 
   */
  checkSimulationStatus(delta) {
    for (var i = 0; i < this.survivorsInfo.length; i++) {
      if (this.survivorsInfo[i]) {
        if (this.survivorsInfo[i].isDead) {
          console.log("survivor #" + this.survivorsInfo[i].uid + " is dead (Starving)");
          this.killSurvivor(this.survivorsInfo[i]);
        } else {
          this.survivorsInfo[i].consumeEnergy();
          //get old
          this.survivorsInfo[i].addLivingTime();
          if (this.survivorsInfo[i].livingTime >= config.creature.adultAge) {
            this.survivorsInfo[i].sprite.tint = Constants.colors.RED;
          }

          if (this.survivorsInfo[i].livingTime >= config.creature.elderAge) {
            this.survivorsInfo[i].sprite.tint = Constants.colors.GREEN;
          }
        }
      }
    }
  }

  /**
   * Generate Predators objects (both PIXI sprites and Predators attributes)
   * @param {*} numSprites config.world.predators 
   */
  initPredators(numSprites, population) {

    var population = [];

    for (var i = 0; i < numSprites; i++) {

      // create a new survivor Sprite
      //let p = new Survivor(PIXI).Init(i,population[i], app);
      let opt = {
        PIXI: PIXI,
        dna: population[i],
        i: i,
        //sprite: predatorSprite.Init(app.screen.width, app.screen.height)
        sprite: SpriteFactory.create("PredatorSprite", {
            screenWidth: app.screen.width,
            screenHeight: app.screen.height,
            i: i
          })
          .getSprite()
      }

      let p = CreatureFactory.create("Predator", opt);
      console.log(p.collectStats());

      // finally we push the sprite into the survivors array so it it can be easily accessed later
      this.predatorsInfo.push(p);
      this.predatorsContainer.addChild(p.sprite);

      //this.addDebugInfo(p);

    }

  }

  /**
   * Generate Survivors objects (Both PIXI Sprites and survivor attributes)
   * @param {*} numSprites 
   * @param {*} population initialization dna
   */
  initSurvivors(numSprites, population) {

    var population = [];

    for (var i = 0; i < numSprites; i++) {

      // create a new survivor Sprite
      //let p = new Survivor(PIXI).Init(i,population[i], app);
      let opt = {
        PIXI: PIXI,
        dna: population[i],
        i: i,
        //sprite: survivorSprite.Init(app.screen.width, app.screen.height)
        sprite: SpriteFactory.create("SurvivorSprite", {
            screenWidth: app.screen.width,
            screenHeight: app.screen.height,
            i: i
          })
          .getSprite()
      }

      let p = CreatureFactory.create("Survivor", opt);

      // finally we push the sprite into the survivors array so it it can be easily accessed later
      this.survivorsInfo.push(p);
      this.survivorsContainer.addChild(p.sprite);

      this.addDebugInfo(p);
      this.addReproductionTargetLine(p);
      this.addCreatureHudInformation(p);
    }
  }

  /**
   * Add new Survivor to the world
   * @param {} population dna for new survivors 
   * TODO : REvisar por que llegan 2 iguales pero con padres cambiados
   */
  createNewSurvivors(population) {

    if (this.survivorsInfo.length >= config.world.maxSurvivors) {
      this.childInfo = [];
      return;
    }

    console.log(population.length);
    //TODO: Que no sean arreglos

    for (var i = 0; i < population.length; i++) {
      //let p = new Survivor(PIXI).Init(this.survivorsInfo.length,population[i], app);

      let opt = {
        PIXI: PIXI,
        dna: population[i],
        i: this.survivorsInfo.length,
        //sprite: survivorSprite.Init(app.screen.width, app.screen.height)
        sprite: SpriteFactory.create("SurvivorSprite", {
            screenWidth: app.screen.width,
            screenHeight: app.screen.height,
            i: this.survivorsInfo.length
          })
          .getSprite()
      }

      let p = CreatureFactory.create("Survivor", opt);

      this.survivorsInfo.push(p);
      this.survivorsContainer.addChild(p.sprite);
      //add children uid to parents childrens list
      //TODO : REPARAR ESTO (ya no se usa la property index).
      this.survivorsInfo.find(o => o.uid == opt.dna.parent1Uid)
        .addChildren(p.uid);
      this.survivorsInfo.find(o => o.uid == opt.dna.parent2Uid)
        .addChildren(p.uid);
      this.childInfo = []; //clean the childs buffer
      //TODO add children to survivor
      this.addDebugInfo(p);
      this.addCreatureHudInformation(p);
    }
  }

  addDebugInfo(survivor) {

    //Circle
    var graph = new PIXI.Graphics();
    graph.beginFill(0xFFFF0B, 0.2);
    graph.lineStyle(1, 0xffd900, 0);
    //graph.drawRect(0,0,300,300);
    graph.drawCircle(survivor.x, survivor.y, survivor.visionRange);
    graph.endFill();
    var img = new PIXI.Sprite(graph.generateTexture());
    img.uid = survivor.uid;
    img.anchor.set(0.5);
    this.debugContainer.addChild(img);
    this.debugInfo.push(img);
  }

  addCreatureHudInformation(survivor) {
    var hudTextInfo = new PIXI.Text("E: 100%", {
      fontWeight: 'bold',
      //fontStyle: 'italic',
      fontSize: 10,
      fontFamily: 'Arvo',
      fill: '#FFFFFF',
      align: 'left',
      //stroke: '#a4410e',
      strokeThickness: 1
    });

    hudTextInfo.uid = survivor.uid;
    hudTextInfo.x = survivor.sprite.x - 20;
    hudTextInfo.y = survivor.sprite.y - 5

    this.creatureHudContainer.addChild(hudTextInfo);
    this.creatureHudInfo.push(hudTextInfo);
  }

  addReproductionTargetLine(survivor) {
    let graph = new PIXI.Graphics();
    graph.uid = survivor.uid;
    this.targetMateLineContainer.addChild(graph);
    this.targetMateLineInfo.push(graph);

  }

  showLineage() {
    for (let i = 0; i < this.survivorsInfo.length; i++) {
      for (let j = 0; j < this.survivorsInfo[i].childrens.length; j++) {
        let childrenObj = this.survivorsInfo.find(o => o.uid == this.survivorsInfo[i].childrens[j]);
        if (childrenObj) {
          let currentLine = this.targetMateLineInfo.find(o => o.uid == this.survivorsInfo[i].sprite.uid);
          if (currentLine) {
            currentLine.clear();
            currentLine.lineStyle(1, Constants.colors.BLUE, 1)
              .moveTo(this.survivorsInfo[i].sprite.x, this.survivorsInfo[i].sprite.y)
              .lineTo(childrenObj.sprite.x, childrenObj.sprite.y);
            currentLine.beginFill(0.2);
            currentLine.endFill();
          }
        }
      }
    }
  }

  /**
   * Process food sprites and events
   */
  processFood() {
    //iterate trough the predator and move & find survivors
    for (var i = 0; i < this.foodInfo.length; i++) {

      this.foodInfo[i].direction += this.foodInfo[i].turningSpeed * 0.01;
      //check for border colission and change direction
      this.foodInfo[i].direction = this.foodInfo[i].handleBorderCollition();
      this.foodInfo[i].x += Math.sin(this.foodInfo[i].direction) * (this.foodInfo[i].speed * this.foodInfo[i].scale.y);
      this.foodInfo[i].y += Math.cos(this.foodInfo[i].direction) * (this.foodInfo[i].speed * this.foodInfo[i].scale.y);
      this.foodInfo[i].rotation = -this.foodInfo[i].direction + Math.PI;

      // wrap container and position 

      /*
      if (this.foodInfo[i].x < this.foodInfo[i].foodBounds.x) {
        this.foodInfo[i].x += this.foodInfo[i].foodBounds.width;
      } else if (this.foodInfo[i].x > this.foodInfo[i].foodBounds.x + this.foodInfo[i].foodBounds.width) {
        this.foodInfo[i].x -= this.foodInfo[i].foodBounds.width;
      }

      if (this.foodInfo[i].y < this.foodInfo[i].foodBounds.y) {
        this.foodInfo[i].y += this.foodInfo[i].foodBounds.height;
      } else if (this.foodInfo[i].y > this.foodInfo[i].foodBounds.y + this.foodInfo[i].foodBounds.height) {
        this.foodInfo[i].y -= this.foodInfo[i].foodBounds.height;
      }
      */
    }
  }

  /**
   * Predators logic
   */
  processPredator() {

    //iterate trough the predator and move & find survivors
    for (var i = 0; i < this.predatorsInfo.length; i++) {

      //Look for food
      this.predatorsInfo[i].findSurvivors(this.survivorsInfo);

      //check for border colission and change direction
      this.predatorsInfo[i].setDirection(this.predatorsInfo[i].sprite.handleBorderCollition());

      let PredatorEating = this.b.hit(
        this.predatorsInfo[i].sprite, this.survivorsInfo.map(a => a.sprite), false, false, false,
        function(collision, dude) {
          let survivor = this.survivorsInfo.find(o => o.uid == dude.uid);
          //survivor.isDead = true;
          this.killSurvivor(survivor);
          console.log("survivor #" + dude.uid + " is dead (eaten)");

          //TODO: FIX this, this.survivorsInfo is not discounting
          this.predatorsInfo[i].eat();
        }.bind(this)
      );

      //Move (apply direction / angle / speed values)
      this.predatorsInfo[i].move();

    }
  }

  /**
   * Remove survivor from simulation arrays (PIXI containers and logic arrays)
   * @param {survivor} survivor object 
   */
  killSurvivor(survivor) {
    this.survivorsContainer.removeChild(survivor.sprite);
    this.debugContainer.removeChild(this.debugInfo.find(o => o.uid == survivor.uid));
    this.creatureHudContainer.removeChild(this.creatureHudInfo.find(o => o.uid == survivor.uid));
    this.deadSurvivors.push(this.survivorsInfo.find(o => o.uid == survivor.uid));
    this.survivorsInfo = this.survivorsInfo.filter(o => o.uid !== survivor.uid)
    this.debugInfo = this.debugInfo.filter(o => o.uid !== survivor.uid);
    this.creatureHudInfo = this.creatureHudInfo.filter(o => o.uid !== survivor.uid);
    this.clearChildrenTreeLine(survivor);
  }

  clearChildrenTreeLine(survivor) {
    let currentLine = this.targetMateLineInfo.find(o => o.uid == survivor.uid);
    if (currentLine) {
      currentLine.clear();
      this.targetMateLineContainer.removeChild(currentLine);
      this.targetMateLineInfo = this.targetMateLineInfo.filter(o => o.uid !== currentLine.uid);
    }
  }

  processSurvivor() {

    // iterate through the survivors and find food, move, dodge
    for (var i = 0; i < this.survivorsInfo.length; i++) {

      if (this.survivorsInfo[i] && !this.survivorsInfo[i].isDead) {

        this.survivorsInfo[i].getCurrentStatus();
        this.survivorsInfo[i].checkIfCopuling();

        /**** 
         * FIRST PRIORITY : Find Food and survive
         */
        if (!this.survivorsInfo[i].reproductionStatus.isCopuling) {
          this.survivorsInfo[i].findFood(this.foodInfo);
        }

        //check for predator and change direction, it will cancel other movements
        //todo : check if survivors can be brave and ignore predators
        for (let j = 0; j < this.predatorsInfo.length; j++) {
          this.survivorsInfo[i].evadePredator(this.predatorsInfo[j]);
        }

        /**
         * Second priority : reproduce 
         */

        //during copuling
        if (this.survivorsInfo[i].reproductionStatus.isCopuling) {} else {

          //after
          if (this.survivorsInfo[i].reproductionStatus.isCopulingFinished &&
            !this.survivorsInfo[i].reproductionStatus.isCopuling &&
            !this.survivorsInfo[i].reproductionStatus.isFindingMate) {
            //start to generate sons
            let parent2 = this.survivorsInfo.find(o => o.uid == this.survivorsInfo[i].getCurrentMate())
            if (parent2) {
              let son = this.survivorsInfo[i].reproduce(parent2);
              this.childInfo.push(son);
              this.createNewSurvivors(this.childInfo);
            } else {
              console.log(this.survivorsInfo[i].getCurrentMate() + " no encontrado");
            }

            //stop copuling / reset all
            this.survivorsInfo[i].reproductionStatus.isCopulingFinished = false;
            this.survivorsInfo[i].reproductionStatus.isCopuling = false;
            this.survivorsInfo[i].reproductionStatus.isFindingMate = false;

          }
        }

        //find mate to reproduce

        if (this.survivorsInfo[i].reproductionStatus.isCopuling ||
          this.survivorsInfo[i].reproductionStatus.isFindingMate) {
          let cr;
          if (this.survivorsInfo.length < config.world.maxSurvivors)
            cr = this.survivorsInfo[i].findMate(this.survivorsInfo);

          //check if they can reproduce
          if (cr && cr.canReproduce == true) {
            console.log("PUEDE CULIAR " + cr.partnerUid);
            //let partner = this.survivorsInfo.find(o=>o.uid == cr.partnerUid);
            //partner = true;
            let idx = this.survivorsInfo.map(o => o.uid)
              .indexOf(cr.partnerUid);

            if (this.survivorsInfo[i].reproductionStatus.isFindingMate) {
              this.survivorsInfo[idx].startCopuling();
              this.survivorsInfo[i].startCopuling();
              this.survivorsInfo[idx].setCurrentMate(this.survivorsInfo[i].uid);
              this.survivorsInfo[i].setCurrentMate(this.survivorsInfo[idx].uid);
            }

          }
        }

        //check for border colission and change direction
        this.survivorsInfo[i].setDirection(this.survivorsInfo[i].sprite.handleBorderCollition());

        //sobreviviente comio?

        let survivorEating = this.b.hit(
          this.survivorsInfo[i].sprite, this.foodInfo, false, false, false,
          function(collision, food) {
            if (!food.eated) {
              food.eated = true;
              this.foodContainer.removeChild(food);
              //this.foodInfo.splice(food.idx, 1);
              this.foodInfo = this.foodInfo.filter(o => o.uid !== food.uid);
              this.survivorsInfo[i].eat();
              //console.log("survivor #" + this.survivorsInfo[i].idx + " - Comidos: " + this.survivorsInfo[i].numBugEated);
            }
          }.bind(this)
        );

        //Move
        this.survivorsInfo[i].move();

        //TODO REVISAR SI L HABILITO
        //this.survivorsInfo[i].WrapContainer();

      }

    }

  }

  //TODO : no uso estas variables.. raro lo que pensé.
  updateDebugInfo(op, survivor) {

    for (let i = 0; i < this.debugInfo.length; i++) {
      let surv = this.survivorsInfo.find(o => o.uid == this.debugInfo[i].uid);
      if (surv) {
        this.debugInfo[i].x = surv.sprite.x;
        this.debugInfo[i].y = surv.sprite.y;
      }
    }

    if (debugModeOn) {
      this.debugContainer.alpha = 0.3;
      this.targetMateLineContainer.alpha = 0.3;
    } else {
      this.debugContainer.alpha = 0;
      this.targetMateLineContainer.alpha = 0;

    }

  }

  updateCreatureHudInformation() {

    for (let i = 0; i < this.creatureHudInfo.length; i++) {
      let surv = this.survivorsInfo.find(o => o.uid == this.creatureHudInfo[i].uid);
      if (surv) {
        this.creatureHudInfo[i].x = surv.sprite.x - 10;
        this.creatureHudInfo[i].y = surv.sprite.y - 20;
        this.creatureHudInfo[i].text = helper.getEnergyBar(surv.collectStats()
          .energy);
      }
    }

    if (debugModeOn) {
      this.creatureHudContainer.alpha = 0.5;
    } else {
      this.creatureHudContainer.alpha = 0;
    }
  }

}

/* eslint-disable */

class Reproduction {

  constructor(parent1, parent2) {
    this.child = {
      speed: 0,
      visionRange: 0,
      turningSpeed: 0,
      maxEnergy: 0,
      fertility: 0,
      copulingDistance: 0,
      braveness: 0
    };

    this.parent1 = parent1;
    this.parent2 = parent2;
  }

  Evolve() {

    this.Crossover();

    if (Math.random() > config.evolution.geneticOperators.mutationProbabilityRate) {
      this.Mutate();
    }

    console.log("Child Chromosome");
    console.log(this.child);

    this.child.parent1Uid = this.parent1.uid;
    this.child.parent2Uid = this.parent2.uid;
    return this.child;

  }

  Crossover() {

    //speed
    if (Math.random() > config.evolution.geneticOperators.specificGeneCrossoverRate) {
      this.child.speed = this.parent1.speed;
    } else {
      this.child.speed = this.parent2.speed;
    }

    //visionRange
    if (Math.random() > config.evolution.geneticOperators.specificGeneCrossoverRate) {
      this.child.visionRange = this.parent1.visionRange;
    } else {
      this.child.visionRange = this.parent2.visionRange;
    }

    //turningSpeed
    if (Math.random() > config.evolution.geneticOperators.specificGeneCrossoverRate) {
      this.child.turningSpeed = this.parent1.turningSpeed;
    } else {
      this.child.turningSpeed = this.parent2.turningSpeed;
    }

    //energy
    if (Math.random() > config.evolution.geneticOperators.specificGeneCrossoverRate) {
      this.child.maxEnergy = this.parent1.maxEnergy;
    } else {
      this.child.maxEnergy = this.parent2.maxEnergy;
    }

    //Fertility
    if (Math.random() > config.evolution.geneticOperators.specificGeneCrossoverRate) {
      this.child.fertility = this.parent1.fertility;
    } else {
      this.child.fertility = this.parent2.fertility;
    }

    //Copuling Distance
    if (Math.random() > config.evolution.geneticOperators.specificGeneCrossoverRate) {
      this.child.copulingDistance = this.parent1.copulingDistance;
    } else {
      this.child.copulingDistance = this.parent2.copulingDistance;
    }

    //braveness
    if (Math.random() > config.evolution.geneticOperators.specificGeneCrossoverRate) {
      this.child.braveness = this.parent1.braveness;
    } else {
      this.child.braveness = this.parent2.braveness;
    }
  }

  Mutate() {
    let go = config.evolution.geneticOperators;
    this.child.speed === Math.random() < go.specificGeneMutationRate ? (2 + Math.random() * 2) * 0.2 : this.child.speed;
    this.child.visionRange === Math.random() < go.specificGeneMutationRate ? helper.generateRandomInteger(50, 100) :
      this.child.visionRange;
    this.child.turningSpeed === Math.random() < go.specificGeneMutationRate ? Math.abs(Math.random(1) - 0.8) : this.child
      .turningSpeed;
    this.child.maxEnergy === Math.random() < go.specificGeneMutationRate ? helper.generateRandomInteger(1, 10) : this
      .child.maxEnergy;
    //TODO: why i'm not mutating fertility?
    this.child.copulingDistance === Math.random() < go.specificGeneMutationRate ? helper.generateRandomInteger(10, 50) :
      this.child.copulingDistance;
    this.child.braveness === Math.random() < go.specificGeneMutationRate ? Math.random(1) : this.child.braveness;
  }

}

const CreatureFactory = {

  registeredTypes: new Map(),

  register(classname, classPrototype) {
    if (!CreatureFactory.registeredTypes.has(classname) &&
      classPrototype.prototype instanceof Creature) {
      CreatureFactory.registeredTypes.set(classname, classPrototype);
    } else {
      console.error(classname + " is not instance of Creature");
    }
  },

  create(classname, opt) {
    if (!CreatureFactory.registeredTypes.has(classname)) {
      console.error(classname + " not registered, use register method first ");
      return null;
    }

    let cl = CreatureFactory.registeredTypes.get(classname);
    let instance = new cl(opt);
    return instance;
  }
}

const SpriteFactory = {

  registeredTypes: new Map(),

  register(classname, classPrototype) {
    if (!SpriteFactory.registeredTypes.has(classname) &&
      classPrototype.prototype instanceof CustomSprite) {
      SpriteFactory.registeredTypes.set(classname, classPrototype);
    } else {
      console.error(classname + " is not instance of Sprite");
    }
  },

  create(classname, opt) {
    if (!SpriteFactory.registeredTypes.has(classname)) {
      console.error(classname + " not registered, use register method first ");
      return null;
    }

    let cl = SpriteFactory.registeredTypes.get(classname);
    let instance = new cl(opt);
    return instance;
  }
}

/* eslint-disable */
var config = {
  app: {
    width: 800,
    height: 600,
    autoSize: true,
    visual: {
      bgcolor: "0X022a31"
    }
  },
  world: {
    food: 100,
    predators: 1,
    survivors: 45,
    maxFoodGenerationRatio: 50,
    foodRegenerationThreshold: 0.1, // % of max food to regenerate food
    maxFood: 150,
    maxSurvivors: 90,
    maxPredators: 3

  },
  evolution: {
    generationLimit: 10,
    geneticOperators: {
      crossoverProbabilityRate: 0.3,
      specificGeneCrossoverRate: 0.5,
      mutationProbabilityRate: 0.5,
      specificGeneMutationRate: 0.3
    }
  },
  creature: {
    adultAge: 5,
    elderAge: 10,
    livingTimeLimit: 15,
    minVisionRange: 50,
    maxVisionRange: 200,
    maxEnergy: 10
  },
  debugMode: false
}

const Constants = {

  genders: {
    MALE: "MALE",
    FEMALE: "FEMALE"
  },

  creatureTypes: {
    SURVIVOR: "SURVIVOR",
    PREDATOR: "PREDATOR"
  },
  colors: {
    RED: 0xf91800,
    BLUE: 0x000ff,
    BLUEYALE: 0x0E4D92,
    GREY: 0xb6b6ba,
    DARKGREY: 0x313335,
    LIGHTGREY: 0xD3D3D3,
    WHITE: 0XFFFFFF,
    GREEN: 0x00FF00,
    ORANGE: 0xFC6600
  },
  simulationStates: {
    RUN: "run",
    SPLASH: "splash",
    STOPPED: "stopped",
    ROTATION: "rotation"
  }
}

class CustomSprite {
  constructor(opt) {
    this.appScreenWidth = opt.screenWidth;
    this.appScreenHeight = opt.screenHeight;
  }

  getSprite() {
    return this.sprite;
  }

  setBehavior() {

    this.sprite.handleBorderCollition = function() {

      //si el worm choca con los limites lo dirijo hacia otro lado
      let evalSprite = {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height
      }

      let borderX = this.x; // + sprite.width;
      let borderY = this.y; // + sprite.height;

      let direction = this.direction;
      let collission = false;

      //console.log("X: " + borderX + ", Y: " + borderY);

      if (borderX >= this.appScreenWidth - 10 || borderX <= 10) {

        collission = true;
        //console.log("COLISSION X at " + borderX + "," + borderY);
      }

      if (borderY >= this.appScreenHeight || borderY <= 10) {
        collission = true;
        //console.log("COLISSION Y at " + borderX + "," + borderY);
      }

      if (collission) {
        direction = helper.CheckDistanceBetweenSprites(evalSprite, {
            x: this.appScreenWidth / 2,
            y: this.appScreenHeight / 2
          })
          .angle;
      }

      return direction;
    }

  }

  getBounds() {
    let dudeBoundsPadding = 150;
    return new PIXI.Rectangle(
      -dudeBoundsPadding,
      -dudeBoundsPadding,
      this.appScreenWidth + dudeBoundsPadding * 2,
      this.appScreenHeight + dudeBoundsPadding * 2);
  }
}

class FoodSprite extends CustomSprite {

  constructor(opt) {
    super(opt);
    this.appScreenWidth;
    this.appScreenHeight;

    this.init(opt.screenWidth, opt.screenHeight, opt.i);
  }

  init(screenWidth, screenHeight, i) {

    let graphics = new PIXI.Graphics;
    graphics.beginFill(Constants.colors.LIGHTGREY);
    graphics.drawCircle(10, 10, 2);
    graphics.endFill();
    let texture = new PIXI.Texture(app.renderer.generateTexture(graphics));
    this.sprite = new PIXI.Sprite(texture);
    //this.sprite = new PIXI.Sprite.fromImage('/img/star.png', true),
    //this.sprite = new PIXI.Sprite(PIXI.loader.resources["img/star.png"].texture)
    this.appScreenWidth = screenWidth;
    this.appScreenHeight = screenHeight;
    this.idx = i;
    this.sprite.idx = i;
    this.uid = helper.generateGuid();
    this.sprite.uid = this.uid;
    this.setParameters();
    super.setBehavior();
  };

  setParameters() {

    // set the anchor point so the texture is centerd on the sprite
    this.sprite.anchor.set(0.5);
    // scale png file
    //this.sprite.scale.set(0.05);
    this.sprite.scale.set(1);

    this.sprite.x = Math.random() * (this.appScreenWidth - 50);
    this.sprite.y = Math.random() * (this.appScreenHeight - 50);

    // create a random direction in radians
    this.sprite.direction = Math.random() * Math.PI * 2;
    this.sprite.turningSpeed = Math.random() - 0.8;
    //this.sprite.speed = (10 + Math.random() * 15) * 0.2;
    this.sprite.speed = (10 + Math.random() * 15) * 0.02;

    this.sprite.foodBounds = this.getBounds();

    this.sprite.offset = Math.random() * 100;
    this.sprite.appScreenWidth = this.appScreenWidth;
    this.sprite.appScreenHeight = this.appScreenHeight;
  };

  getBounds() {

    let foodBoundsPadding = 200;
    foodBounds = new PIXI.Rectangle(
      -foodBoundsPadding,
      -foodBoundsPadding,
      (this.appScreenWidth) + foodBoundsPadding * 2,
      (this.appScreenHeight) + foodBoundsPadding * 2
    );

    return foodBounds;
  }

}

class PredatorSprite extends CustomSprite {

  constructor(opt) {
    super(opt);
    this.appScreenWidth;
    this.appScreenHeight;
    this.init(opt);
  }

  init(opt) {
    //this.sprite = new PIXI.Sprite.fromImage('/img/predator.png');
    this.sprite = new PIXI.Sprite(PIXI.loader.resources["img/predator.png"].texture)
    this.appScreenWidth = opt.screenWidth;
    this.appScreenHeight = opt.screenHeight;
    this.setParameters();
    super.setBehavior();
    this.idx = opt.i;
    return this.sprite;
  };

  setParameters() {
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.8 + Math.random() * 0.3);
    this.sprite.dudeBounds = this.getBounds();
    this.sprite.tint = Constants.colors.WHITE;
    this.sprite.direction = Math.random() * Math.PI * 2;
    this.sprite.offset = Math.random() * 100;
    this.sprite.appScreenWidth = this.appScreenWidth;
    this.sprite.appScreenHeight = this.appScreenHeight;
  };

}

class SurvivorSprite extends CustomSprite {

  constructor(opt) {
    super(opt);
    this.appScreenWidth;
    this.appScreenHeight;
    this.init(opt);
  }

  init(opt) {

    /*
    let graphics = new PIXI.Graphics;
    graphics.beginFill(0xff22aa);
    graphics.drawCircle(40, 60, 17);
    graphics.drawCircle(10, 10, 10);
    graphics.endFill();
    let texture = new PIXI.Texture(app.renderer.generateTexture(graphics));

    this.sprite = new PIXI.Sprite(texture);
    this.appScreenWidth = screenWidth;
    this.appScreenHeight = screenHeight;
    this.setParameters();
    this.setBehavior();
    */

    //this.sprite = new PIXI.Sprite.fromImage('/img/trail.png'),
    this.sprite = new PIXI.Sprite(PIXI.loader.resources["img/trail.png"].texture);
    this.appScreenWidth = opt.screenWidth;
    this.appScreenHeight = opt.screenHeight;
    this.idx = opt.i;
    this.setParameters();
    super.setBehavior();
  }

  setParameters() {
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.2);
    this.sprite.dudeBounds = super.getBounds();
    //this.sprite.tint = Constants.colors.BLUE;
    this.sprite.direction = Math.random() * Math.PI * 2;
    this.sprite.offset = Math.random() * 100;
    this.sprite.appScreenWidth = this.appScreenWidth;
    this.sprite.appScreenHeight = this.appScreenHeight;
  }

}

const GenerateRandomParameters = function() {
  let parameters = {};

  parameters.visionRange = helper.generateRandomInteger(config.creature.minVisionRange, config.creature.maxVisionRange);
  parameters.maxEnergy = helper.generateRandomInteger(1, config.creature.maxEnergy);
  parameters.turningSpeed = Math.random() - 0.8;
  parameters.speed = (2 + Math.random() * 2) * 0.2;
  parameters.fertility = Math.random(1);
  //parameters.copulingDistance = helper.generateRandomInteger(10, 50);
  parameters.copulingDistance = helper.generateRandomInteger(10, 20);
  parameters.braveness = Math.random(1);

  //console.log(parameters);

  return parameters;
}

class Creature {

  constructor(opt) {

    //ID and index in array
    this.uid = helper.generateGuid();
    this.idx = opt.i;

    //Sprite object attachment
    this.sprite = null;
    this.setSprite(opt.sprite);
    this.sprite.uid = this.uid;
    this.sprite.idx = this.idx;

    //Will
    //braveness
    this.braveness = opt.braveness;
    //horniness
    this.horniness = opt.horniness;

    //dna
    if (!opt.dna) {
      opt.dna = GenerateRandomParameters();
    }

    //attributes
    this.maxEnergy = opt.dna.maxEnergy;
    this.energy = this.maxEnergy; //init full
    this.visionRange = opt.dna.visionRange;
    this.speed = opt.dna.speed;
    this.gender = (Math.random(1) < 0.5) ? "MALE" : "FEMALE";
    this.fertility = opt.dna.fertility;
    this.copulingDistance = opt.dna.copulingDistance;
    this.turningSpeed = opt.dna.turningSpeed;
    this.livingTime = 0; //age
    this.livingTimeLimit = config.creature.livingTimeLimit; //life is over

    //status

    this.reproductionStatus = {
      isFindingMate: false,
      isCopuling: false,
      isCopulingFinished: false
    }

    this.isBlind = false;
    this.isDead = false;
    this.isCopuling = false;
    this.isFindingMate = false; //quiere follar

    //counters
    this.reproductionTimer = 0;

    //mates & childrens
    this.mates = []; //uid array  (not object)
    this.childrens = []; //uid array (not object)
    this.currentMate = ""; //uid

    //movement & position
    this.setPosition(Math.random() * this.sprite.appScreenWidth, Math.random() * this.sprite.appScreenHeight);
    this.setDirection(Math.random() * Math.PI * 2);
    this.setCenterCoordinates();

    this.stats = null;

  }

  willExecute(opt) {

    //options: eat, dodge or reproduce
    //priorities : survive, reproduction
    //logic : * more vision range, more chances to survive and reproduce
    //        * more speed, more chances to survive and reproduce
    // alternatives: 
    // if low energy then eat over reproduce
    // if low energy but predator near then dodge
    // if high energy then try to reproduce
    // if high energy but predator near then dodge
    // if medium energy then eat or reproduce
    // if medium energy but predator near then eat

    // will parameter:
    // options : braveness, horniness
    // logic: * more braveness, more risks to take, if better vision range and speed
    //          more chances to survive and reproduce else less chances than normal
    //        * more horniness, more risk to reproduce, if medium or low energy then
    //        * reproduce over eat
    // if low energy and horniness then reproduce over eat
    // if low energy and predator near but braveness then eat over dodge
    // if high energy then try to reproduce
    // if high energy but predator but braveness then reproduce over dodge
    // if medium energy then eat or reproduce
    // if medium energy but predator near then eat

  }

  collectStats() {

    //Stats
    this.stats = {
      uid: this.uid,
      idx: this.idx,
      livingTime: this.livingTime,
      livingTimeLimit: this.livingTimeLimit,
      gender: this.gender,
      creatureType: this.creatureType,
      speed: this.speed,
      visionRange: this.visionRange,
      copulingDistance: this.copulingDistance,
      turningSpeed: this.turningSpeed,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      numBugEated: this.numBugEated,
      isDead: this.isDead,
      isBlind: this.isBlind,
      isDodging: this.isDodging,
      isCopuling: this.isCopuling,
      isFindingMate: this.isFindingMate,
      fertility: this.fertility,
    };

    return this.stats;

  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.sprite.x = x;
    this.sprite.y = y;
  }

  setDirection(direction) {
    this.direction = direction;
    this.sprite.direction = direction;
  }

  setCenterCoordinates() {
    this.sprite.centerX = this.sprite.x + this.sprite.width / 2;
    this.sprite.centerY = this.sprite.y + this.sprite.height / 2;
    this.sprite.halfWidth = this.sprite.width / 2;
    this.sprite.halfHeight = this.sprite.height / 2;
  }

  setSprite(sprite) {
    this.sprite = sprite;
  }

  setIdx(idx) {
    this.idx = idx;
    this.sprite.idx = idx;
  }

  /**
   * Apply Force (angle + direction + speed)
   */
  move() {
    this.sprite.rotation = -this.sprite.direction + Math.PI;
    let x = this.sprite.x + Math.sin(this.sprite.direction) * (this.speed); //* sprite.scale.y);
    let y = this.sprite.y + Math.cos(this.sprite.direction) * (this.speed);
    this.setPosition(x, y);
  }

  /**
   * 
   */
  consumeEnergy() {
    this.energy -= 0.2;

    if (this.energy <= 0) {
      this.isDead = true;
    }
  }

  addLivingTime() {
    this.livingTime += 0.1;

    if (this.livingTime > this.livingTimeLimit) {
      this.isDead = true;
      this.interruptCopuling();
    }
  }

  wrapContainer() {

  }

  addChildren(sonUid) {
    this.childrens.push(sonUid);
  }

  getCurrentMate() {
    return this.currenMate;
  }

  setCurrentMate(uid) {
    this.currenMate = uid;
    this.mates.push(uid);
  }

}

class Predator extends Creature {
  constructor(opt) {
    super(opt);

    //Predator specific behavior

    this.numCrittersEated = 0;
    this.creatureType = Constants.creatureTypes.PREDATOR;
    this.livingTimeLimit = config.creature.livingTimeLimit * 3; //they live more
    this.speed = this.speed * 0.8; //predator are slower but bigger

    this.collectStats();

  }

  /**
   * Find survivors to eat
   * @param {*} survivorsInfo array of survivors (attributes + sprite)
   */
  findSurvivors(survivorsInfo) {

    let nearestSurvivorUid;
    let nearestSurvivorDistance = 9000;
    let angle;
    let survivorFound = 0;

    for (let i = 0, len = survivorsInfo.length; i < len; i++) {
      let dist = helper.CheckDistanceBetweenSprites(this.sprite, survivorsInfo[i].sprite);
      if (nearestSurvivorDistance > dist.distance) {
        if (dist.distance < this.visionRange &&
          !survivorsInfo[i].isDead) {
          nearestSurvivorDistance = dist.distance;
          nearestSurvivorUid = survivorsInfo[i].uid;
          angle = dist.angle;
          survivorFound++;
        }
      }
    }

    if (survivorFound == 0) {
      this.isBlind = true;
    } else {
      this.sprite.nearestSurvivorDistance = nearestSurvivorDistance;
      this.sprite.nearestSurvivorUid = nearestSurvivorUid;
      this.setDirection(angle);
      this.isBlind = false;
    }
  }

  /**
   * When eat, add energy
   */
  eat() {
    this.numCrittersEatedEated++;
    this.energy += 1;
  }
}

class Survivor extends Creature {
  constructor(opt) {
    super(opt);

    //surivor specific behavior
    this.isDodging = false;
    this.predatorNear = false;
    this.numBugEated = 0;
    this.nearestFoodDistance = 1000;
    this.nearestFoodIdx = -1;
    this.creatureType = Constants.creatureTypes.SURVIVOR;

    this.nearestSurvivorDistance = 9000;
    this.nearestSurvivorUid = "";

    this.collectStats();
  }

  /**
   * 
   * @param {*} foodInfo 
   */
  findFood(foodInfo) {

    //checkear la comida mas cercana

    var nearestFoodIdx;
    var nearestFoodDistance = 1000;
    var angle;
    var foodfound = 0;

    for (var j = 0; j < foodInfo.length; j++) {

      let dist = helper.CheckDistanceBetweenSprites(this.sprite, foodInfo[j]);

      if (nearestFoodDistance > dist.distance) {

        if (dist.distance < this.visionRange && !foodInfo[j].eated) {
          //console.log("comida cercana " + dude.nearestFoodDistance + " - distancia : " + dist.distance + " - angle : " +dist.angle + " - dudeDirection : " + dude.direction);

          nearestFoodDistance = dist.distance;
          nearestFoodIdx = j;
          angle = dist.angle;
          foodfound++;
        }
      }
    }

    //asignar target al worm

    if (foodfound == 0) {
      //sprite.tint = 0xFF0000;
      //dude.direction = Math.random() * Math.PI * 2;
      this.isBlind = true;
    } else {
      //asigno target normalmente
      this.nearestFoodDistance = nearestFoodDistance;
      this.nearestFoodIdx = nearestFoodIdx;
      this.setDirection(angle);
      this.isBlind = false;

    }

    //console.log("FIND FOOD RESULT : " + this.nearestFoodDistance);

  }

  getCurrentStatus() {

    if (this.reproductionStatus.isCopuling) {
      this.reproductionStatus.isCopuling = true;
      this.reproductionStatus.isCopulingFinished = false;
      this.reproductionStatus.isFindingMate = false;
    }

    if (this.reproductionStatus.isCopuling == false && this.energy > this.maxEnergy / 2 && this.isDodging == false &&
      this.livingTime >= config.creature.adultAge) {
      this.isFindingMate = true;
      this.reproductionStatus.isFindingMate = true;
      this.reproductionStatus.isCopuling = false;
      this.reproductionStatus.isCopulingFinished = false;
    } else {
      this.isFindingMate = false;
      this.reproductionStatus.isFindingMate = false;
    }
  }

  move() {

    if (!this.reproductionStatus.isCopuling)
      super.move();
    else {

      this.sprite.direction += 0.1;
      this.sprite.rotation = -this.sprite.direction + Math.PI;
      let x = this.sprite.x + Math.sin(this.sprite.direction) * (this.speed); //* sprite.scale.y);
      let y = this.sprite.y + Math.cos(this.sprite.direction) * (this.speed);
      this.setPosition(x, y);
    }
  }

  startCopuling() {
    this.reproductionStatus.isCopuling = true;
    this.reproductionStatus.isFindingMate = false;
    this.reproductionStatus.isCopulingFinished = false;
    this.reproductionTimer = 0;
  }

  endCopuling() {
    this.reproductionStatus.isCopuling = false;
    this.reproductionStatus.isFindingMate = false;
    this.reproductionStatus.isCopulingFinished = true;
    this.reproductionTimer = 0;
  }

  interruptCopuling() {
    this.reproductionStatus.isCopuling = false;
    this.reproductionStatus.isFindingMate = false;
    this.reproductionStatus.isCopulingFinished = false;
    this.reproductionTimer = 0;
  }

  checkIfCopuling() {
    if (this.reproductionStatus.isCopuling) {
      if (this.reproductionTimer < 5) {
        this.reproductionTimer += 0.01;
        this.reproductionStatus.isCopuling = true;
        this.reproductionStatus.isFindingMate = false;
        this.reproductionStatus.isCopulingFinished = false;
        this.sprite.tint = Constants.colors.BLUE;
      } else {
        this.reproductionStatus.isCopulingFinished = true;
        this.reproductionStatus.isCopuling = false;
        this.reproductionStatus.isFindingMate = false;
        this.setColorByAge();
      }
    }
    return this.reproductionStatus.isCopuling;
  }

  reproduce(parent2) {
    let reproduction = new Reproduction(this, parent2);
    let son = reproduction.Evolve();
    this.endCopuling();
    return son;
  }

  setColorByAge() {
    if (this.livingTime < config.creature.adultAge) {
      this.sprite.tint = Constants.colors.WHITE;
    } else if (this.livingTime >= config.creature.elderAge) {
      this.sprite.tint = Constants.colors.GREEN;
    } else {
      this.sprite.tint = Constants.colors.RED;
    }
  }

  /**
   * 
   */
  findMate(survivorInfo) {
    var nearestSurvivorUid = -1;
    var nearestSurvivorDistance = 1000;
    var mateFound = 0;
    var angle = 0;

    if (this.reproductionStatus.isCopuling)
      return;

    /*
    if (this.energy > this.maxEnergy / 2 && this.isDodging == false) {
      this.isFindingMate = true;
      this.reproductionStatus.isFindingMate = true;
    }
    else {
      this.isFindingMate = false;
      this.reproductionStatus.isFindingMate = false;
    }
    */

    if (this.reproductionStatus.isFindingMate) {
      for (var i = 0; i < survivorInfo.length; i++) {
        if (survivorInfo[i] && !survivorInfo[i].isDead) {

          if (this.idx != i && this.uid != survivorInfo[i].uid) {
            let dist = helper.CheckDistanceBetweenSprites(this.sprite, survivorInfo[i].sprite);
            if (nearestSurvivorDistance > dist.distance &&
              dist.distance < this.visionRange) {
              nearestSurvivorDistance = dist.distance;
              nearestSurvivorUid = survivorInfo[i].uid;
              mateFound++;
              angle = dist.angle;
            }
          }
        }
      }

      var objResult = {
        canReproduce: false,
        partnerUid: -1
      };

      if (mateFound > 0) {
        let survivor = survivorInfo.find(o => o.uid == nearestSurvivorUid);

        if (nearestSurvivorDistance <= this.copulingDistance) {

          if (this.checkReproductionConditions(survivor)) {
            this.nearestSurvivorDistance = nearestSurvivorDistance;
            this.nearestSurvivorUid = nearestSurvivorUid;
            this.setDirection(angle);
            //this.reproductionStatus.isCopuling = true;
            //this.mates.push(survivor.uid);

            objResult = {
              canReproduce: true,
              partnerUid: survivor.uid
            };

            console.log("puede");

          }
        } else {
          this.nearestSurvivorDistance = nearestSurvivorDistance;
          this.nearestSurvivorUid = nearestSurvivorUid;
          this.setDirection(angle);
          //this.reproductionStatus.isCopuling = false;

        }

      }

      return objResult
    }
  }

  checkReproductionConditions(survivor) {

    //not self reproduction
    if (survivor.uid == this.uid) {
      return false;
    }

    //only living creatures
    if (survivor.isDead || this.isDead) {
      return false;
    }

    //only adults can reproduce
    if (this.livingTime < config.creature.adultAge) {
      return false;
    }

    //from diferent genders
    if (this.gender == survivor.gender) {
      return false;
    }

    //with new partners (revisar)
    if (this.mates.indexOf(survivor.uid) != -1) {
      return false;
    }

    //not with childrens
    if (this.childrens.indexOf(survivor.uid) != -1) {
      return false;
    }

    //if fertility of both is ok 
    if (this.fertility < 0.3) {
      return false;
    }

    if (survivor.fertility < 0.3) {
      return false;
    }

    //they are not copuling at this moment
    if (this.reproductionStatus.isCopuling) {
      return false;
    }

    if (survivor.reproductionStatus.isCopuling) {
      return false;
    }

    //they are not in danger
    if (this.energy < this.maxEnergy / 2 || this.isDodging == true) {
      return false;
    }

    if (survivor.energy < survivor.maxEnergy / 2 || survivor.isDodging == true) {
      return false;
    }

    return true;

  }

  /**
   * 
   */
  /*
  canReproduce(survivorInfo) {

    var nearestSurvivorIdx = -1;
    var nearestSurvivorDistance = 1000;
    var puedeCuliar = 0;

    for (var i = 0; i < survivorInfo.length; i++) {
      if (this.idx != i) {
        let dist = helper.CheckDistanceBetweenSprites(this.sprite, survivorInfo[i].sprite);
        if (nearestSurvivorDistance > dist.distance) {

          if (dist.distance < this.visionRange &&
            (!survivorInfo[i].isCopuling && !this.reproductionStatus.isCopuling) &&
            (survivorInfo[i].uid != this.uid) &&
            !survivorInfo[i].isDead &&
            this.gender != survivorInfo[i].gender &&
            this.mates.indexOf(survivorInfo[i].uid) == -1 &&
            (this.fertility > 0.3 && survivorInfo[i].fertility > 0.3)) {
            nearestSurvivorDistance = dist.distance;
            nearestSurvivorIdx = i;
            puedeCuliar++;
          }
        }
      }
    }

    //Post loop
    if (puedeCuliar > 0) {

      this.reproductionStatus.isCopuling = true;
      survivorInfo[nearestSurvivorIdx].isCopuling = true;
      this.mates.push(survivorInfo[nearestSurvivorIdx].uid);

      return {
        canReproduce: true,
        partnerIdx: nearestSurvivorIdx,
      };
    } else {
      this.reproductionStatus.isCopuling = false;
      return {
        canReproduce: false,
        partnerIdx: -1
      }
    }

  };

  */

  /**
   * Change direction to evade predators (if they in vision Range)
   * @param predator : predator info
   */
  evadePredator(predator) {
    let dist = helper.CheckDistanceBetweenSprites(this.sprite, predator.sprite);
    if (dist.distance < this.visionRange) {
      if (this.isDodging == false) {
        this.setDirection(predator.direction + predator.direction * Math.random(30, 60));
        this.isDodging = true;
        //this.sprite.tint = Constants.colors.BLUE;
      }
    } else {
      this.isDodging = false;
      //this.sprite.tint = Constants.colors.WHITE;
    }
  };

  /**
   * When eat, add energy
   */
  eat() {
    this.numBugEated++;
    if (this.energy + 1 <= config.creature.maxEnergy)
      this.energy += 1;
    this.nearestFoodDistance = 1000;
    this.nearestFoodIdx = 9999;
  }
}

class StateManager {

  constructor(opt) {
    this.currentState = Constants.simulationStates.STOPPED;
    this.lastState = Constants.simulationStates.STOPPED;
    this.scenes = opt.scenes;
  }

  setState(state) {
    if (this.currentState != state) {
      this.lastState = this.currentState;
      this.currentState = state;

      switch (state) {
        case Constants.simulationStates.STOPPED:
          this.scenes.world.hideScene();
          this.scenes.splash.hideScene();
          this.scenes.rotation.hideScene();
          this.scenes.inGameInformation.hideScene();
          this.scenes.uiControls.hideScene();
          break;

        case Constants.simulationStates.RUN:
          this.scenes.world.showScene();
          this.scenes.splash.hideScene();
          this.scenes.rotation.hideScene();
          this.scenes.inGameInformation.showScene();
          this.scenes.uiControls.showScene();
          break;

        case Constants.simulationStates.ROTATION:
          this.scenes.world.hideScene();
          this.scenes.splash.hideScene();
          this.scenes.rotation.showScene();
          this.scenes.inGameInformation.hideScene();
          this.scenes.uiControls.hideScene();
          break;

        case Constants.simulationStates.SPLASH:
          this.scenes.world.hideScene();
          this.scenes.splash.showScene();
          this.scenes.rotation.hideScene();
          this.scenes.inGameInformation.hideScene();
          this.scenes.uiControls.hideScene();
          break;
      }

    }
  }

  getCurrentState() {
    return this.currentState;
  }

  getLastState() {
    return this.lastState;
  }

}

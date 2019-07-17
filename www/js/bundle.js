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

const EventHandler = {

  registeredEventHandlers: {},
  registeredEventActions: new Map(),

  registerEventHandler(eventType, origin, callback) {
    let eventDefinition = {
      executed: false,
      origin: origin,
      callbackFunction: callback
    };

    found = false;

    if (this.registeredEventHandlers[eventType] == null || this.registeredEventHandlers[eventType] == 'undefined') {
      this.registeredEventHandlers[eventType] = [];
      this.registeredEventHandlers[eventType].push(eventDefinition);
    } else {
      for (let i = 0; i < this.registeredEventHandlers[eventType].length; i++) {
        if (this.registeredEventHandlers[eventType][i].origin == origin) {
          this.registeredEventHandlers[eventType][i] = eventDefinition;
          found = true;
        }
      }

      if (!found) {
        this.registeredEventHandlers[eventType].push(eventDefinition);
      }

    }
  },

  getEventHandler(eventType) {
    if (!eventType)
      return this.registeredEventHandlers;
    else
      return this.registeredEventHandlers[eventType];
  },

  validateEventType(eventType) {
    if (this.registeredEventHandlers[eventType] == null ||
      this.registeredEventHandlers[eventType] == "undefined") {
      console.log("eventHandler.js : event [" + eventType + "] not registered");
      return false;
    }
    return true;
  },

  setEventOrigin(eventType, origin) {

    if (!this.validateEventType(eventType))
      return;

    for (let i = 0; i < this.registeredEventHandlers[eventType].length; i++) {
      this.registeredEventHandlers[eventType][i].origin = origin;
      this.registeredEventHandlers[eventType][i].executed = false;
    }
  },

  setEventStatus(eventType, status) {
    if (!this.validateEventType(eventType))
      return;

    for (let i = 0; i < this.registeredEventHandlers[eventType].length; i++) {
      this.registeredEventHandlers[eventType][i].executed = status;
    }
  },

  setCallbackFunction(eventType, origin, callback) {
    if (!this.validateEventType(eventType))
      return;

    for (let i = 0; i < this.registeredEventHandlers[eventType].length; i++) {
      if (this.registeredEventHandlers[eventType][i].origin == origin) {
        this.registeredEventHandlers[eventType][i].callbackFunction = callback;
      }
    }
  },

  execute(eventType, origin, data) {
    if (!this.validateEventType(eventType))
      return;

    for (let i = 0; i < this.registeredEventHandlers[eventType].length; i++) {
      if (this.registeredEventHandlers[eventType][i].origin == origin) {
        if (typeof(this.registeredEventHandlers[eventType][i].callbackFunction) === "function") {
          if (this.registeredEventHandlers[eventType][i].executed == false) {
            this.registeredEventHandlers[eventType][i].executed = true;
            return this.registeredEventHandlers[eventType][i].callbackFunction(data);
          }
        } else {
          console.log("EventType : " + eventType + "[" + origin + "].callbackfunction is not a function");
        }
      }
    }
  }

}

class GameUtilities {
  constructor() {}

  /*
  distance
  ----------------

  Find the distance in pixels between two sprites.
  Parameters: 
  a. A sprite object. 
  b. A sprite object. 
  The function returns the number of pixels distance between the sprites.

     let distanceBetweenSprites = gu.distance(spriteA, spriteB);

  */

  distance(s1, s2) {
    let vx = (s2.x + this._getCenter(s2, s2.width, "x")) - (s1.x + this._getCenter(s1, s1.width, "x")),
        vy = (s2.y + this._getCenter(s2, s2.height, "y")) - (s1.y + this._getCenter(s1, s1.height, "y"));
    return Math.sqrt(vx * vx + vy * vy);
  }

  /*
  followEase
  ----------------

  Make a sprite ease to the position of another sprite.
  Parameters: 
  a. A sprite object. This is the `follower` sprite.
  b. A sprite object. This is the `leader` sprite that the follower will chase.
  c. The easing value, such as 0.3. A higher number makes the follower move faster.

     gu.followEase(follower, leader, speed);

  Use it inside a game loop.
  */

  followEase(follower, leader, speed) {

    //Figure out the distance between the sprites
    /*
    let vx = (leader.x + leader.width / 2) - (follower.x + follower.width / 2),
        vy = (leader.y + leader.height / 2) - (follower.y + follower.height / 2),
        distance = Math.sqrt(vx * vx + vy * vy);
    */

    let vx = (leader.x + this._getCenter(leader, leader.width, "x")) - (follower.x + this._getCenter(follower, follower.width, "x")),
        vy = (leader.y + this._getCenter(leader, leader.height, "y")) - (follower.y + this._getCenter(follower, follower.height, "y")),
        distance = Math.sqrt(vx * vx + vy * vy);

    //Move the follower if it's more than 1 pixel
    //away from the leader
    if (distance >= 1) {
      follower.x += vx * speed;
      follower.y += vy * speed;
    }
  }

  /*
  followConstant
  ----------------

  Make a sprite move towards another sprite at a constant speed.
  Parameters: 
  a. A sprite object. This is the `follower` sprite.
  b. A sprite object. This is the `leader` sprite that the follower will chase.
  c. The speed value, such as 3. The is the pixels per frame that the sprite will move. A higher number makes the follower move faster.

     gu.followConstant(follower, leader, speed);

  */

  followConstant(follower, leader, speed) {

    //Figure out the distance between the sprites
    let vx = (leader.x + this._getCenter(leader, leader.width, "x")) - (follower.x + this._getCenter(follower, follower.width, "x")),
        vy = (leader.y + this._getCenter(leader, leader.height, "y")) - (follower.y + this._getCenter(follower, follower.height, "y")),
        distance = Math.sqrt(vx * vx + vy * vy);

    //Move the follower if it's more than 1 move
    //away from the leader
    if (distance >= speed) {
      follower.x += (vx / distance) * speed;
      follower.y += (vy / distance) * speed;
    }
  }

  /*
  angle
  -----

  Return the angle in Radians between two sprites.
  Parameters: 
  a. A sprite object.
  b. A sprite object.
  You can use it to make a sprite rotate towards another sprite like this:

      box.rotation = gu.angle(box, pointer);

  */

  angle(s1, s2) {
    return Math.atan2(
      //This is the code you need if you don't want to compensate
      //for a possible shift in the sprites' x/y anchor points
      /*
      (s2.y + s2.height / 2) - (s1.y + s1.height / 2),
      (s2.x + s2.width / 2) - (s1.x + s1.width / 2)
      */
      //This code adapts to a shifted anchor point
      (s2.y + this._getCenter(s2, s2.height, "y")) - (s1.y + this._getCenter(s1, s1.height, "y")),
      (s2.x + this._getCenter(s2, s2.width, "x")) - (s1.x + this._getCenter(s1, s1.width, "x"))
    );
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
  rotateAroundSprite
  ------------
  Make a sprite rotate around another sprite.
  Parameters:
  a. The sprite you want to rotate.
  b. The sprite around which you want to rotate the first sprite.
  c. The distance, in pixels, that the roating sprite should be offset from the center.
  d. The angle of rotations, in radians.

     gu.rotateAroundSprite(orbitingSprite, centerSprite, 50, angleInRadians);

  Use it inside a game loop, and make sure you update the angle value (the 4th argument) each frame.
  */

  rotateAroundSprite(rotatingSprite, centerSprite, distance, angle) {
    rotatingSprite.x
      = (centerSprite.x + this._getCenter(centerSprite, centerSprite.width, "x")) - rotatingSprite.parent.x
      + (distance * Math.cos(angle))
      - this._getCenter(rotatingSprite, rotatingSprite.width, "x");

    rotatingSprite.y
      = (centerSprite.y + this._getCenter(centerSprite, centerSprite.height, "y")) - rotatingSprite.parent.y
      + (distance * Math.sin(angle))
      - this._getCenter(rotatingSprite, rotatingSprite.height, "y");
  }

  /*
  rotateAroundPoint
  -----------------
  Make a point rotate around another point.
  Parameters:
  a. The point you want to rotate.
  b. The point around which you want to rotate the first point.
  c. The distance, in pixels, that the roating sprite should be offset from the center.
  d. The angle of rotations, in radians.

     gu.rotateAroundPoint(orbitingPoint, centerPoint, 50, angleInRadians);

  Use it inside a game loop, and make sure you update the angle value (the 4th argument) each frame.

  */

  rotateAroundPoint(pointX, pointY, distanceX, distanceY, angle) {
    let point = {};
    point.x = pointX + Math.cos(angle) * distanceX;
    point.y = pointY + Math.sin(angle) * distanceY;
    return point;
  }


  /*
  randomInt
  ---------

  Return a random integer between a minimum and maximum value
  Parameters: 
  a. An integer.
  b. An integer.
  Here's how you can use it to get a random number between, 1 and 10:

     let number = gu.randomInt(1, 10);

  */

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /*
  randomFloat
  -----------

  Return a random floating point number between a minimum and maximum value
  Parameters: 
  a. Any number.
  b. Any number.
  Here's how you can use it to get a random floating point number between, 1 and 10:

      let number = gu.randomFloat(1, 10);

  */

  randomFloat(min, max) {
    return min + Math.random() * (max - min);
  }

  /*
  Wait
  ----

  Lets you wait for a specific number of milliseconds before running the
  next function. 
   
    gu.wait(1000, runThisFunctionNext());
  
  */

  wait(duration, callBack) {
    setTimeout(callBack, duration);
  }

  /*
  Move
  ----

  Move a sprite by adding it's velocity to it's position. The sprite 
  must have `vx` and `vy` values for this to work. You can supply a
  single sprite, or a list of sprites, separated by commas.

      gu.move(sprite);
  */

  move(...sprites) {

    //Move sprites that's aren't in an array
    if (!(sprites[0] instanceof Array)) {
      if (sprites.length > 1) {
        sprites.forEach(sprite  => {
          sprite.x += sprite.vx;
          sprite.y += sprite.vy;
        });
      } else {
        sprites[0].x += sprites[0].vx;
        sprites[0].y += sprites[0].vy;
      }
    }

    //Move sprites in an array of sprites
    else {
      let spritesArray = sprites[0];
      if (spritesArray.length > 0) {
        for (let i = spritesArray.length - 1; i >= 0; i--) {
          let sprite = spritesArray[i];
          sprite.x += sprite.vx;
          sprite.y += sprite.vy;
        }
      }
    }
  }


  /*
  World camera
  ------------

  The `worldCamera` method returns a `camera` object
  with `x` and `y` properties. It has
  two useful methods: `centerOver`, to center the camera over
  a sprite, and `follow` to make it follow a sprite.
  `worldCamera` arguments: worldObject, theCanvas
  The worldObject needs to have a `width` and `height` property.
  */

  worldCamera(world, worldWidth, worldHeight, canvas) {

    //Define a `camera` object with helpful properties
    let camera = {
      width: canvas.width,
      height: canvas.height,
      _x: 0,
      _y: 0,

      //`x` and `y` getters/setters
      //When you change the camera's position,
      //they shift the position of the world in the opposite direction
      get x() {
        return this._x;
      },
      set x(value) {
        this._x = value;
        world.x = -this._x;
        //world._previousX = world.x;
      },
      get y() {
        return this._y;
      },
      set y(value) {
        this._y = value;
        world.y = -this._y;
        //world._previousY = world.y;
      },

      //The center x and y position of the camera
      get centerX() {
        return this.x + (this.width / 2);
      },
      get centerY() {
        return this.y + (this.height / 2);
      },

      //Boundary properties that define a rectangular area, half the size
      //of the game screen. If the sprite that the camera is following
      //is inide this area, the camera won't scroll. If the sprite
      //crosses this boundary, the `follow` function ahead will change
      //the camera's x and y position to scroll the game world
      get rightInnerBoundary() {
        return this.x + (this.width / 2) + (this.width / 4);
      },
      get leftInnerBoundary() {
        return this.x + (this.width / 2) - (this.width / 4);
      },
      get topInnerBoundary() {
        return this.y + (this.height / 2) - (this.height / 4);
      },
      get bottomInnerBoundary() {
        return this.y + (this.height / 2) + (this.height / 4);
      },

      //The code next defines two camera 
      //methods: `follow` and `centerOver`

      //Use the `follow` method to make the camera follow a sprite
      follow: function(sprite) {

        //Check the sprites position in relation to the inner
        //boundary. Move the camera to follow the sprite if the sprite 
        //strays outside the boundary
        if(sprite.x < this.leftInnerBoundary) {
          this.x = sprite.x - (this.width / 4);
        }
        if(sprite.y < this.topInnerBoundary) {
          this.y = sprite.y - (this.height / 4);
        }
        if(sprite.x + sprite.width > this.rightInnerBoundary) {
          this.x = sprite.x + sprite.width - (this.width / 4 * 3);
        }
        if(sprite.y + sprite.height > this.bottomInnerBoundary) {
          this.y = sprite.y + sprite.height - (this.height / 4 * 3);
        }

        //If the camera reaches the edge of the map, stop it from moving
        if(this.x < 0) {
          this.x = 0;
        }
        if(this.y < 0) {
          this.y = 0;
        }
        if(this.x + this.width > worldWidth) {
          this.x = worldWidth - this.width;
        }
        if(this.y + this.height > worldHeight) {
          this.y = worldHeight - this.height;
        }
      },

      //Use the `centerOver` method to center the camera over a sprite
      centerOver: function(sprite) {

        //Center the camera over a sprite
        this.x = (sprite.x + sprite.halfWidth) - (this.width / 2);
        this.y = (sprite.y + sprite.halfHeight) - (this.height / 2);
      }
    };
    
    //Return the `camera` object 
    return camera;
  };

  /*
  Line of sight
  ------------

  The `lineOfSight` method will return `true` if there’s clear line of sight 
  between two sprites, and `false` if there isn’t. Here’s how to use it in your game code:

      monster.lineOfSight = gu.lineOfSight(
          monster, //Sprite one
          alien,   //Sprite two
          boxes,   //An array of obstacle sprites
          16       //The distance between each collision point
      );

  The 4th argument determines the distance between collision points. 
  For better performance, make this a large number, up to the maximum 
  width of your smallest sprite (such as 64 or 32). For greater precision, 
  use a smaller number. You can use the lineOfSight value to decide how 
  to change certain things in your game. For example:

      if (monster.lineOfSight) {
        monster.show(monster.states.angry)
      } else {
        monster.show(monster.states.normal)
      }

  */

  lineOfSight(
    s1, //The first sprite, with `centerX` and `centerY` properties
    s2, //The second sprite, with `centerX` and `centerY` properties
    obstacles, //An array of sprites which act as obstacles
    segment = 32 //The distance between collision points
  ) {

  //Calculate the center points of each sprite
  spriteOneCenterX = s1.x + this._getCenter(s1, s1.width, "x");
  spriteOneCenterY = s1.y + this._getCenter(s1, s1.height, "y");
  spriteTwoCenterX = s2.x + this._getCenter(s2, s2.width, "x");
  spriteTwoCenterY = s2.y + this._getCenter(s2, s2.height, "y");

  //Plot a vector between spriteTwo and spriteOne
  let vx = spriteTwoCenterX - spriteOneCenterX,
    vy = spriteTwoCenterY - spriteOneCenterY;

  //Find the vector's magnitude (its length in pixels)
  let magnitude = Math.sqrt(vx * vx + vy * vy);

  //How many points will we need to test?
  let numberOfPoints = magnitude / segment;

  //Create an array of x/y points, separated by 64 pixels, that
  //extends from `spriteOne` to `spriteTwo`  
  let points = () => {

    //Initialize an array that is going to store all our points
    //along the vector
    let arrayOfPoints = [];

    //Create a point object for each segment of the vector and 
    //store its x/y position as well as its index number on
    //the map array 
    for (let i = 1; i <= numberOfPoints; i++) {

      //Calculate the new magnitude for this iteration of the loop
      let newMagnitude = segment * i;

      //Find the unit vector. This is a small, scaled down version of
      //the vector between the sprites that's less than one pixel long.
      //It points in the same direction as the main vector, but because it's
      //the smallest size that the vector can be, we can use it to create
      //new vectors of varying length
      let dx = vx / magnitude,
        dy = vy / magnitude;

      //Use the unit vector and newMagnitude to figure out the x/y
      //position of the next point in this loop iteration
      let x = spriteOneCenterX + dx * newMagnitude,
        y = spriteOneCenterY + dy * newMagnitude;

      //Push a point object with x and y properties into the `arrayOfPoints`
      arrayOfPoints.push({
        x, y
      });
    }

    //Return the array of point objects
    return arrayOfPoints;
  };

  //Test for a collision between a point and a sprite
  let hitTestPoint = (point, sprite) => {

    //Find out if the point's position is inside the area defined
    //by the sprite's left, right, top and bottom sides
    let left = point.x > sprite.x,
      right = point.x < (sprite.x + sprite.width),
      top = point.y > sprite.y,
      bottom = point.y < (sprite.y + sprite.height);

    //If all the collision conditions are met, you know the
    //point is intersecting the sprite
    return left && right && top && bottom;
  };

  //The `noObstacles` function will return `true` if all the tile
  //index numbers along the vector are `0`, which means they contain 
  //no obstacles. If any of them aren't 0, then the function returns
  //`false` which means there's an obstacle in the way 
  let noObstacles = points().every(point => {
    return obstacles.every(obstacle => {
      return !(hitTestPoint(point, obstacle))
    });
  });

  //Return the true/false value of the collision test
  return noObstacles;
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

    this.gu = new GameUtilities();
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
  
 
  /*
  getAngleBetweenSprites(r1,r2) {
    return this.gu.angle(r1,r2);
  }*/
  

  getDistanceBetweenSprites(r1, r2) {
    return this.gu.distance(r1,r2);
  }
  /*
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

  */

  /*
  CheckDistanceBetweenSprites(r1,r2) {
    let returnData = {
      distance: this.gu.distance(r1,r2),
      angle: (this.gu.angle(r1,r2) * 180 / Math.PI) * -1
    };
    return returnData;
  }

  */

  
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

    this.currentDisplay = {
      sprites :  "", 
      predators : "", 
      food : "",
      iteration : "",
      generationNumber : "", 
      generationStats : ""
    };

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

    if (this.sprites != sprites || this.predators != predators || this.food != food || 
      this.generationNumber != generationNumber || this.generationStats || generationStats) { 
    this.uiTextInfo.text = "Generation N° : " + generationNumber + " - Iteration N° : " + iteration +
      " - Best Generation Fitness : " + generationStats.BestFitness + " - [ #Food : " + food + " - #Survivors : " +
      sprites + " - #Predators: " + predators + " ]";
      }
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

/* eslint-disable */
class UiControls {

  constructor(app) {

    this.buttons = [];

    this.AButton(); //Add Creature
    this.BButton(); //Show Energy
    this.CButton(); //Show Vision Range
    this.DButton(); //Show Lineage
    this.EButton(); //Add human controlled
    //this.FButton(); //Show Worse
    this.GButton(); //Add Predator

    this.buttonGroupPositionx = 100;
    this.buttonGroupPositiony = 150;

  }

  AButton() {

    let opt = {
      buttonType: Constants.button.buttonType.rectangleButton,
      x: app.screen.width - 100,
      y: app.screen.height / 2 - 65,
      width: 120,
      height: 25,
      radius: 25,
      name: "button-add-creature",
      event: "addCreature",
      eventFunction: function(world) {
        console.log("ButtonA Handler");
        world.initSurvivors(1);
      }
    }

    this.aButton = new Button(opt);

    this.aButton.setText("Add Creature");
    this.buttons.push(this.aButton);
    app.stage.addChild(this.aButton);

  }

  BButton() {

    let opt = {
      buttonType: Constants.button.buttonType.rectangleButton,
      x: app.screen.width - 100,
      y: app.screen.height / 2 + 5,
      width: 120,
      height: 25,
      radius: 25,
      name: "button-show-energy-bar",
      event: "showEnergyBar",
      eventFunction: function(world) {
        console.log("ButtonB Handler");
        world.showEnergyBarEventHandler();
      }
    }

    this.bButton = new Button(opt);
    this.bButton.setText("Show Energy Bar");
    this.buttons.push(this.bButton);
    app.stage.addChild(this.bButton);
  }

  CButton() {

    let opt = {
      buttonType: Constants.button.buttonType.rectangleButton,
      x: app.screen.width - 100,
      y: app.screen.height / 2 + 40,
      width: 120,
      height: 25,
      radius: 25,
      name: "button-show-vision-range",
      event: "showVisionRange",
      eventFunction: function(world) {
        console.log("ButtonC Handler");
        world.showVisionRangeHandler();
      }
    }

    this.cButton = new Button(opt);
    this.cButton.setText("Show Vision Range");
    this.buttons.push(this.cButton);
    app.stage.addChild(this.cButton);
  }

  DButton() {

    let opt = {
      buttonType: Constants.button.buttonType.rectangleButton,
      x: app.screen.width - 100,
      y: app.screen.height / 2 + 75,
      width: 120,
      height: 25,
      radius: 25
    }

    this.dButton = new Button(opt);
    this.dButton.setText("Show Lineage");
    this.buttons.push(this.dButton);
    app.stage.addChild(this.dButton);
  }

  EButton() {

    let opt = {
      buttonType: Constants.button.buttonType.rectangleButton,
      x: app.screen.width - 100,
      y: app.screen.height / 2 + 110,
      width: 120,
      height: 25,
      radius: 25,
      name: "button-spawn-human-controlled-creature",
      event: "spawnHumanControlledCreature",
      eventFunction: function(world) {
        world.spawnHumanControlledCreatureHandler();
      }
    }

    this.eButton = new Button(opt);
    this.eButton.setText("Spawn Human Controlled");
    this.buttons.push(this.eButton);
    app.stage.addChild(this.eButton);
  }

  FButton() {

    let opt = {
      buttonType: Constants.button.buttonType.rectangleButton,
      x: app.screen.width - 100,
      y: app.screen.height / 2 + 145,
      width: 120,
      height: 25,
      radius: 25
    }

    this.fButton = new Button(opt);
    this.fButton.setText("Show Worse Creature");
    this.buttons.push(this.fButton);
    app.stage.addChild(this.fButton);
  }

  GButton() {

    let opt = {
      buttonType: Constants.button.buttonType.rectangleButton,
      x: app.screen.width - 100,
      y: app.screen.height / 2 - 30,
      width: 120,
      height: 25,
      radius: 25,
      name: "button-add-predator",
      event: "addPredator",
      eventFunction: function(world) {
        world.initPredators(1);
      }
    }

    this.gButton = new Button(opt);
    this.gButton.setText("Add Predator");
    this.buttons.push(this.gButton);
    app.stage.addChild(this.gButton);
  }

  processEvents(data) {
    this.handleButtonEvents(data);
  }

  handleButtonEvents(data) {
    for (let i = 0; i < this.buttons.length; i++) {
      let processed = [];
      for (const key in this.buttons[i].eventListeners) {
        //let values = this.buttons[i].eventListeners[key];
        for (let v in this.buttons[i].eventListeners[key]) {
          EventHandler.registerEventHandler(this.buttons[i].event, this.buttons[i].name, this.buttons[i].eventFunction);
          EventHandler.execute(this.buttons[i].event, this.buttons[i].name, data);
          processed.push(key);
        }
      }

      for (let j = 0; j < processed.length; j++) {
        this.buttons[i].clearEventListener(processed[j]);
      }
    }
  }

  showScene() {
    for (let b in this.buttons) {
      this.buttons[b].alpha = 0.5;
    }
  }

  hideScene() {
    for (let b in this.buttons) {
      this.buttons[b].alpha = 0;
    }
  }
}

/*eslint-disable*/
class World {
  constructor(app, b) {

    //app.stage.filters = [ new PIXI.filters.OldFilmFilter(0)];
    //app.stage.scale.x = 1.5;
    //app.stage.scale.y = 1.5;
    // global : create an array to store all the sprites and information
    this.survivorsInfo = [];
    this.childInfo = [];
    this.predatorsInfo = [];
    this.foodInfo = [];
    this.targetMateLineInfo = [];
    this.debugInfo = [];
    this.creatureHudInfo = [];
    this.bestSurvivorInfo = [];

    this.b = b; //bump

    //var totalSurvivors = app.renderer instanceof PIXI.WebGLRenderer ? 10000 : 100;
    this.totalSurvivors = config.world.survivors;
    this.totalPredators = config.world.predators;
    this.totalFood = config.world.food;

    //collect status
    this.deadSurvivors = [];
    this.generationStats = [];
    this.generationStats.push({ BestsurvivorId: -1, WorsesurvivorId: -1, BestFitness: -1, WorseFitness: -1 });


    if (config.app.highendGPU) {
      this.survivorsContainer = new PIXI.Container(10000, {
        scale: true,
        position: true,
        rotation: true,
        uvs: true,
        alpha: true
      });
    }
    else
    {
      this.survivorsContainer = new PIXI.ParticleContainer(10000, {
        scale: true,
        position: true,
        rotation: true,
        uvs: true,
        alpha: true
      });
    }

    //app.stage.addChild(this.survivorsContainer);

    this.predatorsContainer = new PIXI.particles.ParticleContainer(100, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    //app.stage.addChild(this.predatorsContainer);

    this.foodContainer = new PIXI.particles.ParticleContainer(1000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    //app.stage.addChild(this.foodContainer);

    this.debugContainer = new PIXI.particles.ParticleContainer(1000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    //app.stage.addChild(this.debugContainer);

    this.creatureHudContainer = new PIXI.Container(1000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    })
    //app.stage.addChild(this.creatureHudContainer);

    this.showEnergyBar = false;

    this.targetMateLineContainer = new PIXI.ParticleContainer(1000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    this.bestSurvivorCointainer = new PIXI.ParticleContainer(1000, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });

    //app.stage.addChild(this.targetMateLineContainer);

    this.containers = {
      predatorsContainer: this.predatorsContainer,
      survivorsContainer: this.survivorsContainer,
      foodContainer: this.foodContainer,
      debugContainer: this.debugContainer,
      creatureHudContainer: this.creatureHudContainer,
      targetMateLineContainer: this.targetMateLineContainer,
      bestSurvivorCointainer : this.bestSurvivorCointainer
    };

    this.worldInfo = {
      survivorsInfo: this.survivorsInfo,
      childInfo: this.childInfo,
      predatorsInfo: this.predatorsInfo,
      foodInfo: this.foodInfo,
      debugInfo: this.debugInfo,
      creatureHudInfo: this.creatureHudInfo,
      targetMateLineInfo: this.targetMateLineInfo,
      bestSurvivorInfo : this.bestSurvivorInfo,
      deadSurvivors: this.deadSurvivors
    };

    this.viewport = new Viewport.Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: config.app.width,
      worldHeight: config.app.height,
  
      interaction: app.renderer.plugins.interaction
    });


    this.viewport.addChild(this.containers.survivorsContainer);
    this.viewport.addChild(this.containers.foodContainer);
    this.viewport.addChild(this.containers.predatorsContainer);
    this.viewport.addChild(this.containers.creatureHudContainer);
    this.viewport.addChild(this.containers.bestSurvivorCointainer);
    
    this.viewport
    .drag()
    .pinch()
    .wheel()
    .decelerate()

    app.stage.addChild(this.viewport);
    this.viewport.setZoom(0.8,true);

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
        //screenWidth: app.screen.width,
        //screenHeight: app.screen.height
        screenWidth: config.app.width,//app.screen.width,
        screenHeight: config.app.height//app.screen.height,
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
        isHumanControlled: false,
        i: i,
        //sprite: survivorSprite.Init(app.screen.width, app.screen.height)
        sprite: SpriteFactory.create("SurvivorSprite", {
            screenWidth: config.app.width,//app.screen.width,
            screenHeight: config.app.height,//app.screen.height,
            i: i,
            isHumanControlled :false
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

    //TODO: Que no sean arreglos
    for (var i = 0; i < population.length; i++) {
      //let p = new Survivor(PIXI).Init(this.survivorsInfo.length,population[i], app);

      let opt = {
        PIXI: PIXI,
        dna: population[i],
        isHumanControlled: population[i].isHumanControlled,
        i: this.survivorsInfo.length,
        //sprite: survivorSprite.Init(app.screen.width, app.screen.height)
        sprite: SpriteFactory.create("SurvivorSprite", {
            screenWidth: app.screen.width,
            screenHeight: app.screen.height,
            i: this.survivorsInfo.length,
            isHumanControlled : population[i].isHumanControlled
          })
          .getSprite()
      }

      let p = CreatureFactory.create("Survivor", opt);

      this.survivorsInfo.push(p);
      this.survivorsContainer.addChild(p.sprite);
      //add children uid to parents childrens list
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

  
/**
 * Add Debug information to screen
 * @param {Survivor} survivor 
 */
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
  
    /****** CREATURE HUD */

  addCreatureHudInformation(survivor) {

    let hudTextInfo = new EnergyBarSprite({ app: app, survivor: survivor });
    this.creatureHudContainer.addChild(hudTextInfo);
    this.creatureHudInfo.push(hudTextInfo);
  }

  updateCreatureHudInformation() {

    if (this.showEnergyBar) {
    for (let i = 0; i < this.creatureHudInfo.length; i++) {
      let surv = this.survivorsInfo.find(o => o.uid == this.creatureHudInfo[i].uid);
      if (surv) {
        this.creatureHudInfo[i].setEnergyBar(surv, helper.getEnergyBar(surv.collectStats()
          .energy));
      }
    }
  }
    /*
    if (debugModeOn) {
      this.creatureHudContainer.alpha = 0.5;
    } else {
      this.creatureHudContainer.alpha = 0;
    }
    */

    if (this.showEnergyBar)
      this.creatureHudContainer.alpha = 0.5;
    else
      this.creatureHudContainer.alpha = 0;

  }

  /**** END CREATURE HUD */

  /**** LINEAGE */
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

  clearChildrenTreeLine(survivor) {
    let currentLine = this.targetMateLineInfo.find(o => o.uid == survivor.uid);
    if (currentLine) {
      currentLine.clear();
      this.targetMateLineContainer.removeChild(currentLine);
      this.targetMateLineInfo = this.targetMateLineInfo.filter(o => o.uid !== currentLine.uid);
    }
  }

  /**** END LINEAGE */

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
   * Process Predator logic and events
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
   * Process Survivor logic and events
   */
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
          let nearFoodArray = this.survivorsInfo[i].findFood(this.foodInfo);

          //sobreviviente comio?
          if (nearFoodArray.length > 0) {
            let survivorEating = this.b.hit(
              this.survivorsInfo[i].sprite, nearFoodArray, false, false, false,
              function(collision, food) {
                if (collision != undefined) {  
                  if (!food.eated) {
                    food.eated = true;
                    this.foodContainer.removeChild(food);
                    //this.foodInfo.splice(food.idx, 1);
                    this.foodInfo = this.foodInfo.filter(o => o.uid !== food.uid);
                    this.survivorsInfo[i].eat();
                    //console.log("survivor #" + this.survivorsInfo[i].idx + " - Comidos: " + this.survivorsInfo[i].numBugEated);
                  }
              }
              }.bind(this)
            );
          }

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
              if (this.survivorsInfo[i].isHumanControlled || son.isHumanControlled) {
                son.isHumanControlled = true;
              }
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

        //Move
        this.survivorsInfo[i].move();

        //TODO REVISAR SI L HABILITO
        //this.survivorsInfo[i].WrapContainer();

      }

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
    this.bestSurvivorCointainer.removeChild(survivor.sprite);

    this.deadSurvivors.push(this.survivorsInfo.find(o => o.uid == survivor.uid));
    this.survivorsInfo = this.survivorsInfo.filter(o => o.uid !== survivor.uid)
    this.debugInfo = this.debugInfo.filter(o => o.uid !== survivor.uid);
    this.bestSurvivorInfo = this.bestSurvivorInfo.filter(o => o.uid !== survivor.uid);
    this.creatureHudInfo = this.creatureHudInfo.filter(o => o.uid !== survivor.uid);
    this.clearChildrenTreeLine(survivor);
  }

  /**
   * Calculate fitness and evaluate generation
   */
  evaluateGeneration() {

    var survivorsOrderedInfo = [];

    //ordenado de menor a mayor
    survivorsOrderedInfo = _.sortBy(_.union(this.survivorsInfo, this.deadSurvivors), "numBugEated");
    //survivorsOrderedInfo = _.sortBy(this.survivorsInfo, "numBugEated");

    let lastIdx = survivorsOrderedInfo.length;

    var thisGen = {
      BestsurvivorId: 0,
      WorsesurvivorId: 0,
      BestFitness: 0,
      WorseFitness: 0
    };

    if (lastIdx > 0) {
      thisGen = {
        BestsurvivorId: survivorsOrderedInfo[lastIdx - 1].collectStats()
          .uid,
        WorsesurvivorId: survivorsOrderedInfo[0].collectStats()
          .uid,
        BestFitness: survivorsOrderedInfo[lastIdx - 1].collectStats()
          .numBugEated,
        WorseFitness: survivorsOrderedInfo[0].collectStats()
          .numBugEated
      };
      //showBest
      let srv = this.survivorsInfo.find(o=>o.uid == thisGen.BestsurvivorId);
      if (srv)
        this.showBestSurvivor(srv);
    }

    //console.dir(survivorsOrderedInfo);
    this.generationStats.push(thisGen);

  }

  updateBestSurvivorInformation() {

    if (this.bestSurvivorInfo.length > 0) {
      let lastIdx = this.bestSurvivorInfo.length - 1;
      let surv = this.survivorsInfo.find(o => o.uid == this.bestSurvivorInfo[lastIdx].uid);
      if (surv) {
        this.bestSurvivorInfo[lastIdx].x = surv.sprite.x;
        this.bestSurvivorInfo[lastIdx].y = surv.sprite.y;
      }
    }
    
  }

  /** to show best Survivor */
  showBestSurvivor(survivor) {
    let srv = this.bestSurvivorInfo.find(o=> o.uid == survivor.uid);
    if (srv == undefined) {
      let spt = SpriteFactory.create("SelectedSprite", {
      uid : survivor.uid,
      screenWidth: app.screen.width,
      screenHeight: app.screen.height,
      radius : 12,
      x : survivor.sprite.x,
      y : survivor.sprite.y,
      i: this.bestSurvivorInfo.length,
      selectionType : Constants.selectionTypes.CIRCLE,
      hasText : true,
      text : "best"
    });

    for (let i= 0; i<this.bestSurvivorInfo.length; i++) {
      let rem = this.bestSurvivorCointainer.removeChild(this.bestSurvivorInfo[i]);
      if (rem)
        console.log("Removed : " + rem.uid);
    }
    
    
    //this.bestSurvivorInfo = [];
    this.bestSurvivorInfo.push(spt);
    this.bestSurvivorCointainer.addChild(spt);
    
  }
    
  }

  spawnHumanControlledCreatureHandler() {
    

    let population = [];

    let opt = {
      PIXI: PIXI,
      dna: population[0],
      isHumanControlled: true,
      i: this.survivorsInfo.length,
      //sprite: survivorSprite.Init(app.screen.width, app.screen.height)
      sprite: SpriteFactory.create("SurvivorSprite", {
          screenWidth: app.screen.width,
          screenHeight: app.screen.height,
          i: this.survivorsInfo.length,
          isHumanControlled :true
        })
        .getSprite()
    }

    let p = CreatureFactory.create("Survivor", opt);

    this.survivorsInfo.push(p);
    this.survivorsContainer.addChild(p.sprite);
    this.addDebugInfo(p);
    this.addReproductionTargetLine(p);
    this.addCreatureHudInformation(p);


    app.stage.interactive = true;

  }

  


  /* EVENT HANDLERS */

  showEnergyBarEventHandler() {

    this.showEnergyBar = !this.showEnergyBar;

    if (this.showEnergyBar)
      this.creatureHudContainer.alpha = 0.5;
    else
      this.creatureHudContainer.alpha = 0;

  }

  showVisionRangeHandler() {
    debugModeOn = !debugModeOn
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
      console.error(classname + " is not instance of CustomSprite");
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
    width: 2000,
    height: 2000,
    autoSize: true,
    visual: {
      bgcolor: "0X022a31"
    },
    highendGPU : false //to enable / disable filters that affects FPS
  },
  world: {
    food: 300,
    predators: 3,
    survivors: 30,
    maxFoodGenerationRatio: 150,
    foodRegenerationThreshold: 0.15, // % of max food to regenerate food
    maxFood: 500,
    maxSurvivors: 100,
    maxSurvivorsGenerationRatio : 30,
    survivorsRegenerationThreshold : 0.30,
    maxPredators: 3

  },
  evolution: {
    generationLimit: 3,
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
    selectionTypes : {
      CIRCLE : "CIRCLE",
      RECTANGLE : "RECTANGLE",
      SQUARE : "SQUARE"
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
      ORANGE: 0xFC6600,
      BLACK : 0X000000,
      YELLOW : 0XFFFF00	
    },
    simulationStates: {
      RUN: "run",
      SPLASH: "splash",
      STOPPED: "stopped",
      ROTATION: "rotation"
    },
    button: {
      buttonType: {
        rectangleButton: 1,
        circleButton: 2
      },
      buttonColor : {
        mouseOver: 0XCC9999,
        mouseOut: 0XFFFFFF,
        click: 0XCC6666
      }
    }
  }
class CustomSprite extends PIXI.Sprite {
  constructor(opt) {
    super();
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
      };

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
    };

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

    //TODO : change this for config.app.worldsize
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
  }

  getBounds() {

    let foodBoundsPadding = 200;
    let foodBounds = new PIXI.Rectangle(
      -foodBoundsPadding,
      -foodBoundsPadding,
      (this.appScreenWidth) + foodBoundsPadding * 2,
      (this.appScreenHeight) + foodBoundsPadding * 2
    );

    return foodBounds;
  }

}

class EnergyBarSprite extends PIXI.Text {
  constructor(opt) {
    super("E: 100%", {
      fontWeight: 'bold',
      //fontStyle: 'italic',
      fontSize: 10,
      fontFamily: 'Arvo',
      fill: '#FFFFFF',
      align: 'left',
      //stroke: '#a4410e',
      strokeThickness: 1
    });

    this.appScreenWidth;
    this.appScreenHeight;
    this.init(opt);
  }

  init(opt) {

    this.appScreenWidth = opt.screenWidth;
    this.appScreenHeight = opt.screenHeight;
    this.text = helper.getEnergyBar(opt.survivor.collectStats()
      .energy);
    this.uid = opt.survivor.uid;
    this.x = opt.survivor.x;
    this.y = opt.survivor.y;
    this.visible = true;
    this.alpha = 1;
  }

  setEnergyBar(sprite) {
    this.uid = sprite.uid;
    this.x = sprite.x - 10;
    this.y = sprite.y - 20;
    this.text = helper.getEnergyBar(sprite.collectStats()
      .energy);
  }

  toggleEnergyBar() {
    this.visible = !this.visible;
    this.alpha = 0;

    /*
    //TODO: solo para debug
    if (this.visible)
      this.alpha = 1;
    if (!this.visible)
      this.alpha = 1;
      */
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
  }

  setParameters() {
    this.sprite.anchor.set(0.5);
    this.sprite.scale.set(0.8 + Math.random() * 0.3);
    this.sprite.dudeBounds = this.getBounds();
    this.sprite.tint = Constants.colors.WHITE;
    this.sprite.direction = Math.random() * Math.PI * 2;
    this.sprite.offset = Math.random() * 100;
    this.sprite.appScreenWidth = this.appScreenWidth;
    this.sprite.appScreenHeight = this.appScreenHeight;
  }

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
    this.isHumanControlled = (  opt.isHumanControlled && opt.isHumanControlled == true) ? true : false;

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

    if (this.isHumanControlled) {
      this.sprite.tint = Constants.colors.YELLOW;
      this.sprite.filters = [new PIXI.filters.GlowFilter(5, 2, 1, Constants.colors.YELLOW, 0.5)];
    }
    else {
      this.sprite.filters = [new PIXI.filters.GlowFilter(5, 2, 1, Constants.colors.WHITE, 0.5)];
    }

    
  }
}

/* eslint-disable */
class SelectedSprite extends CustomSprite {

  constructor(opt) {
    super(opt);

    
    this.radius = opt.radius;
    this.uid = opt.uid; 

    this.init(opt);

  }

  init(opt) {

    let gfx = new PIXI.Graphics();

    // set the x, y and anchor
    this.x = opt.x;
    this.y = opt.y;
    this.anchor.set(0.5);

    switch (opt.selectionType) {
      case Constants.selectionTypes.RECTANGLE:
        throw new error ("Not implemented yet");
        break;
      case Constants.selectionTypes.CIRCLE:
        this.texture = this.circleSelection(gfx);
        break;
      default:
        console.log("SelectionType not defined, using default circle");
        this.texture = this.circleSelection(gfx);
    }


    

    // create the text object

    if (opt.hasText) {
      this.text = new PIXI.Text("", 'arial');
      this.text.anchor = new PIXI.Point(0.5, 0.5);
      this.addChild(this.text);
      this.setText(opt.text, null);
    }


  }

  circleSelection(gfx) {
    //gfx.beginFill(0xFFFF0B, 0.2);
    gfx.lineStyle(1, Constants.colors.YELLOW, 1);
    gfx.drawCircle(this.x, this.y, this.radius);
    //gfx.endFill();
    return gfx.generateTexture();
  }


  

  setText(val, style) {

    // Set text to be the value passed as a parameter
    this.text.text = val;
    // Set style of text to the style passed as a parameter
    if (style) {
      this.text.style = style;
    } else {
      this.text.style = new PIXI.TextStyle({
        fontFamily: 'Arial', // Font Family
        fontSize: 10, // Font Size
        //fontStyle: 'italic',// Font Style
        //fontWeight: 'bold', // Font Weight
        fill: [Constants.colors.BLACK], // gradient
        //fill: ['#ffffff', '#F8A9F9'], // gradient
        //stroke: '#4a1850',
        //strokeThickness: 5,
        //dropShadow: true,
        //dropShadowColor: '#000000',
        //dropShadowBlur: 4,
        //dropShadowAngle: Math.PI / 6,
        //dropShadowDistance: 6,
        //wordWrap: true,
        //wordWrapWidth: 150
      });
    }

  }

}

/* eslint-disable */
class Button extends CustomSprite {

  constructor(opt) {
    super(opt);

    this.x = opt.x;
    this.y = opt.y;
    this.buttonWidth = opt.width;
    this.buttonHeight = opt.height;
    this.radius = opt.radius;
    this.init(opt.buttonType);

    this.name = opt.name; //buttonId
    this.event = opt.event; //execution - purpose
    this.eventFunction = opt.eventFunction;

    this.eventListeners = {
      'click': [],
      'tap': [],
      'pointerDown': [],
      'pointerUp': []
    }

  }

  addEventListener(eventName, callback) {
    this.eventListeners[eventName].push(callback);
  }

  clearEventListener(eventName) {
    this.eventListeners[eventName] = [];
  }

  circleButton(gfx) {
    gfx.beginFill(Constants.button.buttonColor.mouseOut, 1);
    gfx.drawCircle(0, 0, this.radius);
    gfx.endFill();
    return gfx.generateCanvasTexture();
  }

  rectangleButton(gfx) {
    gfx.beginFill(Constants.button.buttonColor.mouseOut, 1);
    gfx.drawRoundedRect(0, 0, this.buttonWidth, this.buttonHeight, this.buttonHeight / 5);
    gfx.endFill();
    return gfx.generateCanvasTexture();
  }

  init(bt) {

    let gfx = new PIXI.Graphics();

    // generate the texture
    if (bt == Constants.button.buttonType.rectangleButton) {
      this.texture = this.rectangleButton(gfx);
    } else if (bt == Constants.button.buttonType.circleButton) {
      this.texture = this.circleButton(gfx);
    } else {
      console.log("ButtonType not defined, using default rectangle button");
      this.texture = this.rectangleButton(gfx);
    }

    // set the x, y and anchor
    //this.x = x;
    //this.y = y;
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;

    // create the text object

    this.text = new PIXI.Text("", 'arial');
    this.text.anchor = new PIXI.Point(0.5, 0.5);

    this.addChild(this.text);

    this.setBehavior();

  }

  setBehavior() {

    // set the interactivity to true and assign callback functions
    this.interactive = true;

    this.on("click", function() {
      this.tint = Constants.button.buttonColor.click;
    });

    this.on("tap", function() {
      //console.log("tap");
    });

    this.on("pointerdown", function() {
      this.isdown = true;
      this.tint = Constants.button.buttonColor.click;

      this.addEventListener("pointerUp", {
        isOver: this.isOver,
        isdown: this.isdown
      });

    });

    this.on("pointerup", function() {
      this.isdown = false;
      if (this.isOver) {
        this.tint = Constants.button.buttonColor.mouseOver;
      } else {
        this.tint = Constants.button.buttonColor.mouseOut;
      }
    });

    this.on("pointerover", function() {
      this.isOver = true;
      if (this.isdown) {
        return;
      }
      this.tint = Constants.button.buttonColor.mouseOver;
    });

    this.on("pointerout", function() {
      //console.log("pointerout");

      this.isOver = false;
      if (this.isdown) {
        return;
      }
      this.tint = Constants.button.buttonColor.mouseOut;
    });

  }

  setText(val, style) {

    // Set text to be the value passed as a parameter
    this.text.text = val;
    // Set style of text to the style passed as a parameter
    if (style) {
      this.text.style = style;
    } else {
      this.text.style = new PIXI.TextStyle({
        fontFamily: 'Arial', // Font Family
        fontSize: 10, // Font Size
        //fontStyle: 'italic',// Font Style
        //fontWeight: 'bold', // Font Weight
        fill: [Constants.colors.BLACK], // gradient
        //fill: ['#ffffff', '#F8A9F9'], // gradient
        //stroke: '#4a1850',
        //strokeThickness: 5,
        //dropShadow: true,
        //dropShadowColor: '#000000',
        //dropShadowBlur: 4,
        //dropShadowAngle: Math.PI / 6,
        //dropShadowDistance: 6,
        //wordWrap: true,
        //wordWrapWidth: 150
      });
    }

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
};

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
    this.isHumanControlled = opt.isHumanControlled;

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

    return;
    
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
          //TODO: Breack cycle
          break;
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
    let nearFoodArray = [];

    /*
    if (this.isHumanControlled)
      return nearFoodArray;
    */

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

          nearFoodArray.push(foodInfo[j]);

          if (nearFoodArray.length > 3)
            break;
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

    return nearFoodArray;

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

    if (!this.reproductionStatus.isCopuling) {
      if (this.isHumanControlled) {
        let mousePosition = app.renderer.plugins.interaction.mouse.global;
        //let mousePosition = app.renderer.plugins.interaction.mouse.getLocalPosition(mp);
        app.renderer.plugins.interaction.mouse.reset();
        let r1 = {
          x : mousePosition.x,
          y : mousePosition.y
        };
  
        this.setDirection(helper.getAngleBetweenSprites(r1, this.sprite));
        this.sprite.rotation = this.sprite.direction + Math.PI/2;
        
        
        //let x = this.sprite.x + Math.sin(this.sprite.direction) * (this.speed); //* sprite.scale.y);
        //let y = this.sprite.y + Math.cos(this.sprite.direction) * (this.speed);
        let x = this.sprite.x + Math.cos(this.sprite.direction) * this.speed;
        let y = this.sprite.y + Math.sin(this.sprite.direction) * this.speed;

        this.setPosition(x, y);
      }
      else  {
      super.move();
      }
    }
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
    if (!this.isHumanControlled) {
      if (this.livingTime < config.creature.adultAge) {
        this.sprite.tint = Constants.colors.WHITE;
      } else if (this.livingTime >= config.creature.elderAge) {
        this.sprite.tint = Constants.colors.GREEN;
      } else {
        this.sprite.tint = Constants.colors.RED;
      }
    }
  }

  /**
   * 
   */
  findMate(survivorInfo) {

    if (this.isHumanControlled)
      return;

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
              break;
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

    if (this.isHumanControlled)
      return;

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

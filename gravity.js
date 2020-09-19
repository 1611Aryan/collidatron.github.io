/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */

function rotate(velocity, angle) {
  const rotatedVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
  };

  return rotatedVelocities;
}

/**
 * Swaps out two colliding particles' x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null | Does not return a value
 */

function resolveCollision(particle, otherParticle) {
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

    // Grab angle between the two colliding particles
    const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

    // Store mass in var for better readability in collision equation
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    // Velocity before equation
    const u1 = rotate(particle.velocity, angle);
    const u2 = rotate(otherParticle.velocity, angle);

    // Velocity after 1d collision equation
    const v1 = {
      x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2),
      y: u1.y
    };
    const v2 = {
      x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2),
      y: u2.y
    };

    // Final velocity after rotating axis back to original location
    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    // Swap particle velocities for realistic bounce effect
    particle.velocity.x = vFinal1.x;
    particle.velocity.y = vFinal1.y;

    otherParticle.velocity.x = vFinal2.x;
    otherParticle.velocity.y = vFinal2.y;
  }
}

function randomColor() {
  let values = "1234567890ABCDEF";
  let val = values.split("");
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += val[Math.floor(Math.random() * 16)];
  }
  if (color == '#000000') {
    return randomColor;
  } else {
    return color;
  }
}
/////////////////////////////////////////////
let mouse = {
  x: undefined,
  y: undefined
};
window.addEventListener('resize', function (event) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  init();
});
window.addEventListener('mousemove', function (event) {
  mouse.x = event.x;
  mouse.y = event.y;

});

///////////////////////////////////
const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const c = canvas.getContext('2d');
////////////////////////////////////////////////////

///////////////////////////////////////////

const frictionX = 1;
const frictionY = 1;
const numberOfBalls = 100;
window.addEventListener('click', function (event) {
  initClick();
});

function distance(x1, y1, x2, y2) {
  const xDist = x1 - x2;
  const yDist = y1 - y2;
  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

let circleArray = [];

function Circle(x, y, velocity, radius, color) {
  this.x = x;
  this.y = y
  this.velocity = velocity;
  this.radius = radius;
  this.color = color;
  this.mass = 1;

  this.draw = function () {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.fillStyle = this.color;
    c.fill();
  }
  this.fall = function (circleArray) {
    if (this.y + this.radius + this.velocity.y >= canvas.height || this.y - this.radius < 0) {
      this.velocity.y = -this.velocity.y * frictionY;
    }
    if (this.x + this.radius + this.velocity.x >= canvas.width || this.x - this.radius <= 0) {
      this.velocity.x = -this.velocity.x * frictionX;
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.draw();
    this.interactivity();

    for (let i = 0; i < circleArray.length; i++) {
      if (this === circleArray[i]) continue;
      if (distance(this.x, this.y, circleArray[i].x, circleArray[i].y) < this.radius + circleArray[i].radius) {
        resolveCollision(this, circleArray[i]);
      }

    }


  }
  this.interactivity = function () {
    let distanceX = Math.abs(this.x - mouse.x);
    let distanceY = Math.abs(this.y - mouse.y);
    let z = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

    if (z < this.radius) {
      this.color = '#ffffff';
    } else {
      this.color = color;
    }
  }
}

let circle;

function init() {
  circleArray = [];
  for (var i = 0; i < numberOfBalls; i++) {
    let radius = 20;
    let x = Math.random() * (canvas.width - radius * 2) + radius;
    let y = Math.random() * (canvas.height - radius * 2) + radius;
    let velocity = {
      x: (Math.random() - 0.5) * 10,

      y: (Math.random() * 5)
    }


    let color = randomColor();

    if (i !== 0) {
      for (let j = 0; j < circleArray.length; j++) {
        if (distance(x, y, circleArray[j].x, circleArray[j].y) < radius + circleArray[j].radius) {
          x = Math.random() * (canvas.width - radius * 2) + radius;
          y = Math.random() * (canvas.height - radius * 2) + radius;
          j = -1;

        }
      }
    }


    circle = new Circle(x, y, velocity, radius, color);
    circleArray.push(circle);
  }
}


function initClick() {
  let radius = (Math.random() * 20) + 20;
  let x = mouse.x;
  let y = mouse.y;
  let velocity = {
    x: (Math.random() - 0.5) * 4,
    y: (Math.random() * 4) + 1
  };
  let color = randomColor();
  circle = new Circle(x, y, velocity, radius, color);
  circleArray.push(circle);
  //console.log("No. of Balls are " + circleArray.length);
}


function animate() {
  requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < circleArray.length; i++) {
    circleArray[i].fall(circleArray);

  }

}


init();
animate();

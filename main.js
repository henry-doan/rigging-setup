/*******************************************************
 *      Cut down rigging interative for exercise
 * 
 * Functions below are to be created by students
*******************************************************/

var translateXFunction = function(p, value, origin) {
    p.x += value;
};

var translateYFunction = function(p, value, origin) {
    p.y -= value;
};

var scaleFunction = function(p, value, origin) {
    var x = p.x - origin.x;
    var y = p.y - origin.y;
    p.x = origin.x + x * value;
    p.y = origin.y + y * value;
};

var rotateFunction = function(p, value, origin) {
    var x = p.x - origin.x;
    var y = p.y - origin.y;
    p.x = origin.x + x * cos(value) - y * sin(value);
    p.y = origin.y + x * sin(value) + y * cos(value);
};

/*******************************************************
 *          Shape
 * A set of points, which are connected by straight
 * lines, and filled to draw part of a skeleton.
*******************************************************/
{
var Shape = function(points, fillColor, strokeColor) {
    this.fillColor = color(225, 230, 235);
    this.strokeColor = color(200, 200, 200);
    this.deformers = [];
    
    // Convert arrays of two coordinates, [x, y], into PVectors
    this.points = [];
    for (var i = 0; i < points.length; i++) {
        this.points.push(new PVector(points[i][0], points[i][1]));
    }
};

Shape.prototype.draw = function() {
    noStroke();
    fill(0, 0, 0, 50);
    
    // Shadow
    pushMatrix();
    translate(2, 3);
    this.drawShape();
    popMatrix();
    
    fill(this.fillColor);
    strokeWeight(1);
    stroke(this.strokeColor);
    this.drawShape();
};

Shape.prototype.drawShape = function() {
    beginShape();
    for (var i = 0; i < this.points.length; i++) {
        vertex(this.points[i].x, this.points[i].y);
    }
    endShape(CLOSE);
};

Shape.prototype.transform = function(transform, origin, value) {
    for (var i = 0; i < this.points.length; i++) {
        transform(this.points[i], origin, value);
    }
    
    for (var i = 0; i < this.deformers.length; i++) {
        transform(this.deformers[i].origin, origin, value);
    }
};

Shape.prototype.fixDeformer = function(deformer) {
    this.deformers.push(deformer);
};
}
/*******************************************************
 *          Deformer
 * An avar that transforms a set of shapes with a given
 * transformation. Deformer have an origin, which
 * determines the origin of its transformation.
*******************************************************/
{
var Deformer = function(transformFunction, origin) {
    this.transformFunction = transformFunction;
    this.origin = origin ? new PVector(origin[0], origin[1]) : new PVector(0, 0);
    this.shapes = [];
};

Deformer.prototype.draw = function() {
    fill(120);
    strokeWeight(1);
    stroke(250, 250, 250);
    ellipse(this.origin.x, this.origin.y, 10, 10);
};

Deformer.prototype.addShapes = function(shapes) {
    this.shapes = this.shapes.concat(shapes);
};

Deformer.prototype.setOrigin = function(x, y) {
    this.origin = new PVector(x, y);
};

// Update the position of dependent shapes with given value
Deformer.prototype.update = function(value) {
    for (var i = 0; i < this.shapes.length; i++) {
        this.shapes[i].transform(this.transformFunction, value, this.origin);
    }
};
}
/*******************************************************
 *          Model
 * A character consisting of a set Shapes and a set of
 * Deformers that transform those shapes.
*******************************************************/
{
var Model = function() {
    this.shapes = {};
    this.deformers = [];
};

Model.prototype.draw = function() {
    for (var el in this.shapes) {
        this.shapes[el].draw();
    }
    
    for (var i = 0; i < this.deformers.length; i++) {
        this.deformers[i].draw();
    }
};

Model.prototype.addShape = function(points, name) {
    this.shapes[name] = new Shape(points);
    return this.shapes[name];
};

Model.prototype.addDeformer = function(deformer) {
    this.deformers.push(deformer);
};
}
/*******************************************************
 * Create Luxo Jr and add the shapes that form it
*******************************************************/

var luxo = new Model();

// Position of centre of base
var x = 200;
var y = 325;

// Add shape for base
var luxoBase = luxo.addShape([
    [x - 64, y], [x + 64, y], [x + 60, y - 15], [x + 8, y - 15],
    [x + 8, y - 30], [x - 8, y - 30], [x - 8, y - 15], [x - 60, y - 15]
], 'base');

// Add shape for arm 1
var luxoArm1 = luxo.addShape([
    [x, y - 13], [x - 10, y - 23], [x + 70, y - 103], [x + 80, y - 93]
], 'arm 1');

// Add shape for arm 2
var luxoArm2 = luxo.addShape([
    [x + 80, y - 93], [x + 70, y - 83], [x - 10, y - 163], [x, y - 173]
], 'arm 2');

// Add shape for lamp shade
var luxoShade = luxo.addShape([
    [x - 20, y - 153], [x, y - 173], [x + 20, y - 153], [x, y - 133],
    [x - 20, y - 73], [x - 80, y - 133]
], 'shade');

/*******************************************************
 *  Add deformers (to be done by the student)
*******************************************************/

// Universal transform
var translateAll = new Deformer(translateYFunction);
translateAll.addShapes([luxoBase, luxoArm1, luxoArm2, luxoShade]);
luxo.addDeformer(translateAll);

// Lamp resizing
var shadeScaler = new Deformer(scaleFunction, [203, 168]);
shadeScaler.addShapes([luxoShade]);
luxo.addDeformer(shadeScaler);
luxoShade.fixDeformer(shadeScaler);

// Lamp rotator
var lampRotate = new Deformer(rotateFunction, [203, 168]);
lampRotate.addShapes([luxoShade]);
luxo.addDeformer(lampRotate);
luxoShade.fixDeformer(lampRotate);

// Arm hinge
var armRotate = new Deformer(rotateFunction, [270, 232]);
armRotate.addShapes([luxoShade, luxoArm2]);
luxo.addDeformer(armRotate);
luxoArm2.fixDeformer(armRotate);

// Base hinge
var baseRotate = new Deformer(rotateFunction, [200, 303]);
baseRotate.addShapes([luxoShade, luxoArm2, luxoArm1]);
luxo.addDeformer(baseRotate);
luxoBase.fixDeformer(baseRotate);

/**************************************
 * Main loop
***************************************/

draw = function() {
    // Background
    background(82, 115, 173);
    noStroke();
    fill(184, 134, 40);
    rect(-1, 280, width + 2, height - 278);
    
    luxo.draw();
    
    // Example animation
    //translateAll.update(sin(frameCount * 4));
};

// Allow student to test functions
mouseClicked = function() {
    translateAll.update(10);
    shadeScaler.update(1.2);
    lampRotate.update(10);
    armRotate.update(10);
    baseRotate.update(10);
};

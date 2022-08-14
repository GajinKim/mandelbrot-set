let canvas = document.getElementById('mandelbrot');
let context = canvas.getContext('2d');
let iterations = [];

let targetIterations = Number(document.getElementById("target-iterations").value);
let renderSpeed = Number(document.getElementById("render-speed").value);

function ComplexNumber(real, imaginary) {
    this.real = real;
    this.imaginary = imaginary;
}

ComplexNumber.prototype.add = function (other) {
    return new ComplexNumber(this.real + other.real, this.imaginary + other.imaginary);
};

ComplexNumber.prototype.multiply = function (other) {
    return new ComplexNumber(this.real * other.real - this.imaginary * other.imaginary, this.real * other.imaginary + this.imaginary * other.real);
}

ComplexNumber.prototype.absolute = function () {
    return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
}

function belongsInSet(real, imaginary, iterations) {
    // performs the following equation for the specified number of iterations to determine if the point is within the mandelbrot set
    // z_{n+1} = z_{n}^{2} + c 
    let z = new ComplexNumber(0, 0);
    let c = new ComplexNumber(real, imaginary);
    let i = 0;

    while (z.absolute() < 2 && i < iterations) {
        z = z.multiply(z).add(c);
        i++;
    }

    return i;
}

function fillPixel(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x, y, 1, 1);
}

function drawIntervalFrame(maxIterations) {
    // console.log('hi');
    // // real axis boundaries [-2, 1]
    // let minReal = Number(document.getElementById('minreal').value);
    // let maxReal = Number(document.getElementById('maxreal').value);

    // // imaginary axis boundaries [-1, 1]
    // let minImaginary = Number(document.getElementById('minimaginary').value);
    // let maxImaginary = Number(document.getElementById('maximaginary').value);

    // given a center coordinate and zoom amount, how do we determine the boundaries?

    let defaultWidth = 3; // real axis boundaries [-2, 1]
    let defaultHeight = 2; // imaginary axis boundaries [-1, 1]
    // if zoom is 1x and center coodinate is (-0.75, 0) it should be the normal render

    let xOrigin = Number(document.getElementById('render-origin-x-coord').value);
    let yOrigin = Number(document.getElementById('render-origin-y-coord').value);
    let zoom = Number(document.getElementById('render-zoom').value);

    let minReal = xOrigin - (defaultWidth / 2) * (1 / zoom);
    let maxReal = xOrigin + (defaultWidth / 2) * (1 / zoom);
    let minImaginary = yOrigin - (defaultHeight / 2) * (1 / zoom);
    let maxImaginary = yOrigin + (defaultHeight / 2) * (1 / zoom);
    console.log("Boundaries: ", minReal, maxReal, minImaginary, maxImaginary);


    let realStep = Number((maxReal - minReal) / canvas.width);
    let imaginaryStep = Number((maxImaginary - minImaginary) / canvas.height);

    let real = minReal;

    while (real < maxReal) {
        let imaginary = minImaginary;
        while (imaginary < maxImaginary) {
            let pointBelongs = belongsInSet(real, imaginary, maxIterations);
            let x = (real - minReal) / realStep;
            let y = (imaginary - minImaginary) / imaginaryStep;

            if (pointBelongs == maxIterations) {
                fillPixel(x, y, 'black');
            } else {
                let colorHue = parseInt(30 + Math.round(120 * pointBelongs * 1.0 / maxIterations));
                var color = `hsl(${colorHue}, 100%, 50%`;
                fillPixel(x, y, color);
            }
            imaginary += imaginaryStep;
        }
        real += realStep;
    }
}

document.getElementById("render-mandelbrot").onclick = function () {
    updateCanvasSize();
    updateIterations();

    let i = 0;
    let interval = setInterval(function () {
        drawIntervalFrame(iterations[i]);
        i++;
        if (i >= iterations.length) {
            clearInterval(interval);
        }
    }, 1000); // renders one frame per second

    console.log('Finished Rendering Mandelbrot Set');
}

document.getElementById("target-iterations").onchange = function () {
    updateIterations();
}

// updates canvas size based on available window space
function updateCanvasSize() {
    // mandelbrot set is 2:3 (height:width)
    let screenHeightToWidthRatio = window.innerHeight / window.innerWidth;
    if (screenHeightToWidthRatio < (2 / 3)) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight * (3 / 2);
    } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth * (2 / 3);
    }

    // cuts the resolution by half because computer performance sucks
    canvas.width /= 4;
    canvas.height /= 4;
}

async function updateIterations() {
    await updateTargetIterations();
    await updateRenderSpeed();

    console.log('target iterations', targetIterations);
    console.log('render speed', renderSpeed);

    iterations.length = 0;
    while (targetIterations > 5) {
        await iterations.unshift(parseInt(targetIterations));
        targetIterations /= renderSpeed;
    }

    if (iterations.length == 0) {
        iterations.push(parseInt(targetIterations));
    }
}

function updateTargetIterations() {
    targetIterations = Number(document.getElementById("target-iterations").value);
}

function updateRenderSpeed() {
    renderSpeed = Number(document.getElementById("render-speed").value);
}
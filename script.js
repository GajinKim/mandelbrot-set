let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');
let iterations = [];

let pixelDensity = Number(document.getElementById("render-quality").value);
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

function pixelCalculator(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x, y, 1, 1);
}

function drawIntervalFrame(maxIterations) {
    // real axis boundaries [-2, 1]
    let minReal = Number(document.getElementById('minreal').value);
    let maxReal = Number(document.getElementById('maxreal').value);

    // imaginary axis boundaries [-1, 1]
    let minImaginary = Number(document.getElementById('minimaginary').value);
    let maxImaginary = Number(document.getElementById('maximaginary').value);

    let realStep = Number((maxReal - minReal) / canvas.width);
    let imaginaryStep = Number((maxImaginary - minImaginary) / canvas.height);

    let real = minReal;

    while (real < maxReal) {
        let imaginary = minImaginary;
        console.log('boundaries', minReal, maxReal, minImaginary, maxImaginary);
        while (imaginary < maxImaginary) {
            let pointBelongs = belongsInSet(real, imaginary, maxIterations);
            let x = (real - minReal) / realStep;
            let y = (imaginary - minImaginary) / imaginaryStep;

            if (pointBelongs == maxIterations) {
                pixelCalculator(x, y, 'black');
            } else {
                let colorHue = parseInt(30 + Math.round(120 * pointBelongs * 1.0 / maxIterations));
                var color = `hsl(${colorHue}, 100%, 50%`;
                pixelCalculator(x, y, color);
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
    }, 1000);
}

document.getElementById("render-quality").onchange = function () {
    updateIterations();
}

// updates canvas size based on available window space
function updateCanvasSize() {
    // adjust boundaries based on width:height ratio
    let screenRatio = window.innerHeight / window.innerWidth;
    if (screenRatio < 1.5) {
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight * (3 / 2);
    } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth * (2 / 3);
    }

    // cuts the resolution by half because computer performance sucks
    canvas.width /= 2;
    canvas.height /= 2;
}

async function updateIterations() {
    await updatePixelDensity();
    await updateRenderSpeed();
    
    console.log('pixel density', pixelDensity);
    console.log('render speed', renderSpeed);
    
    iterations.length = 0;
    while (pixelDensity > 5) {
        await iterations.unshift(parseInt(pixelDensity));
        pixelDensity /= renderSpeed;
    }
    
    if (iterations.length == 0) {
        iterations.push(parseInt(pixelDensity));
    }

    console.log('iterations', iterations);
}

function updatePixelDensity() {
    pixelDensity = Number(document.getElementById("render-quality").value);
}

function updateRenderSpeed() {
    renderSpeed = Number(document.getElementById("render-speed").value);
}
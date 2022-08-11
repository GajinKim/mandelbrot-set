let canvas = document.getElementById('canvas');
let context = canvas.getContext('2d');

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

function belongsToSetInGivenIterations(real, imaginary, iterations) {
    // z_{n+1} = z_{n}^{2} + c 
    let z = new ComplexNumber(0, 0);
    let c = new ComplexNumber(real, imaginary);
    let i = 0;

    while (z.absolute() < 2 && i < iterations) {
        z = z.multiply(z).add(c);
        i++;
    }

    return (i == iterations);
}

function pixelCalculator(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x, y, 1, 1);
}

function draw(maxIterations) {
    // real axis boundaries [-2, 1]
    let minReal = -2;
    let maxReal = 1;
    // imaginary axis boundaries [-1, 1]
    let minImaginary = -1;
    let maxImaginary = 1;

    let realStep = (maxReal - minReal) / canvas.width;
    let imaginaryStep = (maxImaginary - minImaginary) / canvas.height;

    let real = minReal;

    while (real < maxReal) {
        let imaginary = minImaginary;
        while (imaginary < maxImaginary) {
            let result = belongsToSetInGivenIterations(real, imaginary, maxIterations);
            let x = (real - minReal) / realStep;
            let y = (imaginary - minImaginary) / imaginaryStep;

            // check whether the pixel should be colored black or white
            result ? pixelCalculator(x, y, 'black') : pixelCalculator(x, y, 'white');

            imaginary += imaginaryStep;
        }
        real += realStep;
    }
}

// resize canvas to fill browser window dynamically
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

document.getElementById("render-mandelbrot").onclick = function () {
    let iterations = [5, 10, 15, 25, 50, 75, 100, 150, 200, 500];
    let i = 0;
    let interval = setInterval(function () {
        draw(iterations[i]);
        i++;
        if (i >= iterations.length) {
            clearInterval(interval);
        }
    }, 1000);
}

function resizeCanvas() {
    // adjust boundaries based on width:height ratio
    let screenRatio = window.innerHeight / window.innerWidth;
    if (screenRatio < 1.5) {
        console.log('hi');
        canvas.height = window.innerHeight;
        canvas.width = window.innerHeight * (3 / 2);
    } else {
        console.log('bye');
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth * (2 / 3);
    }

    // cuts the resolution in third because computer performance sucks
    canvas.width /= 3;
    canvas.height /= 3;
}
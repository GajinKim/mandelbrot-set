const canvas = document.getElementById('mandelbrot-canvas');
const context = canvas.getContext('2d');

// if zoom is 1x and center coodinate is (-0.75, 0) it should be the normal render
const defaultWidth = 3; // real axis boundaries [-2, 1]
const defaultHeight = 2; // imaginary axis boundaries [-1, 1]

let iterations = [];

let iterationDepth = Number(document.getElementById("target-iterations").value);
let renderSpeed = Number(document.getElementById("render-speed").value);
let xOrigin = Number(document.getElementById('origin-x-coord').value);
let yOrigin = Number(document.getElementById('origin-y-coord').value);
let zoom = Number(document.getElementById('zoom').value);

let fullScreen = false;
let autoCalculateMaxIterations = true;

let precision = 1;

function ComplexNumber(real, imaginary) {
    this.real = real;
    this.imaginary = imaginary;
};

ComplexNumber.prototype.add = function (other) {
    return new ComplexNumber(this.real + other.real, this.imaginary + other.imaginary);
};

ComplexNumber.prototype.multiply = function (other) {
    return new ComplexNumber(this.real * other.real - this.imaginary * other.imaginary, this.real * other.imaginary + this.imaginary * other.real);
};

ComplexNumber.prototype.absolute = function () {
    return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
};

document.getElementById("render-mandelbrot").onclick = async function () {
    await updateCanvasSize();
    await updateRenderSettings();
    await updateIterations(); // updateIterations relies on all render variables being up to date

    let i = 0;
    let interval = await setInterval(function () {
        drawIntervalFrame(xOrigin, yOrigin, zoom, iterations[i]); // drawIntervalFrame relies on all render variables plus canvas dimensions being up to date
        i++;
        if (i >= iterations.length) {
            clearInterval(interval);
        }
    }, 1000); // renders one frame per second
};

// ARROW & ZOOM BUTTON FUNCTIONALITY
document.getElementById("move-left-10percent").onclick = async function () {
    await updateZoom();
    await updatePrecision();
    document.getElementById("origin-x-coord").value = (Number(document.getElementById("origin-x-coord").value) - 0.10 * (defaultWidth) * (1 / zoom)).toFixed(precision);
};

document.getElementById("move-left-25percent").onclick = async function () {
    await updateZoom();
    await updatePrecision();
    document.getElementById("origin-x-coord").value = (Number(document.getElementById("origin-x-coord").value) - 0.25 * (defaultWidth) * (1 / zoom)).toFixed(precision);
};

document.getElementById("move-right-10percent").onclick = async function () {
    await updateZoom();
    await updatePrecision();
    document.getElementById("origin-x-coord").value = (Number(document.getElementById("origin-x-coord").value) + 0.10 * (defaultWidth) * (1 / zoom)).toFixed(precision);
};

document.getElementById("move-right-25percent").onclick = async function () {
    await updateZoom();
    await updatePrecision();
    document.getElementById("origin-x-coord").value = (Number(document.getElementById("origin-x-coord").value) + 0.25 * (defaultWidth) * (1 / zoom)).toFixed(precision);
};

document.getElementById("move-down-10percent").onclick = async function () {
    await updateZoom();
    await updatePrecision();
    document.getElementById("origin-y-coord").value = (Number(document.getElementById("origin-y-coord").value) - 0.10 * (defaultHeight) * (1 / zoom)).toFixed(precision);
};

document.getElementById("move-down-25percent").onclick = async function () {
    await updateZoom();
    await updatePrecision();
    document.getElementById("origin-y-coord").value = (Number(document.getElementById("origin-y-coord").value) - 0.25 * (defaultHeight) * (1 / zoom)).toPrecision(precision);
};
document.getElementById("move-up-10percent").onclick = async function () {
    await updateZoom();
    await updatePrecision();
    document.getElementById("origin-y-coord").value = (Number(document.getElementById("origin-y-coord").value) + 0.10 * (defaultHeight) * (1 / zoom)).toPrecision(precision);
};
document.getElementById("move-up-25percent").onclick = async function () {
    await updateZoom();
    await updatePrecision();
    document.getElementById("origin-y-coord").value = (Number(document.getElementById("origin-y-coord").value) + 0.25 * (defaultHeight) * (1 / zoom)).toPrecision(precision);
};
document.getElementById("zoom-out-5x").onclick = async function () {
    await updateZoom();
    await updatePrecision();
    document.getElementById("zoom").value = Number(document.getElementById("zoom").value) / 5;
};
document.getElementById("zoom-out-2x").onclick = async function () {
    await updateZoom();
    await updatePrecision();
    document.getElementById("zoom").value = Number(document.getElementById("zoom").value) / 2;
};
document.getElementById("zoom-in-2x").onclick = async function () {
    await updateZoom();
    await updatePrecision();
    document.getElementById("zoom").value = Number(document.getElementById("zoom").value) * 2;
};
document.getElementById("zoom-in-5x").onclick = async function () {
    await updateZoom();
    await updatePrecision();
    document.getElementById("zoom").value = Number(document.getElementById("zoom").value) * 5;
};
document.getElementById("zoom").onchange = async function () {
    await updateZoom();
    await updatePrecision();
}

// MODAL VISIBILITY
document.getElementById("hide-settings-mobile").onclick = function () {
    toggleDiv("hide-settings-mobile");
    toggleDiv("show-settings-mobile");
    toggleDiv("show-settings-desktop");
    toggleDiv("hide-settings-desktop");
    toggleDiv("settings");
}
document.getElementById("show-settings-mobile").onclick = function () {
    toggleDiv("show-settings-mobile");
    toggleDiv("hide-settings-mobile");
    toggleDiv("show-settings-desktop");
    toggleDiv("hide-settings-desktop");
    toggleDiv("settings");
}
document.getElementById("hide-settings-desktop").onclick = function () {
    toggleDiv("hide-settings-mobile");
    toggleDiv("show-settings-mobile");
    toggleDiv("show-settings-desktop");
    toggleDiv("hide-settings-desktop");
    toggleDiv("settings");
}
document.getElementById("show-settings-desktop").onclick = function () {
    toggleDiv("show-settings-mobile");
    toggleDiv("hide-settings-mobile");
    toggleDiv("show-settings-desktop");
    toggleDiv("hide-settings-desktop");
    toggleDiv("settings");
}

// FULL SCREEN FUNCTIONALITY
document.getElementById("full-screen-on-desktop").onclick = function () {
    toggleDiv("full-screen-on-mobile");
    toggleDiv("full-screen-off-mobile");
    toggleDiv("full-screen-on-desktop");
    toggleDiv("full-screen-off-desktop");
    fullScreen = false;
}
document.getElementById("full-screen-on-mobile").onclick = function () {
    toggleDiv("full-screen-on-mobile");
    toggleDiv("full-screen-off-mobile");
    toggleDiv("full-screen-on-desktop");
    toggleDiv("full-screen-off-desktop");
    fullScreen = false;
}
document.getElementById("full-screen-off-desktop").onclick = function () {
    toggleDiv("full-screen-on-mobile");
    toggleDiv("full-screen-off-mobile");
    toggleDiv("full-screen-on-desktop");
    toggleDiv("full-screen-off-desktop");
    fullScreen = true;
}
document.getElementById("full-screen-off-mobile").onclick = function () {
    toggleDiv("full-screen-on-mobile");
    toggleDiv("full-screen-off-mobile");
    toggleDiv("full-screen-on-desktop");
    toggleDiv("full-screen-off-desktop");
    fullScreen = true;
}

// AUTO CALCULATE ITERATION DEPTH FUNCTIONALITY
document.getElementById("auto-calculate-iteration-depth-on-desktop").onclick = function () {
    toggleDiv("auto-calculate-iteration-depth-off-desktop");
    toggleDiv("auto-calculate-iteration-depth-on-desktop");
    toggleDiv("auto-calculate-iteration-depth-on-mobile");
    toggleDiv("auto-calculate-iteration-depth-off-mobile");
    toggleDiv("target-iterations-title");
    toggleDiv("target-iterations");
    autoCalculateMaxIterations = false;
}
document.getElementById("auto-calculate-iteration-depth-on-mobile").onclick = function () {
    toggleDiv("auto-calculate-iteration-depth-off-desktop");
    toggleDiv("auto-calculate-iteration-depth-on-desktop");
    toggleDiv("auto-calculate-iteration-depth-on-mobile");
    toggleDiv("auto-calculate-iteration-depth-off-mobile");
    toggleDiv("target-iterations-title");
    toggleDiv("target-iterations");
    autoCalculateMaxIterations = false;
}
document.getElementById("auto-calculate-iteration-depth-off-desktop").onclick = function () {
    toggleDiv("auto-calculate-iteration-depth-off-desktop");
    toggleDiv("auto-calculate-iteration-depth-on-desktop");
    toggleDiv("auto-calculate-iteration-depth-on-mobile");
    toggleDiv("auto-calculate-iteration-depth-off-mobile");
    toggleDiv("target-iterations-title");
    toggleDiv("target-iterations");
    autoCalculateMaxIterations = true;
}
document.getElementById("auto-calculate-iteration-depth-off-mobile").onclick = function () {
    toggleDiv("auto-calculate-iteration-depth-off-desktop");
    toggleDiv("auto-calculate-iteration-depth-on-desktop");
    toggleDiv("auto-calculate-iteration-depth-on-mobile");
    toggleDiv("auto-calculate-iteration-depth-off-mobile");
    toggleDiv("target-iterations-title");
    toggleDiv("target-iterations");
    autoCalculateMaxIterations = true;
}

// RENDER FUNCTIONS
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
};

function drawIntervalFrame(xOrigin, yOrigin, zoom, maxIterations) {
    let minReal = xOrigin - (defaultWidth / 2) * (1 / zoom);
    let maxReal = xOrigin + (defaultWidth / 2) * (1 / zoom);
    let minImaginary = yOrigin - (defaultHeight / 2) * (1 / zoom);
    let maxImaginary = yOrigin + (defaultHeight / 2) * (1 / zoom);

    console.log(" X Boundary: [", minReal, ",", maxReal, "]\n", "Y Boundary: [", minImaginary, ",", maxImaginary, "]");

    let realStep = Number((maxReal - minReal) / canvas.width);
    let imaginaryStep = Number((maxImaginary - minImaginary) / canvas.height);

    let real = minReal;
    while (real < maxReal) {
        let imaginary = minImaginary;
        while (imaginary < maxImaginary) {
            let pointBelongs = belongsInSet(real, imaginary, maxIterations);
            let x = (real - minReal) / realStep;
            let y = canvas.height - (imaginary - minImaginary) / imaginaryStep;

            if (pointBelongs == maxIterations) {
                fillPixel(x, y, 'black');
            } else {
                // 360 = max hue value
                // maxHue + minHue <= 360
                // the closer the max and min hues are, the less color variation there will be
                let maxHue = 360;
                let minHue = 20;
                let colorHue = parseInt(minHue + Math.round(maxHue * pointBelongs / maxIterations));
                var color = `hsl(${colorHue}, 100%, 50%`;
                fillPixel(x, y, color);
            }
            imaginary += imaginaryStep;
        }
        real += realStep;
    }
};

// HELPER FUNCTIONS
async function updateRenderSettings() {
    await updateZoom();
    await updateIterationDepth();
    await updateRenderSpeed();
    await updateOrigin();
};

// Updates iterations array based on target iterations and render speed
async function updateIterations() {
    console.log('Target Iterations', iterationDepth);
    console.log('Render Speed', renderSpeed);

    iterations.length = 0;
    while (iterationDepth > 5) {
        await iterations.unshift(parseInt(iterationDepth));
        iterationDepth /= renderSpeed;
    }

    if (iterations.length == 0) {
        iterations.push(parseInt(iterationDepth));
    }
};

// Render Depth
function updateIterationDepth() {
    console.log('Auto calculate render depth:', autoCalculateMaxIterations);
    iterationDepth = autoCalculateMaxIterations ? (100 + 2 * zoom) : Number(document.getElementById("target-iterations").value);
};

function updateRenderSpeed() {
    renderSpeed = Number(document.getElementById("render-speed").value);
};

function updateOrigin() {
    xOrigin = Number(document.getElementById('origin-x-coord').value);
    yOrigin = Number(document.getElementById('origin-y-coord').value);
};

function updateZoom() {
    zoom = Number(document.getElementById('zoom').value);
};

function updatePrecision() {
    if (zoom < 2) {
        precision = 1;
    } else if (zoom > 16) {
        precision = 8;
    } else {
        precision = Math.round(zoom / 2);
    }
};

function updateCanvasSize() {
    let screenHeightToWidthRatio = window.innerHeight / window.innerWidth;

    if (fullScreen) {
        if (screenHeightToWidthRatio > (2 / 3)) {
            canvas.height = window.innerHeight;
            canvas.width = window.innerHeight * (3 / 2);
        } else {
            canvas.width = window.innerWidth;
            canvas.height = window.innerWidth * (2 / 3);
        }
    } else {
        // updates canvas size based on available window space
        // mandelbrot set is 2:3 (height:width)
        if (screenHeightToWidthRatio < (2 / 3)) {
            canvas.height = window.innerHeight;
            canvas.width = window.innerHeight * (3 / 2);
        } else {
            canvas.width = window.innerWidth;
            canvas.height = window.innerWidth * (2 / 3);
        }
    }
    // cuts the resolution by half because computer performance sucks
    // canvas.width /= 2;
    // canvas.height /= 2;
};

function fillPixel(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x, y, 1, 1);
};

// UI
// toggleDiv('modal-content');
function toggleDiv(id) {
    var div = document.getElementById(id);
    div.style.display = div.style.display == "none" ? "block" : "none";
}

///// grid stuff

// Padding
var p = 0;

function drawBoard() {
    // updateCanvasSize();
    for (var x = 0; x <= canvas.width; x += 40) {
        context.moveTo(0.5 + x + p, p);
        context.lineTo(0.5 + x + p, canvas.height + p);
    }

    for (var x = 0; x <= canvas.height; x += 40) {
        context.moveTo(p, 0.5 + x + p);
        context.lineTo(canvas.width + p, 0.5 + x + p);
    }
    context.strokeStyle = "black";
    ; context.stroke();
}
// drawBoard(); //todo testing
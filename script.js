var canvas = document.getElementById("myCanvas");
var buffer;

var width = 128;
var height = 0;

onWindowResize();

function onWindowResize() {
	height = width * canvas.clientHeight / canvas.clientWidth + 1;

	canvas.width = width;
	canvas.height = height;
}

palette = [
	{pos: 0.0, color: [0, 0, 0]},
	{pos: 0.15, color: [0, 0, 0]},
	{pos: 0.3, color: [198, 101, 0]},
	{pos: 0.65, color: [255, 191, 0]},
	{pos: 0.75, color: [255, 255, 255]},
	{pos: 1.0, color: [255, 255, 255]}
]

gradient_size = 100;
var gradient = [];

function setupGradient() {
	for (var i = 0; i <= gradient_size; i++) {
		gradient.push(getColor(i / gradient_size));
	}
}

setupGradient();

function simplex(x, y, octaves, lowercap, uppercap) {
	if (!octaves) octaves = 6;
	if (!lowercap) lowercap = 0;
	if (!uppercap) uppercap = 1;
	
	var v = 0;
	for (var i = 1; i <= octaves; i++) {
		var s = noise.simplex2(x * Math.pow(2, i-1),y * Math.pow(2, i-1)) / 2 + 0.5;
		v += s * Math.pow(2, -i);
	}
	
	if (v < lowercap)
		return 0;
	if (v > uppercap)
		return 1;
	return (v - lowercap) / (uppercap - lowercap);
}

function getFireValue(x, y, t) {
	x += 0.12 * simplex(x * 2, y * 2 + t * 0.02, 2, 0.135, 0.78) * (1.0 - y);

	var stretch = 2;
	var exp = 1.5;

	var value = simplex(x * 2, Math.pow(stretch, - 1.0 / exp) * (1.0 - Math.pow((1.0 - y) * stretch, exp)) * 0.4 - t * 0.4, 4, 0.2, 0.7);
	
	value = 0.2 * (1.0 - y) + (0.8 + 0.2 * y) * value;
	value *= (1.0 - Math.pow(y, 1.7));

	return value;
}

function setPixelRGB(x, y, color) {
	if (x >= width || y >= height || x < 0 || y < 0)
		return;

	buffer[(y * width + x) * 4 + 0] = color.r;
	buffer[(y * width + x) * 4 + 1] = color.g;
	buffer[(y * width + x) * 4 + 2] = color.b;
}

function getColor(value) {
	var stop1 = 0;

	while (palette[stop1 + 1].pos < value) stop1++;

	var blend = 1.0 - (value - palette[stop1].pos) / (palette[stop1 + 1].pos - palette[stop1].pos);

	var r = blend * palette[stop1].color[0] + (1.0 - blend) * palette[stop1 + 1].color[0];
	var g = blend * palette[stop1].color[1] + (1.0 - blend) * palette[stop1 + 1].color[1];
	var b = blend * palette[stop1].color[2] + (1.0 - blend) * palette[stop1 + 1].color[2];

	return {r: r, g: g, b: b};
}

function getColorQuick(value) {
	return gradient[Math.round(value * gradient_size)];
}

function drawFrame() {
	var ctx = canvas.getContext("2d");

	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, width, height);

	var imageData = ctx.getImageData(0, 0, width, height);
	buffer = imageData.data

	var now = new Date();
	var t = now.getTime() / 1000.0;
	
	for (var x = 0; x < width; x++) {
		for (var y = 0; y < height; y++) {
			value = getFireValue(x / width, 1.0 - y / height, t);

			setPixelRGB(x, y, getColorQuick(value));
		}
	}

	ctx.putImageData(imageData, 0, 0);
}

var animFrame = window.requestAnimationFrame  ||
 	window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame    ||
    window.oRequestAnimationFrame      ||
    window.msRequestAnimationFrame     ||
    null;

lastFrame = new Date();

function mainLoop() {
	drawFrame();
	animFrame(mainLoop);

	now = new Date();
	dt = now - lastFrame;
	lastFrame = now;
	document.title = Math.floor(1000 / dt) + " fps";
}

mainLoop();
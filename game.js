import { Physics } from '/physics.js';
import { Graphics } from '/graphics.js';
import { GameObject } from '/game-object.js';


var physics;
var graphics;

var player;
var startingPlatform;
var selectedPlatform;
var blocks = new Array();


function start() {
    physics = new Physics();
    graphics = new Graphics();

    player = new GameObject(physics, graphics, ['sphere'], 1);
    player.bodyActive = true;
    player.meshActive = true;
    startingPlatform = new GameObject(physics, graphics, ['box', 10, 0.5, 2], 0, 0, -2);
    startingPlatform.bodyActive = true;
    startingPlatform.meshActive = true;
    selectedPlatform = new GameObject(physics, graphics, ['box', 5, 0.5, 1]);
    selectedPlatform.meshActive = true;
}


function update(dt) {
}


function updatePhysics(dt) {
    physics.world.stepSimulation(dt, 5, 1 / 120);
}


function syncPhysics() {
    player.syncPhysics();
}


function render() {
    graphics.renderer.render(graphics.scene, graphics.camera);
}


function inputButton(button, pressed) {
}


function inputPoint(x, y) {
    // Transform page coordinates to world space.
    var clipX = 1 - 2 * x / window.innerWidth;
    var clipY = 2 * y / window.innerHeight - 1;
    var clipZ = (new T.Vector3(0, 0, 0)).applyMatrix4(graphics.camera.matrixWorld).applyMatrix4(graphics.camera.projectionMatrix).z;
    var worldPosition = (new T.Vector3(clipX, clipY, clipZ)).applyMatrix4(graphics.camera.projectionMatrixInverse).applyMatrix4(graphics.camera.matrixWorldInverse);

    selectedPlatform.mesh.position.copy(worldPosition);
}


export function play() {
    // Start the game loop.
    var clock = new T.Clock();
    start();
    function frame() {
        requestAnimationFrame(frame);
        var dt = clock.getDelta();
        update(dt);
        updatePhysics(dt);
        syncPhysics();
        render();
    }
    frame();

    // Register input event listeners.
    function key(event, pressed) {
        if (inputButton(event.code, pressed)) {
            event.preventDefault();
        }
    }
    function mouseButton(event, pressed) {
        if (inputButton('Mouse' + event.button, pressed)) {
            event.preventDefault();
        }
    }
    function mouseMove(event) {
        inputPoint(event.pageX, event.pageY);
    }
    window.addEventListener('keydown', function(event) { key(event, true); });
    window.addEventListener('keyup', function(event) { key(event, false); });
    window.addEventListener('mousedown', function(event) { mouseButton(event, true); });
    window.addEventListener('mouseup', function(event) { mouseButton(event, false); });
    window.addEventListener('mousemove', mouseMove);
}

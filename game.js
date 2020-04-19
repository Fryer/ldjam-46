import { Physics } from '/physics.js';
import { Graphics } from '/graphics.js';
import { GameObject } from '/game-object.js';


var physics;
var graphics;

var inputX = 0, inputY = 0;

var player;
var startingPlatform;
var selectedBlock;
var blocks = new Array();


function placeBlock() {
    var s = selectedBlock.mesh.scale;
    var p = selectedBlock.mesh.position;
    var block = new GameObject(physics, graphics, ['box', s.x, s.y, s.z], 0, p.x, p.y, p.z);
    block.bodyActive = true;
    block.meshActive = true;
    blocks.push(block);
}


function start() {
    physics = new Physics();
    graphics = new Graphics();

    player = new GameObject(physics, graphics, ['sphere'], 1);
    player.bodyActive = true;
    player.meshActive = true;
    player.speedOffset = 0;
    startingPlatform = new GameObject(physics, graphics, ['box', 10, 0.5, 2], 0, 0, -2);
    startingPlatform.bodyActive = true;
    startingPlatform.meshActive = true;
    selectedBlock = new GameObject(physics, graphics, ['box', 5, 0.5, 1]);
    selectedBlock.meshActive = true;
}


function update(dt) {
    // Scroll.
    graphics.camera.position.x += 2 * dt;

    // Adjust player speed.
    if (player.mesh.position.x < graphics.camera.position.x - 1) {
        player.speedOffset = 100;
    }
    else if (player.mesh.position.x > graphics.camera.position.x + 1) {
        player.speedOffset = -100;
    }
    else if (player.mesh.position.x > graphics.camera.position.x && player.speedOffset > 0) {
        player.speedOffset = 0;
    }
    else if (player.mesh.position.x < graphics.camera.position.x && player.speedOffset < 0) {
        player.speedOffset = 0;
    }

    // Move player.
    var velocity = player.body.getLinearVelocity();
    player.body.setLinearVelocity(new A.btVector3(200 + player.speedOffset, velocity.y(), velocity.z()));
    player.body.activate();

    // Transform input coordinates to world space.
    var clip = (new T.Vector3(0, 0, 0)).applyMatrix4(graphics.camera.matrixWorld).applyMatrix4(graphics.camera.projectionMatrix);
    clip.x += 1 - 2 * inputX / window.innerWidth;
    clip.y += 2 * inputY / window.innerHeight - 1;
    var worldPosition = (new T.Vector3(clip.x, clip.y, clip.z)).applyMatrix4(graphics.camera.projectionMatrixInverse).applyMatrix4(graphics.camera.matrixWorldInverse);
    worldPosition.x += graphics.camera.position.x;
    worldPosition.y += graphics.camera.position.y;

    // Update selected block position.
    selectedBlock.mesh.position.copy(worldPosition);
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
    if (button == 'Mouse0' && pressed) {
        placeBlock();
    }
}


function inputPoint(x, y) {
    inputX = x;
    inputY = y;
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

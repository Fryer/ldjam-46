/* LICENSE: https://fryer.github.com/ldjam-46/license.txt */


import { Physics } from './physics.js';
import { Graphics } from './graphics.js';
import { GameObject } from './game-object.js';


var physics;
var graphics;

var inputX = 0, inputY = 0;
var inputAngle;

var player;
var startingPlatform;
var selectedBlock;
var blocks;

var started;
var screenX;
var placementCooldown;
var randomSpawnCooldown;


function buildLevel() {
    inputAngle = 0;

    player = new GameObject(physics, graphics, ['sphere'], 1);
    player.bodyActive = true;
    player.meshActive = true;
    player.speedOffset = 0;
    startingPlatform = new GameObject(physics, graphics, ['box', 10, 0.5, 2], 0, 0, -2);
    startingPlatform.bodyActive = true;
    startingPlatform.meshActive = true;
    selectedBlock = new GameObject(physics, graphics, ['box', 5, 0.5, 1]);
    selectedBlock.mesh.material = graphics.transparentMaterial;
    selectedBlock.meshActive = true;

    blocks = new Array();

    started = false;
    screenX = 0;
    placementCooldown = 0;
    randomSpawnCooldown = 8;
}


function clearLevel() {
    player.destroy();
    player = null;
    startingPlatform.destroy();
    startingPlatform = null;
    selectedBlock.destroy();
    selectedBlock = null;

    for (let block of blocks) {
        block.destroy();
    }
    blocks = null;
}


function updateBest() {
    var best = localStorage.getItem('best');
    best = Math.max(best ? best : 0, (player.mesh.position.x * 10).toFixed());
    localStorage.setItem('best', best);
    var bestUI = document.getElementById('best');
    bestUI.innerText = best.toFixed();
}


function rotateBlock(direction) {
    inputAngle += direction;
    inputAngle = inputAngle - Math.floor(inputAngle / 16) * 16;
}


function placeBlock() {
    // Start scrolling when the first block is placed.
    started = true;

    if (placementCooldown > 0) {
        return;
    }
    placementCooldown = 1;
    selectedBlock.mesh.material = graphics.disabledMaterial;

    var s = selectedBlock.mesh.scale;
    var p = selectedBlock.mesh.position;
    var block = new GameObject(physics, graphics, ['box', s.x, s.y, s.z], 0, p.x, p.y, p.z, inputAngle * Math.PI * 0.125);
    block.canMove = false;
    block.type = 'normal';
    block.bodyActive = true;
    block.meshActive = true;
    blocks.push(block);
}


function spawnRandomBlock() {
    var x = Math.random() * 2 + screenX + 16;
    var y = Math.random() * 12 - 6;
    var block;
    if (Math.random() < Math.min(0.5, (screenX - 20) * 0.0025)) {
        // Moving block.
        block = new GameObject(physics, graphics, ['box', 2, 4, 1], 'kinematic', x, y);
        block.canMove = true;
        block.type = 'moveVertical';
        block.direction = 1 + Math.random() * Math.min(1, (screenX - 40) * 0.00125);
    }
    else {
        // Normal block.
        block = new GameObject(physics, graphics, ['box', 1, 4, 1], 0, x, y);
        block.canMove = false;
        block.type = 'normal';
    }
    block.bodyActive = true;
    block.meshActive = true;
    blocks.push(block);
}


function start() {
    physics = new Physics();
    graphics = new Graphics();

    graphics.transparentMaterial = new T.MeshStandardMaterial({ transparent: true, opacity: 0.5 });
    graphics.disabledMaterial = new T.MeshStandardMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });

    buildLevel();
    updateBest();
}


function restart() {
    updateBest();
    clearLevel();
    buildLevel();
}


function update(dt) {
    // Check for death.
    if (player.mesh.position.x < screenX - 12 || player.mesh.position.y < -8) {
        restart();
    }

    // Remove off-screen blocks.
    if (blocks.length > 0 && blocks[0].mesh.position.x < screenX - 16) {
        blocks[0].destroy();
        blocks = blocks.slice(1);
    }

    // Spawn random blocks.
    if (started) {
        randomSpawnCooldown -= dt;
    }
    if (randomSpawnCooldown <= 0) {
        randomSpawnCooldown = 3 + Math.random() * 2;
        spawnRandomBlock();
    }

    // Scroll.
    if (started) {
        screenX += 3 * dt;
    }
    graphics.camera.position.x = screenX;

    // Adjust player speed.
    if (player.mesh.position.x < screenX - 6) {
        player.speedOffset = 2;
    }
    else if (player.mesh.position.x > screenX - 4) {
        player.speedOffset = -2;
    }
    else if (player.mesh.position.x > screenX - 5 && player.speedOffset > 0) {
        player.speedOffset = 0;
    }
    else if (player.mesh.position.x < screenX - 5 && player.speedOffset < 0) {
        player.speedOffset = 0;
    }

    // Move player.
    if (started) {
        player.body.setAngularVelocity(new A.btVector3(0, 0, -6 - player.speedOffset));
        player.body.activate();
    }

    // Transform input coordinates to world space.
    var clip = (new T.Vector3(0, 0, 0)).applyMatrix4(graphics.camera.matrixWorld).applyMatrix4(graphics.camera.projectionMatrix);
    clip.x += 1 - 2 * inputX / window.innerWidth;
    clip.y += 2 * inputY / window.innerHeight - 1;
    var worldPosition = (new T.Vector3(clip.x, clip.y, clip.z)).applyMatrix4(graphics.camera.projectionMatrixInverse).applyMatrix4(graphics.camera.matrixWorldInverse);
    worldPosition.x += graphics.camera.position.x;
    worldPosition.y += graphics.camera.position.y;

    // Update selected block.
    if (placementCooldown > 0) {
        placementCooldown -= dt;
        if (placementCooldown <= 0) {
            selectedBlock.mesh.material = graphics.transparentMaterial;
        }
    }
    selectedBlock.mesh.position.copy(worldPosition);
    selectedBlock.mesh.quaternion.setFromEuler(new T.Euler(0, 0, inputAngle * Math.PI * 0.125, 'XYZ'));

    // Move blocks.
    for (let block of blocks) {
        if (block.type == 'moveVertical') {
            if (block.direction > 0 && block.mesh.position.y > 6) {
                block.direction *= -1;
            }
            else if (block.direction < 0 && block.mesh.position.y < -6) {
                block.direction *= -1;
            }
            var speed = 150 * block.direction;
            var transform = new A.btTransform();
            block.motionState.getWorldTransform(transform);
            transform.setOrigin(transform.getOrigin().op_add(new A.btVector3(0, speed * dt, 0)));
            block.motionState.setWorldTransform(transform);
        }
    }
}


function updatePhysics(dt) {
    physics.world.stepSimulation(dt, 5, 1 / 120);
}


function syncPhysics() {
    player.syncPhysics();

    for (let block of blocks) {
        if (block.canMove) {
            block.syncPhysics();
        }
    }
}


function render() {
    graphics.renderer.render(graphics.scene, graphics.camera);

    // Update UI.
    var distanceUI = document.getElementById('distance');
    distanceUI.innerText = (player.mesh.position.x * 10).toFixed();
}


function inputButton(button, pressed) {
    if (!pressed) {
        return false;
    }
    switch (button) {
        case 'Mouse0':
            placeBlock();
            return true;
        case 'ArrowLeft':
        case 'ArrowUp':
            rotateBlock(1);
            return true;
        case 'ArrowRight':
        case 'ArrowDown':
            rotateBlock(-1);
            return true;
    }
    return false;
}


function inputPoint(x, y) {
    inputX = x;
    inputY = y;
}


function inputWheel(mode, dx, dy, dz) {
    if (mode == 1 && dy != 0) {
        rotateBlock(dy > 0 ? -1 : 1);
        return true;
    }
    return false;
}


export function play() {
    // Start the game loop.
    var clock = new T.Clock();
    start();
    function frame() {
        requestAnimationFrame(frame);
        var dt = Math.min(clock.getDelta(), 1 / 30);
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
    function mouseWheel(event) {
        if (inputWheel(event.deltaMode, event.deltaX, event.deltaY, event.deltaZ)) {
            event.preventDefault();
        }
    }
    window.addEventListener('keydown', function(event) { key(event, true); });
    window.addEventListener('keyup', function(event) { key(event, false); });
    window.addEventListener('mousedown', function(event) { mouseButton(event, true); });
    window.addEventListener('mouseup', function(event) { mouseButton(event, false); });
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('wheel', mouseWheel);
}

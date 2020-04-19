import { Physics } from '/physics.js';
import { Graphics } from '/graphics.js';
import { GameObject } from '/game-object.js';


export function play() {
    var physics;
    var graphics;

    var blocks = new Array();


    function start() {
        physics = new Physics();
        graphics = new Graphics();

        blocks.push(new GameObject(physics, graphics, ['box']));
        blocks.push(new GameObject(physics, graphics, ['box'], 0, -4, 4, 0));
        blocks.push(new GameObject(physics, graphics, ['box', 2], 0, 4, 4, 0));
        blocks.push(new GameObject(physics, graphics, ['box', 2, 1.5], 0, -4, -4, 0));
        blocks.push(new GameObject(physics, graphics, ['box', 0.5, 1, 1.5], 0, 4, -4, 0));
        blocks.push(new GameObject(physics, graphics, ['sphere'], 0, -6));
        blocks.push(new GameObject(physics, graphics, ['sphere', 0.5], 0, 6));
        blocks.push(new GameObject(physics, graphics, ['box', 16, 1, 16], 0, 0, -6, 0));
        blocks.push(new GameObject(physics, graphics, ['box'], 1, 0.6, 2));
        blocks.push(new GameObject(physics, graphics, ['sphere'], 1, 0, 4));
        for (let block of blocks) {
            block.bodyActive = true;
            block.meshActive = true;
        }
    }


    function update(dt) {
    }


    function updatePhysics(dt) {
        physics.world.stepSimulation(dt, 5, 1 / 120);
    }


    function syncPhysics() {
        for (let block of blocks) {
            block.syncPhysics();
        }
    }


    function render() {
        graphics.renderer.render(graphics.scene, graphics.camera);
    }


    function inputButton(button, pressed) {
    }


    function inputPoint(x, y) {
    }


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

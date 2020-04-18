function Physics() {
    this.collisionConfiguration = new A.btDefaultCollisionConfiguration();
    this.dispatcher = new A.btCollisionDispatcher(this.collisionConfiguration);
    this.pairCache = new A.btDbvtBroadphase();
    this.constraintSolver = new A.btSequentialImpulseConstraintSolver();
    this.world = new A.btDiscreteDynamicsWorld(this.dispatcher, this.pairCache, this.constraintSolver, this.collisionConfiguration);
    this.world.setGravity(new A.btVector3(0, -10, 0));
}


Physics.prototype.destroy = function() {
    A.destroy(this.world);
    A.destroy(this.constraintSolver);
    A.destroy(this.pairCache);
    A.destroy(this.dispatcher);
    A.destroy(this.collisionConfiguration);
};


function Graphics() {
    this.renderer = new T.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.canvas = document.body.appendChild(this.renderer.domElement);
    this.scene = new T.Scene();
    this.camera = new T.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 10;
}


Graphics.prototype.destroy = function() {
    this.scene.dispose();
    this.renderer.dispose();
    this.canvas.remove();
}


function play() {
    var physics;
    var graphics;


    function start() {
        physics = new Physics();
        graphics = new Graphics();
    }


    function update(dt) {
    }


    function updatePhysics(dt) {
        physics.world.stepSimulation(dt, 5, 1 / 120);
    }


    function syncPhysics() {
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

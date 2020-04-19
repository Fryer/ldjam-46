function Physics() {
    this.collisionConfiguration = new A.btDefaultCollisionConfiguration();
    this.dispatcher = new A.btCollisionDispatcher(this.collisionConfiguration);
    this.pairCache = new A.btDbvtBroadphase();
    this.constraintSolver = new A.btSequentialImpulseConstraintSolver();
    this.world = new A.btDiscreteDynamicsWorld(this.dispatcher, this.pairCache, this.constraintSolver, this.collisionConfiguration);
    this.world.setGravity(new A.btVector3(0, -1000, 0));
}


Physics.prototype.destroy = function() {
    A.destroy(this.world);
    A.destroy(this.constraintSolver);
    A.destroy(this.pairCache);
    A.destroy(this.dispatcher);
    A.destroy(this.collisionConfiguration);
};


function Graphics() {
    // Renderer.
    this.renderer = new T.WebGLRenderer();
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.canvas = document.body.appendChild(this.renderer.domElement);

    // Scene.
    this.scene = new T.Scene();

    // Camera.
    this.camera = new T.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 10;

    // Lighting.
    this.sun = new T.DirectionalLight(0xffdf9f);
    this.sun.position.set(-1, 2, 4);
    this.scene.add(this.sun);
    this.ambient = new T.AmbientLight(0x203050);
    this.scene.add(this.ambient);
    this.topLight = new T.DirectionalLight(0x404040);
    this.topLight.position.y = 10;
    this.topLight.castShadow = true;
    this.topLight.shadow.mapSize.x = 1024;
    this.topLight.shadow.mapSize.y = 256;
    this.topLight.shadow.camera.left = -15;
    this.topLight.shadow.camera.right = 15;
    this.scene.add(this.topLight);

    // Geometries.
    this.boxGeometry = new T.BoxGeometry();
    this.sphereGeometry = new T.SphereGeometry(0.5, 16, 16);

    // Materials.
    this.material = new T.MeshStandardMaterial();
}


Graphics.prototype.destroy = function() {
    this.scene.dispose();
    this.renderer.dispose();
    this.canvas.remove();
}


function GameObject(physics, graphics, shape, mass, x, y, z) {
    this.physics = physics;
    this.graphics = graphics;
    var sx, sy, sz;
    if (shape.length == 1) {
        sx = sy = sz = 1;
    }
    else if (shape.length == 2) {
        sx = sy = sz = shape[1];
    }
    else if (shape.length == 3) {
        sx = shape[1];
        sy = shape[2];
        sz = 1;
    }
    else if (shape.length == 4) {
        sx = shape[1];
        sy = shape[2];
        sz = shape[3];
    }
    mass = mass ? mass : 0;
    x = x ? x : 0;
    y = y ? y : 0;
    z = z ? z : 0;

    // Body.
    switch (shape[0]) {
        case 'sphere':
            this.collisionShape = new A.btSphereShape(sx * 50);
            break;
        default:
            this.collisionShape = new A.btBoxShape(new A.btVector3(sx * 50, sy * 50, sz * 50));
    }
    var localInertia = new A.btVector3();
    this.collisionShape.calculateLocalInertia(mass, localInertia);
    var transform = new A.btTransform();
    transform.setIdentity();
    transform.setOrigin(new A.btVector3(x * 100, y * 100, z * 100));
    this.motionState = new A.btDefaultMotionState(transform);
    var constructionInfo = new A.btRigidBodyConstructionInfo(mass, this.motionState, this.collisionShape, localInertia);
    this.body = new A.btRigidBody(constructionInfo);
    this.body.setLinearFactor(new A.btVector3(1, 1, 0));
    this.body.setAngularFactor(new A.btVector3(0, 0, 1));

    // Mesh.
    var geometry;
    switch (shape[0]) {
        case 'sphere':
            geometry = graphics.sphereGeometry;
            sz = sy = sx;
            break;
        default:
            geometry = graphics.boxGeometry;
    }
    this.mesh = new T.Mesh(geometry, graphics.material);
    this.mesh.scale.set(sx, sy, sz);
    this.mesh.position.set(x, y, z);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;


    var bodyActive = false;
    Object.defineProperty(this, 'bodyActive', {
        get() {
            return bodyActive;
        },
        set(active) {
            if (active && !bodyActive) {
                this.physics.world.addRigidBody(this.body);
            }
            else if (!active && bodyActive) {
                this.physics.world.removeRigidBody(this.body);
            }
            bodyActive = active;
        }
    });


    var meshActive = false;
    Object.defineProperty(this, 'meshActive', {
        get() {
            return meshActive;
        },
        set(active) {
            if (active && !meshActive) {
                this.graphics.scene.add(this.mesh);
            }
            else if (!active && meshActive) {
                this.graphics.scene.remove(this.mesh);
            }
            meshActive = active;
        }
    });
}


GameObject.prototype.destroy = function() {
    A.destroy(this.body);
    A.destroy(this.motionState);
    A.destroy(this.collisionShape);
}


GameObject.prototype.syncPhysics = function() {
    var transform = new A.btTransform();
    this.motionState.getWorldTransform(transform);
    var position = transform.getOrigin();
    var rotation = transform.getRotation();
    this.mesh.position.set(position.x() * 0.01, position.y() * 0.01, position.z() * 0.01);
    this.mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
}


function play() {
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
        for (block of blocks) {
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
        for (block of blocks) {
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

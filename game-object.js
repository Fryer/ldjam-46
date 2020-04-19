export function GameObject(physics, graphics, shape, mass, x, y, z) {
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

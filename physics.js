export function Physics() {
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

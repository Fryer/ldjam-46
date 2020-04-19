export function Graphics() {
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
    this.scene.add(this.camera);

    // Lighting.
    this.sun = new T.DirectionalLight(0xffdf9f);
    this.sun.position.set(-1, 2, 4);
    this.scene.add(this.sun);
    this.ambient = new T.AmbientLight(0x203050);
    this.scene.add(this.ambient);
    this.topLight = new T.DirectionalLight(0x404040);
    this.topLight.position.y = 10;
    var target = new T.Object3D();
    target.position.z = -10;
    this.camera.add(target);
    this.topLight.target = target;
    this.topLight.castShadow = true;
    this.topLight.shadow.mapSize.x = 1024;
    this.topLight.shadow.mapSize.y = 256;
    this.topLight.shadow.camera.left = -15;
    this.topLight.shadow.camera.right = 15;
    target.add(this.topLight);

    // Geometries.
    this.boxGeometry = new T.BoxGeometry();
    this.sphereGeometry = new T.SphereGeometry(0.5, 16, 16);

    // Materials.
    this.material = new T.MeshStandardMaterial();
    this.transparent = new T.MeshStandardMaterial({ transparent: true, opacity: 0.5 });
}


Graphics.prototype.destroy = function() {
    this.scene.dispose();
    this.renderer.dispose();
    this.canvas.remove();
}

/* LICENSE: https://fryer.github.com/ldjam-46/license.txt */


export function Graphics() {
    // Renderer.
    this.renderer = new T.WebGLRenderer();
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(Math.min(window.innerWidth, window.innerHeight * 2), window.innerHeight);
    this.canvas = document.body.appendChild(this.renderer.domElement);

    // Scene.
    this.scene = new T.Scene();
    this.scene.fog = new T.Fog(0x809fbf, 10, 30);

    // Camera.
    this.camera = new T.PerspectiveCamera(60, Math.min(window.innerWidth / window.innerHeight, 2), 0.1, 1000);
    this.camera.position.z = 10;
    this.scene.add(this.camera);

    // Background.
    this.backgroundGeometry = new T.Geometry();
    this.backgroundGeometry.vertices.push(
        new T.Vector3(-32, 16, -20),
        new T.Vector3(-32, -16, -20),
        new T.Vector3(32, 16, -20),
        new T.Vector3(32, -16, -20)
    );
    this.backgroundGeometry.faces.push(
        new T.Face3(0, 1, 2, null, [new T.Color(0xffffff), new T.Color(0x4080bf), new T.Color(0xffffff)]),
        new T.Face3(3, 2, 1, null, [new T.Color(0x4080bf), new T.Color(0xffffff), new T.Color(0x4080bf)])
    );
    this.backgroundGeometry.computeBoundingSphere();
    this.backgroundMaterial = new T.MeshBasicMaterial({ vertexColors: true });
    this.background = new T.Mesh(this.backgroundGeometry, this.backgroundMaterial);
    this.camera.add(this.background);

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

    // Window resize event listener.
    var renderer = this.renderer;
    var camera = this.camera;
    this.resizeListener = function() {
        renderer.setSize(Math.min(window.innerWidth, window.innerHeight * 2), window.innerHeight);
        camera.aspect = Math.min(window.innerWidth / window.innerHeight, 2);
        camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', this.resizeListener);
}


Graphics.prototype.destroy = function() {
    window.removeEventListener('resize', this.resizeListener);
    this.scene.dispose();
    this.renderer.dispose();
    this.canvas.remove();
}

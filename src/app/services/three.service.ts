import * as THREE from 'three';
import { ElementRef, Injectable, NgZone } from '@angular/core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FileCombination } from '../home/home.component';

@Injectable({ providedIn: 'root' })
export class ThreeService {
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    // this.animate()
  }

  public createScene(
    rendererCanvas: ElementRef<HTMLCanvasElement>,
    paths: FileCombination[]
  ) {
    const canvas = rendererCanvas.nativeElement;
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.scene = new THREE.Scene();
    this.camera = this.getCamera();
    this.camera.position.set(0, 10, 20);

    const orbitControls = new OrbitControls(this.camera, canvas);
    orbitControls.target.set(0, 5, 0);
    orbitControls.update();

    this.scene.background = new THREE.Color('white');

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.addLightIntoScene(this.scene);

    paths.forEach((path) => this.loadGltf(orbitControls, path));

    this.renderer.render(this.scene, this.camera);
  }

  private getCamera() {
    return new THREE.PerspectiveCamera(45, 2, 0.1, 100);
  }

  private async loadGltf(controls: OrbitControls, path: FileCombination) {
    const loader = new GLTFLoader();

    loader.load(
      path.gltfPath,
      (gltf) => {
        const mesh = gltf.scene.children[0] as THREE.Mesh;

        path.texturePath.forEach((path) => this.addTexture(mesh, path));

        this.scene.add(gltf.scene);

        const box = new THREE.Box3().setFromObject(gltf.scene);

        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        this.frameArea(boxSize * 0.5, boxSize, boxCenter, this.camera);

        controls.maxDistance = boxSize * 10;
        controls.target.copy(boxCenter);
        controls.update();
      },
      (xhr) => {},
      (error) => {
        console.error(error);
      }
    );
  }

  private addTexture(mesh: THREE.Mesh, path: string) {
    const texture = new THREE.TextureLoader().load(path);
    mesh.material = new THREE.MeshPhongMaterial({
      map: texture,
      color: 0xfffff,
    });
    this.scene.add(mesh);
  }

  private frameArea(
    sizeToFitOnScreen: number,
    boxSize: number,
    boxCenter: THREE.Vector3,
    camera: THREE.PerspectiveCamera
  ) {
    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
    const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);

    const direction = new THREE.Vector3()
      .subVectors(camera.position, boxCenter)
      .multiply(new THREE.Vector3(1, 0, 1))
      .normalize();

    camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

    camera.near = boxSize / 100;
    camera.far = boxSize * 100;

    camera.updateProjectionMatrix();

    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
  }

  public animate(): void {
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }
    });
  }

  public render(): void {
    requestAnimationFrame(() => {
      this.render();
    });
    this.renderer.render(this.scene, this.camera);
  }

  private addLightIntoScene(scene: THREE.Scene) {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(5, 10, 2);
    scene.add(light);
    scene.add(light.target);
  }
}

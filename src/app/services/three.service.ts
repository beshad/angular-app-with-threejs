import * as THREE from 'three';
import { ElementRef, Injectable, NgZone } from '@angular/core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { FileCombination } from '../type/3d-model';

@Injectable({ providedIn: 'root' })
export class ThreeService {
  private renderer!: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private orbitControls!: OrbitControls;
  private dragControls!: DragControls;
  private group!: THREE.Group;

  constructor(private ngZone: NgZone) {
    this.scene = new THREE.Scene();
    this.camera = this.getCamera();
    this.camera.position.set(0, 10, 20);
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.group = new THREE.Group();
  }

  ngOnInit() {
    // this.animate()
  }

  public createScene(
    rendererCanvas: ElementRef<HTMLCanvasElement>,
    paths: FileCombination[]
  ) {
    const canvas = rendererCanvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({ canvas });

    this.orbitControls = new OrbitControls(this.camera, canvas);
    this.orbitControls.target.set(0, 5, 0);
    this.orbitControls.update();

    this.scene.background = new THREE.Color('white');

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // document.body.appendChild(this.renderer.domElement);

    this.addLightIntoScene(this.scene);

    paths.forEach((path) => this.loadGltf(this.orbitControls, path));

    const spritePosition = new THREE.Vector3(5, 700, 50);
    const spriteScale = new THREE.Vector3(100, 100, 100);
    this.addSprite('assets/ui/Pin.png', spriteScale, spritePosition);

    console.log(this.scene);
    this.scene.add(this.group);

    this.dragControls = new DragControls([this.group], this.camera, canvas);
    this.dragControls.transformGroup = true;
    this.dragControls.addEventListener('drag', () => this.render);

    this.renderer.render(this.scene, this.camera);
    window.addEventListener('click', this.onMouseDown, false);
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

        // this.scene.add(gltf.scene);
        this.group.add(gltf.scene);

        const box = new THREE.Box3().setFromObject(gltf.scene);

        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        this.frameArea(boxSize * 0.5, boxSize, boxCenter, this.camera);

        controls.maxDistance = boxSize * 10;
        controls.target.copy(boxCenter);
        controls.update();
        // return
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
    // this.scene.add(mesh);
    this.group.add(mesh);
  }

  private addPin() {
    const map = new THREE.TextureLoader().load('assets/ui/Pin.png');
    const material = new THREE.SpriteMaterial({
      map,
      color: 0xfffff,
      // sizeAttenuation: false,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(1, 100, 1);
    sprite.position.set(5, 100, 50);
    sprite.uuid = 'pin';

    this.scene.add(sprite);
  }

  private addSprite(
    spritePath: string,
    scale: THREE.Vector3,
    position: THREE.Vector3
  ) {
    const map = new THREE.TextureLoader().load(spritePath);
    const material = new THREE.SpriteMaterial({
      map,
      color: 0xfffff,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(scale.x, scale.y, scale.z);
    sprite.position.set(position.x, position.y, position.y);
    sprite.uuid = spritePath;
    sprite.quaternion.copy(this.camera.quaternion);

    this.scene.add(sprite);
  }

  private onMouseDown = (event: any) => {
    console.log('CLICK! ' + event.clientX + ', ' + event.clientY);

    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    console.log('jhhhh', this.scene.children);

    var intersects = this.raycaster.intersectObjects(this.scene.children, true);

    console.log('hhh intersect', intersects);

    // this.dragControls.removeEventListener('dragstart', (event) => {
    //   this.orbitControls.enabled = false;
    // });
    // this.dragControls.removeEventListener('dragend', (event) => {
    //   this.orbitControls.enabled = true;
    // });

    intersects.forEach((element) => {
      if (element.object.uuid === 'assets/ui/Pin.png') {
        console.log('Intersection: ' + element.object);
        const map = new THREE.TextureLoader().load('assets/ui/Pin.png');
        const material = new THREE.SpriteMaterial({
          map,
          color: 0xfffff,
          // sizeAttenuation: false,
        });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(500, 500, 500);
        sprite.position.set(50, 2000, 50);
        sprite.name = 'pin';
        sprite.uuid = 'pin';

        this.scene.add(sprite);
      }
    });
  };

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

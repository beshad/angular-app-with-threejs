import * as THREE from 'three';
import { ElementRef, Injectable, NgZone } from '@angular/core';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { FileCombination, PinAndMediaPath } from '../type/3d-model';

@Injectable({ providedIn: 'root' })
export class ThreeService {
  private renderer!: THREE.WebGLRenderer;
  private camera!: THREE.PerspectiveCamera;
  private scene!: THREE.Scene;
  private raycaster!: THREE.Raycaster;
  private mouse!: THREE.Vector2;
  private orbitControls!: OrbitControls;
  private dragControls!: DragControls;
  private group!: THREE.Group;
  private frameId?: number;
  private sprite!: THREE.Sprite;

  constructor(private ngZone: NgZone) {}

  ngOnInit() {}

  ngOnDestroy() {
    if (!!this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(
    rendererCanvas: ElementRef<HTMLCanvasElement>,
    paths: FileCombination[],
    pinAndMediaPath: PinAndMediaPath
  ) {
    const canvas = rendererCanvas.nativeElement;
    this.scene = new THREE.Scene();
    this.camera = this.getCamera();
    this.camera.position.set(0, 10, 20);
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.group = new THREE.Group();

    this.renderer = new THREE.WebGLRenderer({ canvas });

    this.orbitControls = new OrbitControls(this.camera, canvas);
    this.orbitControls.target.set(0, 5, 0);
    this.orbitControls.update();

    this.scene.background = new THREE.Color('white');

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.addLightIntoScene(this.scene);

    paths.forEach((path) => this.loadGltf(this.orbitControls, path));

    this.addSprite(pinAndMediaPath);

    this.scene.add(this.group);

    // Disable the dragControl as it does not perform as expected
    // this.setupDragControl(canvas);

    this.renderer.render(this.scene, this.camera);
    canvas.addEventListener(
      'click',
      (event) => this.onMouseDown(event, pinAndMediaPath),
      false
    );
    canvas.addEventListener(
      'dblclick',
      () => this.onDblClick(pinAndMediaPath),
      false
    );
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

        this.group.add(gltf.scene);

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
    this.group.add(mesh);
  }

  private addSprite(pinAndMediaPath: PinAndMediaPath) {
    const scale = new THREE.Vector3(100, 100, 100);
    const position = new THREE.Vector3(5, 700, 50);

    const map = new THREE.TextureLoader().load(pinAndMediaPath.pin);
    const material = new THREE.SpriteMaterial({
      map,
      color: 0xfffff,
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(scale.x, scale.y, scale.z);
    sprite.position.set(position.x, position.y, position.y);
    sprite.uuid = pinAndMediaPath.mediaId;
    sprite.quaternion.copy(this.camera.quaternion);
    this.group.add(sprite);
  }

  private onMouseDown = (
    event: MouseEvent,
    pinAndMediaPath: PinAndMediaPath
  ) => {
    // Disable the dragControl as it does not perform as expected
    // this.handleOrbitControlsWhenDraging();
    this.loadPinMedia(event, pinAndMediaPath);
  };

  private onDblClick = (pinAndMediaPath: PinAndMediaPath) => {
    this.playVideo(pinAndMediaPath);
  };

  private loadPinMedia(event: MouseEvent, pinAndMediaPath: PinAndMediaPath) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    var intersects = this.raycaster.intersectObjects(this.scene.children, true);

    intersects.forEach((element) => {
      if (element.object.uuid === pinAndMediaPath.mediaId) {
        this.playVideo(pinAndMediaPath);
      }
    });
  }

  private playVideo(pinAndMediaPath: PinAndMediaPath) {
    THREE.Cache.enabled = true;
    const videoDialogBtn = document.getElementById(
      pinAndMediaPath.mediaBtnId
    ) as HTMLButtonElement;
    videoDialogBtn.click();
    const video = document.getElementById(
      pinAndMediaPath.mediaId
    ) as HTMLVideoElement;
    video.play();
    video.addEventListener('play', function () {
      this.currentTime = 3;
    });
  }

  private handleOrbitControlsWhenDraging() {
    this.dragControls.removeEventListener('dragstart', (event) => {
      this.orbitControls.enabled = false;
    });
    this.dragControls.removeEventListener('dragend', (event) => {
      this.orbitControls.enabled = true;
    });
  }

  private setupDragControl(canvas: HTMLCanvasElement) {
    this.dragControls = new DragControls([this.group], this.camera, canvas);
    this.dragControls.transformGroup = true;

    this.dragControls.addEventListener('dragend', () => this.render);
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
    this.frameId = requestAnimationFrame(() => {
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

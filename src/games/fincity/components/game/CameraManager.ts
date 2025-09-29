import type { Application, Container } from 'pixi.js';
import type { Vector2D, CameraState, InputState } from '../../types/Game';

export interface CameraManagerConfig {
  maxZoom: number;
  minZoom: number;
  panSpeed: number;
  zoomSpeed: number;
  boundsMargin: number;
  smoothingFactor: number;
}

export interface CameraTouchEvent {
  type: 'start' | 'move' | 'end';
  touches: Array<{ id: number; x: number; y: number }>;
  deltaX?: number;
  deltaY?: number;
  scale?: number;
}

export class CameraManager {
  private app: Application;
  private viewport: Container;
  private camera: CameraState;
  private input: InputState;
  private config: CameraManagerConfig;

  private isEnabled = true;
  private isDragging = false;
  private isPinching = false;
  private lastPointerPosition: Vector2D | null = null;
  private lastPinchDistance = 0;
  private worldBounds: { width: number; height: number };

  constructor(
    app: Application,
    viewport: Container,
    worldWidth: number = 2560,
    worldHeight: number = 1920,
    config?: Partial<CameraManagerConfig>
  ) {
    this.app = app;
    this.viewport = viewport;
    this.worldBounds = { width: worldWidth, height: worldHeight };

    this.config = {
      maxZoom: 2.0,
      minZoom: 0.5,
      panSpeed: 1.0,
      zoomSpeed: 0.1,
      boundsMargin: 400,
      smoothingFactor: 0.15,
      ...config
    };

    this.camera = {
      x: 0,
      y: 0,
      zoom: 1.0,
      bounds: {
        minX: -this.config.boundsMargin,
        maxX: worldWidth + this.config.boundsMargin,
        minY: -this.config.boundsMargin,
        maxY: worldHeight + this.config.boundsMargin,
        minZoom: this.config.minZoom,
        maxZoom: this.config.maxZoom
      }
    };

    this.input = {
      mouse: {
        x: 0,
        y: 0,
        buttons: new Set(),
        wheel: 0
      },
      touch: {
        touches: new Map(),
        pinchDistance: 0
      },
      keyboard: {
        keys: new Set()
      }
    };

    this.initializeEventListeners();
  }

  private initializeEventListeners(): void {
    const canvas = this.app.canvas;

    canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this));
    canvas.addEventListener('pointermove', this.handlePointerMove.bind(this));
    canvas.addEventListener('pointerup', this.handlePointerUp.bind(this));
    canvas.addEventListener('pointercancel', this.handlePointerUp.bind(this));
    canvas.addEventListener('wheel', this.handleWheel.bind(this));

    canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
  }

  private handlePointerDown(event: globalThis.PointerEvent): void {
    if (!this.isEnabled) return;

    this.isDragging = true;
    this.lastPointerPosition = { x: event.clientX, y: event.clientY };

    this.input.mouse.buttons.add(event.button);
    this.updateMousePosition(event);
  }

  private handlePointerMove(event: globalThis.PointerEvent): void {
    if (!this.isEnabled) return;

    this.updateMousePosition(event);

    if (this.isDragging && this.lastPointerPosition) {
      const deltaX = event.clientX - this.lastPointerPosition.x;
      const deltaY = event.clientY - this.lastPointerPosition.y;

      this.panBy(deltaX * this.config.panSpeed, deltaY * this.config.panSpeed);

      this.lastPointerPosition = { x: event.clientX, y: event.clientY };
    }
  }

  private handlePointerUp(event: globalThis.PointerEvent): void {
    if (!this.isEnabled) return;

    this.isDragging = false;
    this.lastPointerPosition = null;

    this.input.mouse.buttons.delete(event.button);
    this.updateMousePosition(event);
  }

  private handleWheel(event: globalThis.WheelEvent): void {
    if (!this.isEnabled) return;

    event.preventDefault();

    const rect = this.app.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const worldPos = this.viewport.toLocal({ x: mouseX, y: mouseY });
    const zoomDelta = -event.deltaY * this.config.zoomSpeed * 0.01;

    this.zoomAt(worldPos, zoomDelta);
  }

  private handleTouchStart(event: globalThis.TouchEvent): void {
    if (!this.isEnabled) return;

    console.log('CameraManager: Touch start', { touches: event.touches.length, enabled: this.isEnabled });
    event.preventDefault();

    this.input.touch.touches.clear();
    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      this.input.touch.touches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY
      });
    }

    if (event.touches.length === 2) {
      this.isPinching = true;
      this.lastPinchDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
      console.log('CameraManager: Pinch start', this.lastPinchDistance);
    } else if (event.touches.length === 1) {
      this.isDragging = true;
      this.lastPointerPosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
      console.log('CameraManager: Pan start', this.lastPointerPosition);
    }
  }

  private handleTouchMove(event: globalThis.TouchEvent): void {
    if (!this.isEnabled) return;

    event.preventDefault();

    if (event.touches.length === 2 && this.isPinching) {
      const newDistance = this.getTouchDistance(event.touches[0], event.touches[1]);
      const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;

      const rect = this.app.canvas.getBoundingClientRect();
      const worldCenter = this.viewport.toLocal({
        x: centerX - rect.left,
        y: centerY - rect.top
      });

      if (this.lastPinchDistance > 0) {
        const scaleFactor = newDistance / this.lastPinchDistance;
        const zoomDelta = (scaleFactor - 1) * this.config.zoomSpeed;
        this.zoomAt(worldCenter, zoomDelta);
        console.log('CameraManager: Pinch zoom', { scaleFactor, zoomDelta, zoom: this.camera.zoom });
      }

      this.lastPinchDistance = newDistance;
    } else if (event.touches.length === 1 && this.isDragging && this.lastPointerPosition) {
      const deltaX = event.touches[0].clientX - this.lastPointerPosition.x;
      const deltaY = event.touches[0].clientY - this.lastPointerPosition.y;

      this.panBy(deltaX * this.config.panSpeed, deltaY * this.config.panSpeed);

      this.lastPointerPosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    }
  }

  private handleTouchEnd(event: globalThis.TouchEvent): void {
    if (!this.isEnabled) return;

    console.log('CameraManager: Touch end', { touches: event.touches.length });
    event.preventDefault();

    if (event.touches.length < 2) {
      this.isPinching = false;
      this.lastPinchDistance = 0;
    }

    if (event.touches.length === 0) {
      this.isDragging = false;
      this.lastPointerPosition = null;
      this.input.touch.touches.clear();
      console.log('CameraManager: All touches ended');
    }
  }

  private getTouchDistance(touch1: globalThis.Touch, touch2: globalThis.Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private updateMousePosition(event: globalThis.PointerEvent): void {
    const rect = this.app.canvas.getBoundingClientRect();
    this.input.mouse.x = event.clientX - rect.left;
    this.input.mouse.y = event.clientY - rect.top;
  }

  public panBy(deltaX: number, deltaY: number): void {
    this.camera.x -= deltaX / this.camera.zoom;
    this.camera.y -= deltaY / this.camera.zoom;
    this.constrainCamera();
    this.updateViewport();
  }

  public panTo(x: number, y: number, smooth = false): void {
    if (smooth) {
      const targetX = x - this.app.screen.width / (2 * this.camera.zoom);
      const targetY = y - this.app.screen.height / (2 * this.camera.zoom);

      this.camera.x += (targetX - this.camera.x) * this.config.smoothingFactor;
      this.camera.y += (targetY - this.camera.y) * this.config.smoothingFactor;
    } else {
      this.camera.x = x - this.app.screen.width / (2 * this.camera.zoom);
      this.camera.y = y - this.app.screen.height / (2 * this.camera.zoom);
    }

    this.constrainCamera();
    this.updateViewport();
  }

  public zoomBy(delta: number): void {
    const newZoom = this.camera.zoom + delta;
    this.setZoom(newZoom);
  }

  public zoomAt(worldPoint: Vector2D, delta: number): void {
    const oldZoom = this.camera.zoom;
    const newZoom = Math.max(this.camera.bounds.minZoom,
      Math.min(this.camera.bounds.maxZoom, oldZoom + delta));

    if (newZoom !== oldZoom) {
      const zoomRatio = newZoom / oldZoom;

      this.camera.x += worldPoint.x * (1 - zoomRatio);
      this.camera.y += worldPoint.y * (1 - zoomRatio);
      this.camera.zoom = newZoom;

      this.constrainCamera();
      this.updateViewport();
    }
  }

  public setZoom(zoom: number): void {
    this.camera.zoom = Math.max(this.camera.bounds.minZoom,
      Math.min(this.camera.bounds.maxZoom, zoom));
    this.constrainCamera();
    this.updateViewport();
  }

  public fitToWorld(margin: number = 50): void {
    if (this.worldBounds.width <= 0 || this.worldBounds.height <= 0) {
      console.warn('CameraManager: Invalid world bounds, using default position');
      this.camera.x = 0;
      this.camera.y = 0;
      this.camera.zoom = 1.0;
      this.updateViewport();
      return;
    }

    const screenWidth = this.app.screen.width;
    const screenHeight = this.app.screen.height;

    if (screenWidth <= 0 || screenHeight <= 0) {
      console.warn('CameraManager: Invalid screen size, deferring fitToWorld');
      return;
    }

    const zoomX = (screenWidth - margin * 2) / this.worldBounds.width;
    const zoomY = (screenHeight - margin * 2) / this.worldBounds.height;

    const targetZoom = Math.min(zoomX, zoomY);
    const clampedZoom = Math.max(this.camera.bounds.minZoom,
      Math.min(this.camera.bounds.maxZoom, targetZoom));

    this.camera.zoom = clampedZoom;
    this.centerCamera();
  }

  public centerCamera(): void {
    this.camera.x = (this.worldBounds.width - this.app.screen.width / this.camera.zoom) / 2;
    this.camera.y = (this.worldBounds.height - this.app.screen.height / this.camera.zoom) / 2;
    this.constrainCamera();
    this.updateViewport();
  }

  public worldToScreen(worldPos: Vector2D): Vector2D {
    return {
      x: (worldPos.x - this.camera.x) * this.camera.zoom,
      y: (worldPos.y - this.camera.y) * this.camera.zoom
    };
  }

  public screenToWorld(screenPos: Vector2D): Vector2D {
    return {
      x: screenPos.x / this.camera.zoom + this.camera.x,
      y: screenPos.y / this.camera.zoom + this.camera.y
    };
  }

  public getCameraState(): CameraState {
    return { ...this.camera };
  }

  public setCameraState(state: Partial<CameraState>): void {
    Object.assign(this.camera, state);
    this.constrainCamera();
    this.updateViewport();
  }

  public getVisibleBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.camera.x,
      y: this.camera.y,
      width: this.app.screen.width / this.camera.zoom,
      height: this.app.screen.height / this.camera.zoom
    };
  }

  public resize(_width: number, _height: number): void {
    this.constrainCamera();
    this.updateViewport();
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.isDragging = false;
      this.isPinching = false;
      this.lastPointerPosition = null;
    }
  }

  public updateWorldBounds(width: number, height: number): void {
    this.worldBounds = { width, height };
    this.camera.bounds.maxX = width + this.config.boundsMargin;
    this.camera.bounds.maxY = height + this.config.boundsMargin;
    this.centerCamera();
  }

  public initializePosition(): void {
    console.log('CameraManager: Initializing position', {
      bounds: this.worldBounds,
      enabled: this.isEnabled,
      screen: { width: this.app.screen.width, height: this.app.screen.height }
    });
    this.setEnabled(true);
    this.fitToWorld();
  }

  private constrainCamera(): void {
    const visibleWidth = this.app.screen.width / this.camera.zoom;
    const visibleHeight = this.app.screen.height / this.camera.zoom;
    const worldWidth = this.worldBounds.width;
    const worldHeight = this.worldBounds.height;

    const paddingX = Math.max(visibleWidth * 0.4, Math.max(this.config.boundsMargin, 2000));
    const paddingY = Math.max(visibleHeight * 0.4, Math.max(this.config.boundsMargin, 1600));

    if (visibleWidth >= worldWidth + paddingX * 2) {
      this.camera.x = (worldWidth - visibleWidth) / 2;
    } else {
      const minX = -paddingX;
      const maxX = worldWidth - visibleWidth + paddingX;
      this.camera.x = Math.max(minX, Math.min(maxX, this.camera.x));
    }

    if (visibleHeight >= worldHeight + paddingY * 2) {
      this.camera.y = (worldHeight - visibleHeight) / 2;
    } else {
      const minY = -paddingY;
      const maxY = worldHeight - visibleHeight + paddingY;
      this.camera.y = Math.max(minY, Math.min(maxY, this.camera.y));
    }
  }

  private updateViewport(): void {
    this.viewport.x = -this.camera.x * this.camera.zoom;
    this.viewport.y = -this.camera.y * this.camera.zoom;
    this.viewport.scale.set(this.camera.zoom);
  }

  public destroy(): void {
    const canvas = this.app.canvas;

    canvas.removeEventListener('pointerdown', this.handlePointerDown.bind(this));
    canvas.removeEventListener('pointermove', this.handlePointerMove.bind(this));
    canvas.removeEventListener('pointerup', this.handlePointerUp.bind(this));
    canvas.removeEventListener('pointercancel', this.handlePointerUp.bind(this));
    canvas.removeEventListener('wheel', this.handleWheel.bind(this));

    canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    canvas.removeEventListener('touchcancel', this.handleTouchEnd.bind(this));
  }
}

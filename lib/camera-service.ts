// lib/camera-service.ts — Centralized Camera Hardware Manager Singleton
// Prevents dual-stream conflicts, memory leaks, and thermal throttling on mobile/tablet devices

export interface CameraOptions {
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
  frameRate?: number;
}

class CameraService {
  private static instance: CameraService | null = null;
  private activeStream: MediaStream | null = null;
  private refCount = 0;
  private isAcquiring = false;

  private constructor() {}

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  public isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  }

  /**
   * Acquire a shared camera stream with adaptive mobile-first resolution
   */
  public async acquireStream(options: CameraOptions = {}): Promise<MediaStream> {
    if (!this.isSupported()) {
      throw new Error('Camera hardware access is not supported in this browser environment.');
    }

    // Return active healthy stream if already open
    if (this.activeStream && this.activeStream.active) {
      const tracks = this.activeStream.getVideoTracks();
      if (tracks.length > 0 && tracks[0].readyState === 'live') {
        this.refCount++;
        return this.activeStream;
      }
    }

    if (this.isAcquiring) {
      // Wait for in-flight acquisition
      await new Promise((resolve) => setTimeout(resolve, 150));
      if (this.activeStream && this.activeStream.active) {
        this.refCount++;
        return this.activeStream;
      }
    }

    this.isAcquiring = true;

    try {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const defaultWidth = options.width || (isMobile ? 480 : 640);
      const defaultHeight = options.height || (isMobile ? 360 : 480);
      const facingMode = options.facingMode || 'user';
      const frameRate = options.frameRate || 30;

      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: defaultWidth, max: 1280 },
          height: { ideal: defaultHeight, max: 720 },
          facingMode: { ideal: facingMode },
          frameRate: { ideal: frameRate, max: 30 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.activeStream = stream;
      this.refCount++;
      return stream;
    } finally {
      this.isAcquiring = false;
    }
  }

  private isEcoMode = false;
  private lastFrameTimes: number[] = [];
  private currentFPS = 30;

  /**
   * Toggle Classroom Eco Mode (15fps low-power CV loop for budget Android tablets)
   */
  public setEcoMode(enabled: boolean): void {
    this.isEcoMode = enabled;
  }

  public getEcoMode(): boolean {
    return this.isEcoMode;
  }

  public getCurrentFPS(): number {
    return this.currentFPS;
  }

  /**
   * Records frame render latency and calculates instantaneous FPS.
   * Auto-suggests eco mode if device drops below 20fps for 5 consecutive samples.
   */
  public recordFrame(now: number): { fps: number; shouldThrottle: boolean } {
    this.lastFrameTimes.push(now);
    if (this.lastFrameTimes.length > 20) {
      this.lastFrameTimes.shift();
    }

    if (this.lastFrameTimes.length > 5) {
      const elapsed = now - this.lastFrameTimes[0];
      this.currentFPS = Math.round((this.lastFrameTimes.length / elapsed) * 1000);
    }

    const shouldThrottle = this.currentFPS < 20 && !this.isEcoMode;
    return { fps: this.currentFPS, shouldThrottle };
  }

  /**
   * Safely release hardware stream reference; stops tracks when refCount hits 0
   */
  public releaseStream(): void {
    this.refCount = Math.max(0, this.refCount - 1);

    if (this.refCount === 0 && this.activeStream) {
      try {
        this.activeStream.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (err) {
        console.warn('[CameraService] Error stopping tracks:', err);
      } finally {
        this.activeStream = null;
      }
    }
  }

  /**
   * Force kill stream (e.g. on emergency unmount / page navigation)
   */
  public forceReleaseAll(): void {
    this.refCount = 0;
    if (this.activeStream) {
      try {
        this.activeStream.getTracks().forEach((track) => track.stop());
      } catch {
        // ignore
      }
      this.activeStream = null;
    }
  }

  /**
   * Attach stream to an HTMLVideoElement with play promise safety
   */
  public async attachToVideo(videoElement: HTMLVideoElement, stream: MediaStream): Promise<void> {
    if (!videoElement) return;

    videoElement.srcObject = stream;
    return new Promise((resolve, reject) => {
      videoElement.onloadedmetadata = async () => {
        try {
          await videoElement.play();
          resolve();
        } catch (err) {
          // Play was interrupted or disallowed
          console.warn('[CameraService] Video play interrupted:', err);
          resolve();
        }
      };
      videoElement.onerror = (err) => reject(err);
    });
  }

  public getActiveStream(): MediaStream | null {
    return this.activeStream && this.activeStream.active ? this.activeStream : null;
  }

  public getRefCount(): number {
    return this.refCount;
  }
}

export const cameraService = CameraService.getInstance();

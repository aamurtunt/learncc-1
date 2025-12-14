import { useState, useEffect } from 'react';
import { Canvas3D } from './components/Canvas3D';
import { PermissionGate } from './components/PermissionGate';
import { UnsupportedBrowser } from './components/UnsupportedBrowser';
import { checkBrowserSupport } from './utils/browserSupport';
import './styles/App.css';

/**
 * App Component
 *
 * Root application component for SoC Kinetic Typography project
 *
 * Features:
 * - Checks browser compatibility (WebGL, Camera API)
 * - Shows unsupported browser message if requirements not met
 * - Wraps Canvas3D with PermissionGate for camera access
 * - Shows permission prompt before initializing hand tracking
 * - Renders 3D particle system after permissions granted
 *
 * Flow:
 * 1. Check browser support (WebGL, Camera API)
 * 2. If unsupported, show UnsupportedBrowser component
 * 3. If supported, PermissionGate checks camera permissions
 * 4. If not granted, shows permission prompt UI
 * 5. After user grants permission, renders Canvas3D
 * 6. Canvas3D initializes Three.js scene and MediaPipe Hands
 * 7. Particles react to hand gestures
 */
function App() {
  const [browserSupport, setBrowserSupport] = useState<ReturnType<typeof checkBrowserSupport> | null>(null);

  useEffect(() => {
    // Check browser support on mount
    const support = checkBrowserSupport();
    setBrowserSupport(support);

    if (!support.isSupported) {
      console.warn('Browser not fully supported:', support.unsupportedFeatures);
    }
  }, []);

  // Show loading state while checking
  if (!browserSupport) {
    return <div className="app" />;
  }

  // Show unsupported browser message
  if (!browserSupport.isSupported) {
    return (
      <div className="app">
        <UnsupportedBrowser unsupportedFeatures={browserSupport.unsupportedFeatures} />
      </div>
    );
  }

  // Render normal app
  return (
    <div className="app">
      <PermissionGate>
        <Canvas3D />
      </PermissionGate>
    </div>
  );
}

export default App;

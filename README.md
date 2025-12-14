# SoC Kinetic Typography

An interactive 3D particle system that morphs into text based on hand gestures, built for the SP School of Computing.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Overview

This web application uses MediaPipe Hands for real-time hand gesture recognition and Three.js to render 3000+ particles that dynamically morph into text. The system demonstrates the intersection of computer vision and 3D graphics in an engaging, interactive experience.

## Features

- **Real-time Hand Tracking**: Uses MediaPipe Hands for accurate gesture detection
- **5 Gesture Recognition**:
  - Open Palm (5 fingers) → "SoC"
  - Point (index finger) → "Curiosity"
  - Victory (2 fingers) → "Ingenuity"
  - Three-Count (3 fingers) → "Deterministic"
  - Rapid Pulse (fast open/close) → "SP School Of Computing" with explosion effect
- **3D Particle System**: 3000 particles with smooth morphing animations
- **Performance Optimized**: Maintains 30-60 FPS on mid-range hardware
- **Cyberpunk Aesthetic**: Neon cyan particles, dark gradient background, glowing effects
- **Debug Panel**: Press 'D' to toggle FPS counter and tracking info
- **Browser Compatibility**: Automatic detection with fallback UI

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **3D Graphics**: Three.js
- **Computer Vision**: MediaPipe Hands
- **Font Rendering**: Three.js FontLoader

## Prerequisites

- Node.js 18+ and npm
- Modern browser with WebGL support (Chrome, Firefox, Edge recommended)
- Webcam for hand tracking

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd learncc-1

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

## Usage

### Getting Started

1. **Grant Camera Permission**: When prompted, allow camera access
2. **Show Your Hand**: Position your hand in front of the webcam
3. **Make Gestures**: Try different hand gestures to morph the particles

### Gestures

| Gesture | Hand Position | Result |
|---------|--------------|--------|
| Open Palm | All 5 fingers extended | "SoC" |
| Point | Index finger only | "Curiosity" |
| Victory | Index + middle fingers | "Ingenuity" |
| Three-Count | Index + middle + ring | "Deterministic" |
| Rapid Pulse | Fast open/close 2x | "SP School Of Computing" + explosion |

### Debug Mode

Press the **'D' key** to toggle the debug panel which shows:
- Real-time FPS counter
- Particle count
- Current gesture
- Hand tracking status
- Performance rating
- Camera feed toggle

## Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

Build output will be in the `dist/` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── Canvas3D.tsx    # Main 3D canvas container
│   ├── GestureLabel.tsx # Gesture display UI
│   ├── DebugPanel.tsx  # Debug information panel
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useThreeScene.ts       # Three.js scene management
│   ├── useMediaPipeHands.ts   # Hand tracking
│   ├── useGestureRecognizer.ts # Gesture classification
│   └── useParticleSystem.ts   # Particle morphing
├── three/              # Three.js classes
│   ├── ParticleSystem.ts         # Particle logic
│   ├── TextGeometryGenerator.ts  # Text to 3D points
│   └── SceneManager.ts           # Scene setup
├── mediapipe/          # Computer vision
│   ├── HandTracker.ts         # MediaPipe wrapper
│   ├── GestureClassifier.ts   # Gesture detection
│   └── RapidPulseBuffer.ts    # Temporal detection
└── utils/              # Utilities
    ├── constants.ts           # Project constants
    ├── mathUtils.ts           # Math helpers
    ├── performanceMonitor.ts  # FPS tracking
    └── browserSupport.ts      # Compatibility checks
```

## Performance

- **Target FPS**: 30-60 FPS
- **Particle Count**: 3000
- **Gesture Latency**: <100ms
- **Tested on**: Intel i5 + integrated graphics

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Fully Supported |
| Firefox | 88+ | ✅ Fully Supported |
| Edge | 90+ | ✅ Fully Supported |
| Safari | 14+ | ⚠️ Limited Support |

**Required Features**:
- WebGL
- getUserMedia (Camera API)

## Troubleshooting

### Low FPS

- Reduce particle count in `src/utils/constants.ts`
- Close other browser tabs
- Update graphics drivers

### Camera Not Working

- Grant camera permissions in browser settings
- Ensure no other app is using the camera
- Check browser console for errors

### Gestures Not Detected

- Ensure good lighting conditions
- Position hand clearly in camera view
- Check debug panel for tracking status

## Development

### Running Tests

```bash
npm run build  # Verify build succeeds
```

### Code Style

- TypeScript strict mode enabled
- ESLint configuration included
- Prefer functional components and hooks

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Credits

- **Three.js**: 3D graphics library
- **MediaPipe**: Hand tracking technology by Google
- **Helvetiker Font**: Open-source font under MgOpen license

## Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for SP School of Computing**

#Product Requirements Document (PRD)**Project Name:** SoC Kinetic Typography: Interactive 3D Particle System
**Version:** 1.0
**Date:** December 14, 2025
**Status:** Draft

##1. Executive SummaryThis project aims to build a web-based, interactive 3D visualization where text is constructed from thousands of floating particles. The application utilizes **MediaPipe Hands** to track user hand gestures in real-time via a webcam. Specific gestures trigger the particles to morph smoothly into defined text strings representing the core values and identity of the **SP School of Computing**.

##2. Goals & Objectives* **Engagement:** Create an immersive "wow" factor for open houses, outreach events, or lobby displays.
* **Interactivity:** Demonstrate real-time computer vision capabilities in a fun, accessible way.
* **Branding:** Visually reinforce the School of Computing identity and values (Curiosity, Ingenuity, Determinism).

##3. User Stories* **As a user**, I want to see my hand movements tracked on screen so I know the system is working.
* **As a user**, I want the particles to form readable text when I make specific hand signs.
* **As a user**, I want smooth transitions between texts so the visual experience feels fluid and magical.
* **As a developer**, I want the system to be performant (60fps) on standard laptops without heavy GPU requirements.

---

##4. Functional Requirements###4.1. Camera & Computer Vision* **Input:** Live webcam feed.
* **Tracking:** Utilize **MediaPipe Hands** for hand landmark detection.
* **Latency:** Detection must happen in near real-time (<100ms latency).
* **Confidence Threshold:** Gestures should only trigger if confidence score is > 0.8 to prevent flickering.

###4.2. Gesture Recognition LogicThe system must recognize the following specific states:

| Gesture Name | Physical Action | Triggered Text | Logic / Landmarks |
| --- | --- | --- | --- |
| **Open Palm** | All 5 fingers extended | **"SoC"** | No fingers folded. |
| **Point** | Index finger extended, others folded | **"Curiosity"** | Index TIP above PIP; others below. |
| **Victory** | Index & Middle extended, others folded | **"Ingenuity"** | Index & Middle TIPS above PIPs. |
| **Three-Count** | Index, Middle, Ring extended | **"Deterministic"** | Index, Middle, Ring TIPS above PIPs. |
| **Rapid Pulse** | Fast Open (Palm) \leftrightarrow Close (Fist) x 2 | **"SP School Of Computing"** | State change count > 3 within 1.5 seconds. |

###4.3. 3D Particle System* **Rendering Engine:** Three.js (WebGL).
* **Particle Count:** Minimum 3,000 particles to ensure text density is readable.
* **Behavior:**
* **Idle State:** When no hand is detected, particles float randomly or form a cloud.
* **Target State:** Particles must move from their current position to target coordinates defining the text shape (Morphing).
* **Physics:** Particles should have slight "noise" or drift even when forming text to keep the scene alive.



###4.4. The "Rapid Pulse" Special Event* **Detection:** The system must maintain a buffer of the last 60 frames (approx. 1-2 seconds) to detect the frequency of state changes between "Open Palm" and "Fist".
* **Action:** When triggered, the particles should perhaps explode outward before converging into the full "SP School Of Computing" string.

---

##5. Non-Functional Requirements* **Performance:** Must maintain consistent FPS (30-60) on a mid-range laptop (e.g., standard student device with integrated graphics).
* **Compatibility:** Chrome, Edge, Safari, and Firefox (latest versions).
* **Responsiveness:** The canvas must resize to fit the window or display screen (kiosk mode).
* **Privacy:** Video feed is processed locally on the client (browser-side); no video data is sent to a server.

---

##6. Technical Architecture###6.1. Tech Stack* **Framework:** Vanilla JavaScript or React (depending on integration needs).
* **3D Library:** **Three.js** (for high-performance WebGL rendering).
* **CV Library:** **Google MediaPipe Hands** (specifically the `@mediapipe/hands` and `@mediapipe/camera_utils` packages).
* **Font Parsing:** `Troika-Three-Text` or Three.js `FontLoader` to convert text strings into coordinate points for particles.

###6.2. Data Flow1. `Webcam` \rightarrow `MediaPipe Hands`
2. `MediaPipe` outputs `Landmarks` (x, y, z coordinates of 21 hand points).
3. `GestureParser` analyzes landmarks against rules \rightarrow Returns `State`.
4. `ParticleSystem` receives `State` \rightarrow Updates particle destination vectors.
5. `RenderLoop` interpolates particle position from `Current` to `Destination` using easing functions.

---

##7. UI/UX Design Guidelines* **Visual Style:**
* **Background:** Deep black or dark charcoal (`#121212`) to make particles pop.
* **Particle Color:** Cyan/Neon Blue (cyberpunk aesthetic) or School Colors.
* **Camera Feed:** Displayed as a small picture-in-picture (PIP) in the corner for user feedback, possibly stylized with a HUD overlay.


* **Feedback:**
* When a gesture is recognized, a subtle UI label (e.g., "Gesture Detected: Curiosity") should fade in to confirm the system understood the user.



---

##8. Implementation Roadmap###Phase 1: Setup & Detection* Initialize Three.js scene.
* Integrate MediaPipe and verify console logs for hand landmarks.

###Phase 2: Gesture Logic* Implement the logic to distinguish between Point, Victory, 3-Finger, and Palm.
* Implement the time-based buffer for the "Rapid Pulse" gesture.

###Phase 3: Text Morphing* Create a function to sample points from font geometry.
* Map particles to these points.
* Implement the interpolation (movement) logic.

###Phase 4: Polish* Add mouse interaction (particles scatter when mouse hovers).
* Optimize performance (instanced mesh rendering).

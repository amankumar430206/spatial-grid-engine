# spatial-grid-engine | Preview : https://l5v45h.csb.app/
---

# Smart Floor Management Dashboard

An interactive, enterprise-grade floor management dashboard built with **React**.
Supports pan/zoom floor view, minimap navigation, occupancy analytics, filtering, search, export snapshot, and modular dashboard layout.

---

## 🚀 Features

### 🗺 Interactive Floor Board

* Smooth pan & zoom
* Zoom to selected room
* Fit-to-screen
* Smooth easing animations
* Animated room color transitions

### 🧭 Minimap

* Live viewport tracking
* Click to navigate
* Drag viewport to move camera
* Collapse / Expand toggle

### 📊 Analytics

* Occupancy stats cards
* Real-time occupancy %
* Status-based room tracking

### 🏢 Floor Controls

* Multi-floor switcher
* Status filter (Available, Occupied, Maintenance, Cleaning)
* Room search (auto zoom on Enter)

### 🪟 Room Detail Modal

* Click room → opens detail modal
* Displays status & metadata

### 🖼 Export

* Export floor snapshot as PNG
* Captures current zoom state
* High resolution export

---

# 🏗 Project Structure

```
/components
 ├── DashboardLayout.jsx
 ├── FloorDashboard.jsx
 ├── OccupancyStats.jsx
 ├── FloorSwitcher.jsx
 ├── StatusFilter.jsx
 ├── StatusLegend.jsx
 ├── RoomDetailModal.jsx
```

---

# 🧠 Tech Stack

* React (Functional Components + Hooks)
* Tailwind CSS
* react-zoom-pan-pinch (Pan/Zoom engine)
* html2canvas (Export snapshot)

---

# 📦 Installation

```bash
git clone <repo-url>
cd floor-dashboard
npm install
npm start
```

---

# ⚙️ Core Concepts

## 1️⃣ Rooms as Reactive State

Rooms are generated as a grid and stored in state:

* Enables live updates
* Enables animated transitions
* Enables filtering & analytics

---

## 2️⃣ Pan & Zoom Engine

Uses `react-zoom-pan-pinch`:

* TransformWrapper
* TransformComponent
* setTransform()
* resetTransform()

Provides smooth GPU-accelerated transforms.

---

## 3️⃣ Minimap Architecture

* Scaled-down floor rendering
* Calculates scale ratio (miniWidth / floorWidth)
* Syncs transform state
* Viewport box represents visible camera area
* Dragging viewport updates main transform

---

## 4️⃣ Status System

Statuses:

* available
* occupied
* maintenance
* cleaning

Color mapping handled via inline styles for smooth transitions.

---

## 5️⃣ Snapshot Export

Uses `html2canvas`:

* Captures floor DOM
* Converts to canvas
* Downloads PNG
* Supports high-resolution scaling

---

# 🎯 How It Works

### Zoom To Room

* Calculate targetX / targetY
* Call `setTransform(x, y, scale, duration, easing)`

### Fit To Screen

* Call `resetTransform(duration)`

### Filter Rooms

* Filter state before rendering

### Search Room

* Listen for room ID
* Trigger zoomToRoom()

---

# 🎨 UI Components Overview

| Component       | Purpose                 |
| --------------- | ----------------------- |
| DashboardLayout | Sidebar + Navbar layout |
| FloorDashboard  | Main interactive board  |
| OccupancyStats  | KPI analytics cards     |
| FloorSwitcher   | Switch between floors   |
| StatusFilter    | Filter by room status   |
| StatusLegend    | Status color guide      |
| RoomDetailModal | Room info popup         |


---

# 1️⃣ Objective

Design and implement an interactive floor management dashboard that supports:

* Grid-based room rendering
* Smooth pan & zoom navigation
* Minimap synchronization
* Room filtering & search
* Occupancy analytics
* Multi-floor switching
* Snapshot export
* Modular dashboard layout

---

# 2️⃣ System Overview (Frontend Scope)

This is a **SPA (Single Page Application)** built with React using:

* Component-driven architecture
* Local state management (Hooks)
* Controlled animations
* DOM-based rendering with transform optimizations

The application is structured as a **dashboard layout** with:

* Sidebar
* Navbar
* Main Content Area (Floor Board)
* Modal Layer


# 4️⃣ Component Design (LLD)

---

## 4.1 DashboardLayout

### Responsibility

* Provides global layout structure
* Manages sidebar state
* Contains navigation + content area

### State

* `isSidebarOpen`

---

## 4.2 FloorDashboard

### Responsibility

* Orchestrates entire floor experience
* Maintains room state
* Handles filtering, search, floor switching

### State

```js
rooms
selectedRoom
selectedFloor
statusFilter
transformState
isMinimapCollapsed
```

### Key Functions

* `zoomToRoom(roomId)`
* `handleFilter(status)`
* `switchFloor(floorId)`
* `exportSnapshot()`
* `fitToScreen()`

---

## 4.3 RoomGrid

### Responsibility

* Render rooms as CSS Grid
* Apply animated status color transitions
* Handle click interactions

### Rendering Logic

Rooms are generated dynamically:

```js
rows × columns → map → room objects
```

Each room contains:

```js
{
  id,
  status,
  floor,
  position: { row, col }
}
```

---

## 4.4 Minimap

### Responsibility

* Display scaled-down floor
* Sync viewport with transform state
* Handle drag-to-move interactions

### Internal Calculations

```
miniScale = miniWidth / floorWidth
viewportX = -transformX * miniScale
viewportY = -transformY * miniScale
```

### Events

* onClick → setTransform()
* onDrag → update main viewport

---

## 4.5 OccupancyStats

### Responsibility

* Compute occupancy metrics
* Display KPI cards

### Computation

```
occupiedCount = rooms.filter(r => r.status === 'occupied').length
occupancyRate = occupiedCount / totalRooms
```

---

## 4.6 StatusFilter

Filters rooms before rendering:

```js
filteredRooms = rooms.filter(room => room.status === statusFilter)
```

---

## 4.7 RoomDetailModal

* Controlled by `selectedRoom`
* Renders detailed room information
* Closes via state reset

---

# 5️⃣ State Management Design

All state is maintained locally using React Hooks.

## Why Local State?

* No cross-app global dependency
* Predictable UI
* Encapsulated component logic
* Lightweight architecture

---

# 6️⃣ Data Flow

```
User Interaction
     ↓
Event Handler
     ↓
State Update
     ↓
Re-render
     ↓
Derived UI Update
```

Example:
Click Room → setSelectedRoom → Modal Opens

---

# 7️⃣ Performance Design Considerations

### 1️⃣ Transform-based animations

Uses GPU-accelerated `transform` instead of position recalculations.

### 2️⃣ Grid Rendering

CSS grid instead of absolute positioning.

### 3️⃣ Controlled Re-renders

* Derived state instead of recomputation
* Filtering before mapping
* No unnecessary deep nested components

### 4️⃣ Smooth Easing

Custom duration + easing functions for transform updates.

---

# 8️⃣ Export Snapshot Design

Uses `html2canvas`:

Steps:

1. Capture DOM node
2. Render canvas
3. Convert to image
4. Trigger download

---

# 9️⃣ Error Handling Strategy

* Prevent invalid room search
* Guard null states
* Safe transform calls
* Default fallback for unknown statuses

---

# 🔟 Edge Cases Considered

* Large number of rooms
* Switching floors with active filters
* Minimap desync
* Zoom overflow
* Reset after filter

---

# 1️⃣1️⃣ Core Frontend Engineering Concepts Used

This project demonstrates strong frontend engineering fundamentals.

---

## ✅ 1. Component-Driven Architecture

* Separation of concerns
* Single Responsibility Principle
* Reusable UI blocks
* Scalable folder structure

---

## ✅ 2. State Management & Derived State

* Controlled state mutations
* Computed values (occupancy %, filters)
* UI reacts to data changes

Learning:

> UI is a function of state.

---

## ✅ 3. Controlled Animations & Transform Systems

* Smooth easing transitions
* GPU transform optimizations
* Avoid layout thrashing

Learning:

> Animations should not cause reflow.

---

## ✅ 4. Coordinate System Mapping

Minimap required:

* Scale conversion
* Viewport synchronization
* Drag-to-camera mapping

Learning:

> Understanding 2D transform math is crucial for advanced UI systems.

---

## ✅ 5. UX-Driven Engineering

Features like:

* Auto zoom on search
* Smooth easing
* Status legend
* Fit-to-screen
* Collapse toggle

Learning:

> UX polish differentiates mid-level from senior frontend engineers.

---

## ✅ 6. Grid-Based Layout Systems

Room placement uses:

* Logical indexing
* Grid positioning
* Dynamic generation

Learning:

> Data-driven UI generation improves scalability.

---

## ✅ 7. Modular Dashboard Architecture

* Layout abstraction
* Layered modal system
* Component orchestration

Learning:

> Good layout systems reduce long-term maintenance cost.

---

## ✅ 8. Performance Optimization Thinking

* Avoid unnecessary renders
* Avoid DOM recalculation
* Efficient state updates
* Transform-based movement

Learning:

> Rendering cost matters at scale.

---

# What You Learned as a Frontend Engineer

This project builds:

### 🧠 System Design Thinking (Frontend Level)

You didn’t just build UI — you built a UI system.

---

### 🧮 Spatial & Mathematical UI Logic

Handling:

* Scaling
* Translation
* Viewport mapping
* Animation easing

---

### 🎨 UX + Engineering Balance

Combining:

* Clean layout
* Smooth interactions
* Interactive minimap
* KPI visibility

---

### ⚙️ State-Oriented Architecture

Understanding:

* Single source of truth
* Derived state
* Controlled mutations

---

### 🏗 Scalable Component Design

Thinking in:

* Isolation
* Reusability
* Future extensibility

---

# 1️⃣3️⃣ Future Scalability Plan

* Virtualized grid for 1000+ rooms
* WebSocket live updates
* Backend integration
* Multi-building support
* Role-based permission system
* Persistent zoom state

---

# 1️⃣4️⃣ Conclusion

This is not just a UI project.

It demonstrates:

* Advanced React patterns
* Transform math understanding
* UX engineering maturity
* Modular architecture design
* Performance-first thinking
* Dashboard system scalability



Tell me your goal — interview, SaaS product, or portfolio polish?


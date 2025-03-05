# MandArt Web Architecture Overview

This document provides an overview of the MandArt Web application architecture, focusing on the state management system and component structure.

## Overview

The MandArt Web application follows a **modular, component-based architecture** with a clear **separation of concerns**. This ensures maintainability, scalability, and ease of debugging.

### Constants (`/constants`)
- Stores application-wide constants.
- Defines paths for **GitHub Pages** and **local development**.
- Ensures path consistency across different environments.

### Globals (`/globals.js`)
- Centralized **UI element ID management**.
- Provides a single source for **querying elements**.
- Prevents hardcoded DOM queries in multiple files.

### Components (`/components`)
- **Dumb UI components**: Handle **initialization, rendering, and structure**.
- Contain **no logic or state management**.
- UI updates occur in response to **state changes**.

### Models (`/models`)
- Define **low-level data structures** used throughout the app.
- Encapsulate key attributes and behaviors of entities.

### Render (`/render`)

- Contains rendering logic for **specific UI components**.
- Ensures a clear **separation of concerns** between data, state, and rendering.
- Files:
  - `render-canvas.js` - Handles rendering of the main drawing canvas.
  - `render-catalog.js` - Manages rendering of the MandArt catalog.
  - `render-catalog-dropdown.js` - Handles dropdown UI elements for catalog selection.
  - `render-color-editor.js` - Manages the UI for selecting and editing colors.

### Services (`/services`)
- Houses **core functions** related to fetching, processing, and external interactions.
- Manages **file loading, saving, and fetching** operations.
- Interfaces with external sources such as the **MandArt catalog**.

### State (`/state`)
- **Manages application state** and interacts with **models**.
- Acts as a **single source of truth** for:
  - Catalog state
  - File state
  - Other app-wide state data.
- Emits events when state changes, ensuring a **reactive UI**.

### Utils (`/utils`)
- Contains **helper functions** used across multiple modules.
- Avoids redundant code by providing **reusable utility methods**.

### Wiring (`/wiring`)
- **Connects UI elements to event handlers**.
- Defines event-based interactions for **buttons, modals, dropdowns, and other components**.
- Ensures that components remain **dumb** and do not handle their own interactions.

## Key Design Principles
- **Separation of Concerns:** Each module has a well-defined responsibility.
- **Event-Driven Architecture:** The app listens for state changes and updates the UI accordingly.
- **Scalability & Maintainability:** New features can be added without disrupting existing functionality.
- **Decoupled Components:** UI components do not handle logic or event management.



## State Management

The state management system follows a simple pub/sub pattern:

1. **Central State Hub**: `state/index.js` coordinates all state updates and subscriptions
2. **Domain-specific State**: Separate modules for shape, color, and file state
3. **Event Bus**: Notifications for state changes to update the UI
4. **Immutable Updates**: All state updates create new objects rather than mutating existing ones

### State Flow

```
┌────────────────┐      ┌─────────────────┐      ┌──────────────┐
│   User Input   │─────▶│  State Update   │─────▶│  Event Bus   │
└────────────────┘      └─────────────────┘      └──────────────┘
                                                        │
                                                        ▼
┌────────────────┐      ┌─────────────────┐      ┌──────────────┐
│   UI Update    │◀─────│  Subscribers    │◀─────│  Notification │
└────────────────┘      └─────────────────┘      └──────────────┘
```

## Component Structure

Components are designed to be modular and reusable:

- **Canvas**: Handles rendering the Mandelbrot set
- **ColorEditor**: Manages the color palette editing UI
- **Controls**: Provides UI controls for all parameters
- **ColorEditorRow**: Individual row in the color editor

### Component Interaction

```
┌───────────────┐     ┌────────────────┐     ┌───────────────┐
│     Canvas    │◀───▶│  State  Store  │◀───▶│  ColorEditor  │
└───────────────┘     └────────────────┘     └───────────────┘
                              ▲
                              │
                              ▼
┌───────────────┐     ┌────────────────┐
│    Controls   │◀───▶│ WASM Services  │
└───────────────┘     └────────────────┘
```

## Services

Services handle specific application functionality:

- **WASM Service**: Manages communication with the WebAssembly module
- **File Service**: Handles file loading and saving
- **Render Service**: Manages canvas rendering operations
- **Catalog Service**: Handles catalog item loading

## Data Models

The application uses structured data models:

- **Hue**: Represents a color in the palette
- **ShapeInputs**: Manages Mandelbrot shape parameters
- **ColorInputs**: Manages color and palette parameters

## Adding HTML Controls

With this architecture, adding HTML controls is straightforward:

1. **Define the control in HTML**:
   ```html
   <input type="range" id="spacing-color-far-control" min="1" max="20" step="0.5">
   ```

2. **Connect to state automatically** (happens during initialization):
   - Controls are automatically connected to the state based on their ID
   - IDs follow the pattern: `{parameter-name}-control`

3. **State changes trigger UI updates**:
   - When state changes, the `handleColorStateChanged` or `handleShapeStateChanged` functions update the UI

## Benefits of This Architecture

1. **Maintainability**: Clear separation of concerns makes code easier to maintain
2. **Testability**: Components and services can be tested in isolation
3. **Extensibility**: Easy to add new features or modify existing ones
4. **State Management**: Centralized state with predictable updates
5. **Component Reuse**: UI components can be reused across the application

## Implementation Steps

1. Replace existing code with this new architecture
2. Test core functionality (loading, saving, rendering)
3. Add additional controls as needed
4. Enhance with advanced features (undo/redo, presets, etc.)

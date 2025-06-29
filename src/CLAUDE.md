# CLAUDE.md - src Directory

> [!NOTE]
> This file provides guidance to Claude Code when working with the main application files in the src directory.

## Directory Overview

The src directory contains the application entry point and main App component that orchestrates the entire linear programming learning experience.

## Key Files

### app.tsx
The main application component that:
- Manages the collection of example problems (EXAMPLE_PROBLEMS object)
- Controls input mode switching (examples vs custom)
- Handles visualization mode selection (simplex vs duality)
- Coordinates problem selection and conversion flow

### main.tsx
Simple entry point that renders the App component with React StrictMode.

## Working with Example Problems

### Adding New Examples

Add to the `EXAMPLE_PROBLEMS` object in app.tsx:

```typescript
newProblem: {
  objective: [3, 2],           // Coefficients for objective function
  constraints: [
    { coefficients: [1, 2], rhs: 10, operator: '<=' },
    { coefficients: [2, 1], rhs: 8, operator: '>=' }
  ],
  isMaximization: true,        // false for minimization
  variables: ['x1', 'x2'],     // Variable names
  variableRestrictions: [true, false]  // true = non-negative, false = unrestricted
}
```

### Problem Categories

The examples are organized by teaching purpose:
- **Basic Examples** (example1-3): Simple 2-variable problems
- **Edge Cases**: unbounded, infeasible problems
- **Standard Form Examples**: Problems requiring conversion
- **Phase I Examples**: Problems needing artificial variables
- **Duality Examples**: Problems demonstrating primal-dual relationships

## State Management Pattern

```typescript
// Mode states
const [inputMode, setInputMode] = useState<'examples' | 'custom'>('examples');
const [visualizationMode, setVisualizationMode] = useState<'simplex' | 'duality'>('simplex');

// Problem states
const [customProblem, setCustomProblem] = useState<LinearProgram | null>(null);
const [customProblemOriginal, setCustomProblemOriginal] = useState<LinearProgram | null>(null);
```

### Important: Dual State for Custom Problems
- `customProblemOriginal`: Stores the original user input
- `customProblem`: Stores the converted standard form
- This allows duality mode to work with the original problem

## UI Structure

The app follows this component hierarchy:
1. Header with title and description
2. Input tabs (Examples | Custom Problem)
3. Visualization mode selector
4. Main visualization area (SimplexVisualizer or DualityVisualizer)
5. Footer with credits

## Localization

The entire application is in Portuguese (Brazilian):
- All UI text should be in Portuguese
- Educational content targets Brazilian university students
- Technical terms should use standard Portuguese LP terminology

## Common Modifications

### Changing Default Problem
Update the `selectedProblem` state initialization:
```typescript
const [selectedProblem, setSelectedProblem] = useState<string>('example1');
```

### Adding New Visualization Mode
1. Add to visualization mode type
2. Update the Tabs component
3. Add new visualization component to the conditional render

## References
- Component implementations: @src/components/CLAUDE.md
- Algorithm details: @src/lib/CLAUDE.md
- Main project guidance: @CLAUDE.md
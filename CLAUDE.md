# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- Build: `npm run build` or `pnpm build`
- Lint: `npm run lint` or `pnpm lint`
- Run tests: `npx vitest` or `pnpm vitest`
- Run a single test file: `npx vitest src/lib/simplex-solver.test.ts`
- Run tests in watch mode: `npx vitest --watch`
- Don't try running long-living processes, like pnpm dev

## Architecture Overview

This is an interactive linear programming learning application with the following key components:

### Core Algorithm
- `src/lib/simplex-solver.ts`: Implements the Two-Phase Simplex method with step-by-step tracking
- `src/lib/standard-form-conversion.ts`: Converts LP problems to standard form with detailed explanations

### Visualization Components
- `SimplexVisualizer.tsx`: Main orchestrator component managing the visualization flow
- `TableauVisualizer.tsx`: Interactive tableau display with highlighting for pivot operations
- `GeometricVisualizerVisx.tsx`: 2D geometric visualization using Visx library
- `StepController.tsx`: Navigation controls for stepping through the algorithm
- `StepExplanation.tsx`: Educational explanations for each step of the algorithm

### Key Data Flow
1. User inputs LP problem via `StructuredProblemForm.tsx` or `CustomProblemInput.tsx`
2. Problem is converted to standard form via `convertToStandardFormWithExplanation()`
3. `solveWithSteps()` generates all simplex steps with detailed metadata
4. Components visualize the current step and allow navigation through the solution

### Important Type Definitions
- `LinearProgram`: Basic LP representation with constraints and objective
- `SimplexTableau`: Tableau state including basis, matrix, and phase information
- `SimplexStep`: Single step with tableau state and status information
- Use npx jest on the file for testing
# Interactive Simplex Method Learning Application

An interactive, visual application for learning the simplex method and linear programming concepts.

## Features

- **Interactive Simplex Tableau Visualization**: Step through the simplex method with tableau operations visually highlighted.
- **D3.js-Powered Geometric Visualization**: See how the simplex method moves through the feasible region in 2D problems.
- **Step-by-Step Learning**: Follow along with detailed explanations at each step of the algorithm.
- **Example Problems**: Try different pre-loaded example problems to understand various cases.
- **Modern UI with shadcn/ui**: Clean, responsive interface using Tailwind CSS and shadcn/ui components.

## Project Structure

```
linear-programming/
├── src/
│   ├── components/
│   │   ├── GeometricVisualizerD3.tsx   # D3.js visualization of feasible region
│   │   ├── LearningContent.tsx         # Educational content and tutorials
│   │   ├── SimplexVisualizer.tsx       # Main visualization component
│   │   ├── StepController.tsx          # Navigation through simplex steps
│   │   ├── TableauVisualizer.tsx       # Tableau display and highlights
│   │   └── ui/                         # shadcn/ui components
│   ├── lib/
│   │   └── simplex-solver.ts           # Core simplex algorithm implementation
│   ├── app.tsx                         # Main application component
│   └── main.tsx                        # Entry point
```

## Technologies Used

- React with TypeScript
- Tailwind CSS for styling
- shadcn/ui for UI components
- D3.js for interactive visualizations

## Learning Path

The application is structured to guide users through the simplex method in these key stages:

1. **Understanding Linear Programming**: Learn about decision variables, objective functions, and constraints.
2. **Simplex Method Basics**: Understand the tableau structure and basic feasible solutions.
3. **Pivot Operations**: Learn how to select entering/leaving variables and perform pivots.
4. **Geometric Interpretation**: Visualize how the simplex method navigates through vertices of the feasible region.
5. **Special Cases**: Learn about multiple optimal solutions, unboundedness, and infeasibility.

## Interactive Visualizations

- **Tableau View**: Interactive table that highlights entering variables, leaving variables, and pivot elements.
- **Geometric View**: D3.js visualization of the feasible region, constraints, and current solution point.
- **Step-by-Step Controls**: Navigate through the algorithm's steps with play/pause controls and speed adjustment.

## Example Problems

The application includes pre-configured examples to demonstrate different scenarios:

- **Example 1**: Basic maximization problem with two variables and two constraints.
- **Example 2**: Alternative maximization problem with different constraint structures.
- **Example 3**: Problem with different objective function coefficients.
- **Unbounded Problem**: Demonstrates a case where the objective value can increase indefinitely.

## Requirements and Installation

To run the application:

1. Clone the repository
2. Install dependencies with `npm install` or `pnpm install`
3. Run the development server with `npm run dev` or `pnpm dev`
4. Open http://localhost:5173 to view the application
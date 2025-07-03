import React from 'react';
import SimplexVisualizer from './SimplexVisualizer';
import IntegerProgrammingVisualizer from './integer/IntegerProgrammingVisualizer';
import type { LinearProgram } from './types';

interface SolverVisualizerProps {
  lp: LinearProgram;
  showGeometric?: boolean;
  width?: number;
  height?: number;
}

/**
 * Parent component that decides which solver strategy to use
 * based on the problem characteristics
 */
const SolverVisualizer: React.FC<SolverVisualizerProps> = ({
  lp,
  showGeometric = true,
  width = 800,
  height = 400
}) => {
  // Check if this is an integer programming problem
  if (lp.integerConstraints && lp.integerConstraints.length > 0) {
    // Show Branch and Bound visualization for integer problems
    return (
      <IntegerProgrammingVisualizer 
        problem={{
          ...lp,
          integerConstraints: lp.integerConstraints.map(idx => ({
            variableIndex: idx,
            variableName: lp.variables[idx],
            mustBeInteger: true
          }))
        }} 
      />
    );
  }
  
  // Show regular simplex visualization for non-integer problems
  return (
    <SimplexVisualizer 
      lp={lp}
      showGeometric={showGeometric}
      width={width}
      height={height}
    />
  );
};

export default SolverVisualizer;
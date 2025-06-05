/**
 * Common types used across the simplex visualizer components
 */

// Define and export necessary types
interface LinearProgram {
  objective: number[];
  objectiveRHS?: number; // RHS value for the objective function (if any)
  constraints: {
    coefficients: number[];
    rhs: number;
    operator: '<=' | '>=' | '=';
  }[];
  isMaximization: boolean;
  variables: string[];
  variableRestrictions?: boolean[]; // true = non-negative, false = unrestricted
}

interface BaseTableau {
  matrix: number[][];
  basicVariables: number[];
  nonBasicVariables: number[];
  objectiveValue: number;
}

interface PhaseITableau extends BaseTableau {
  phase: 'phase1';
  // Phase I specific properties
  originalVariableNames: string[]; // Original variables (x1, x2, s1, s2, etc.)
  artificialVariableIndices: number[]; // Indices of artificial variables in the matrix
  artificialVariableNames: string[]; // Names of artificial variables (a1, a2, etc.)
  // Combined variable names for display
  variableNames: string[]; // All variables including artificial
}

interface PhaseIITableau extends BaseTableau {
  phase: 'phase2';
  variableNames: string[]; // Original variables only (no artificial)
  isMaximization: boolean;
}

// Union type for backwards compatibility
type SimplexTableau = PhaseITableau | PhaseIITableau;

interface SimplexStep {
  tableau: SimplexTableau;
  enteringVariable: number | null;
  leavingVariable: number | null;
  pivotElement: [number, number] | null;
  status: 'initial' | 'iteration' | 'optimal' | 'unbounded' | 'infeasible' | 'phase1_start' | 'phase2_start' | 'standard_form' | 'artificial_vars' | 'phase1_introduction' | 'phase1_canonicalize' | 'phase1_negate' | 'phase1_optimal' | 'phase2_noncanonical' | 'phase2_canonical';
  explanation: string;
}


export type { LinearProgram, SimplexTableau, SimplexStep, PhaseITableau, PhaseIITableau, BaseTableau };
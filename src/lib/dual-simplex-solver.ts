import type { SimplexTableau, SimplexStep, SimplexStatus } from '@/components/types';

/**
 * Dual Simplex Algorithm Implementation
 * 
 * Used when:
 * 1. Current solution is optimal (all reduced costs ≥ 0) but infeasible (some RHS < 0)
 * 2. After adding constraints that make current solution infeasible
 * 3. For re-optimization after changes to RHS values
 */

export interface DualSimplexStep extends SimplexStep {
  isDualStep: boolean;
  dualPivotReason?: string;
}

/**
 * Check if tableau is suitable for dual simplex
 * Returns true if optimal but infeasible
 */
export function isDualSimplexCandidate(tableau: SimplexTableau): boolean {
  // Check if all reduced costs are non-negative (optimal)
  const objectiveRow = tableau.matrix[0];
  const isOptimal = objectiveRow.slice(0, -1).every(val => val >= -1e-10);
  
  // Check if any RHS values are negative (infeasible)
  const hasNegativeRHS = tableau.matrix.slice(1).some(row => row[row.length - 1] < -1e-10);
  
  return isOptimal && hasNegativeRHS;
}

/**
 * Find the leaving variable for dual simplex
 * Choose the most negative RHS value
 */
function findDualLeavingVariable(tableau: SimplexTableau): number | null {
  let minRHS = 0;
  let leavingRow = -1;
  
  // Skip objective row (row 0)
  for (let i = 1; i < tableau.matrix.length; i++) {
    const rhs = tableau.matrix[i][tableau.matrix[i].length - 1];
    if (rhs < minRHS) {
      minRHS = rhs;
      leavingRow = i;
    }
  }
  
  if (leavingRow === -1) return null;
  
  // Return the basic variable in the leaving row
  return tableau.basicVariables[leavingRow - 1];
}

/**
 * Find the entering variable for dual simplex
 * Use minimum ratio test on reduced costs
 */
function findDualEnteringVariable(
  tableau: SimplexTableau, 
  leavingRow: number
): number | null {
  const objectiveRow = tableau.matrix[0];
  const pivotRow = tableau.matrix[leavingRow];
  
  let minRatio = Infinity;
  let enteringCol = -1;
  
  // Check each non-basic variable
  for (let j = 0; j < tableau.matrix[0].length - 1; j++) {
    // Skip if already basic
    if (tableau.basicVariables.includes(j)) continue;
    
    const pivotElement = pivotRow[j];
    
    // Only consider negative pivot elements
    if (pivotElement < -1e-10) {
      const ratio = Math.abs(objectiveRow[j] / pivotElement);
      
      if (ratio < minRatio) {
        minRatio = ratio;
        enteringCol = j;
      }
    }
  }
  
  // If no valid entering variable found, problem is infeasible
  if (enteringCol === -1) return null;
  
  return enteringCol;
}

/**
 * Perform pivot operation for dual simplex
 */
function dualPivot(
  tableau: SimplexTableau,
  enteringVar: number,
  leavingVar: number
): SimplexTableau {
  const newTableau = JSON.parse(JSON.stringify(tableau)) as SimplexTableau;
  
  // Find pivot row (where leaving variable is basic)
  const pivotRowIndex = tableau.basicVariables.indexOf(leavingVar) + 1;
  const pivotColIndex = enteringVar;
  const pivotElement = tableau.matrix[pivotRowIndex][pivotColIndex];
  
  // Update basic variables
  newTableau.basicVariables[pivotRowIndex - 1] = enteringVar;
  
  // Perform row operations
  for (let i = 0; i < newTableau.matrix.length; i++) {
    if (i === pivotRowIndex) {
      // Divide pivot row by pivot element
      for (let j = 0; j < newTableau.matrix[i].length; j++) {
        newTableau.matrix[i][j] /= pivotElement;
      }
    } else {
      // Eliminate column in other rows
      const factor = newTableau.matrix[i][pivotColIndex];
      for (let j = 0; j < newTableau.matrix[i].length; j++) {
        newTableau.matrix[i][j] -= factor * tableau.matrix[pivotRowIndex][j] / pivotElement;
      }
    }
  }
  
  // Update objective value
  newTableau.objectiveValue = -newTableau.matrix[0][newTableau.matrix[0].length - 1];
  
  return newTableau;
}

/**
 * Execute one iteration of dual simplex
 */
export function dualSimplexIteration(tableau: SimplexTableau): DualSimplexStep {
  // Check if already feasible
  const isFeasible = tableau.matrix.slice(1).every(
    row => row[row.length - 1] >= -1e-10
  );
  
  if (isFeasible) {
    return {
      tableau,
      enteringVariable: null,
      leavingVariable: null,
      pivotElement: null,
      status: 'optimal' as SimplexStatus,
      explanation: 'Solução ótima encontrada pelo Dual Simplex',
      isDualStep: true
    };
  }
  
  // Find leaving variable (most negative RHS)
  const leavingVar = findDualLeavingVariable(tableau);
  
  if (leavingVar === null) {
    return {
      tableau,
      enteringVariable: null,
      leavingVariable: null,
      pivotElement: null,
      status: 'error' as SimplexStatus,
      explanation: 'Erro: Nenhuma variável de saída encontrada',
      isDualStep: true
    };
  }
  
  const leavingRow = tableau.basicVariables.indexOf(leavingVar) + 1;
  
  // Find entering variable
  const enteringVar = findDualEnteringVariable(tableau, leavingRow);
  
  if (enteringVar === null) {
    return {
      tableau,
      enteringVariable: null,
      leavingVariable: null,
      pivotElement: null,
      status: 'infeasible' as SimplexStatus,
      explanation: 'Problema inviável detectado pelo Dual Simplex',
      isDualStep: true
    };
  }
  
  // Perform pivot
  const newTableau = dualPivot(tableau, enteringVar, leavingVar);
  const pivotElement = tableau.matrix[leavingRow][enteringVar];
  
  return {
    tableau: newTableau,
    enteringVariable: enteringVar,
    leavingVariable: leavingVar,
    pivotElement,
    status: 'dual_iteration' as SimplexStatus,
    explanation: `Iteração Dual Simplex: ${tableau.variableNames[enteringVar]} entra, ${tableau.variableNames[leavingVar]} sai`,
    isDualStep: true,
    dualPivotReason: `RHS negativo na linha de ${tableau.variableNames[leavingVar]} = ${tableau.matrix[leavingRow][tableau.matrix[leavingRow].length - 1].toFixed(2)}`
  };
}

/**
 * Solve using dual simplex method
 */
export function solveDualSimplex(
  initialTableau: SimplexTableau,
  maxIterations: number = 50
): DualSimplexStep[] {
  const steps: DualSimplexStep[] = [];
  let currentTableau = initialTableau;
  let iteration = 0;
  
  // Add initial step
  steps.push({
    tableau: currentTableau,
    enteringVariable: null,
    leavingVariable: null,
    pivotElement: null,
    status: 'dual_start' as SimplexStatus,
    explanation: 'Iniciando Dual Simplex (solução ótima mas infactível)',
    isDualStep: true
  });
  
  while (iteration < maxIterations) {
    const step = dualSimplexIteration(currentTableau);
    steps.push(step);
    
    if (step.status === 'optimal' || 
        step.status === 'infeasible' || 
        step.status === 'error') {
      break;
    }
    
    currentTableau = step.tableau;
    iteration++;
  }
  
  if (iteration >= maxIterations) {
    steps.push({
      tableau: currentTableau,
      enteringVariable: null,
      leavingVariable: null,
      pivotElement: null,
      status: 'error' as SimplexStatus,
      explanation: 'Número máximo de iterações atingido',
      isDualStep: true
    });
  }
  
  return steps;
}

/**
 * Create a re-optimization example by modifying RHS
 */
export function createReoptimizationScenario(
  optimalTableau: SimplexTableau,
  rhsChanges: { constraint: number; newValue: number }[]
): SimplexTableau {
  const modifiedTableau = JSON.parse(JSON.stringify(optimalTableau)) as SimplexTableau;
  
  // Apply RHS changes
  rhsChanges.forEach(change => {
    // constraint is 0-indexed, but we need to skip objective row
    const rowIndex = change.constraint + 1;
    if (rowIndex < modifiedTableau.matrix.length) {
      modifiedTableau.matrix[rowIndex][modifiedTableau.matrix[rowIndex].length - 1] = change.newValue;
    }
  });
  
  // Recalculate objective value
  modifiedTableau.objectiveValue = -modifiedTableau.matrix[0][modifiedTableau.matrix[0].length - 1];
  
  return modifiedTableau;
}

/**
 * Check if a tableau needs dual simplex after modifications
 */
export function needsDualSimplex(tableau: SimplexTableau): {
  needed: boolean;
  reason: string;
  negativeRows: number[];
} {
  const objectiveRow = tableau.matrix[0];
  const isOptimal = objectiveRow.slice(0, -1).every(val => val >= -1e-10);
  
  const negativeRows: number[] = [];
  tableau.matrix.slice(1).forEach((row, idx) => {
    if (row[row.length - 1] < -1e-10) {
      negativeRows.push(idx);
    }
  });
  
  const hasNegativeRHS = negativeRows.length > 0;
  
  if (!isOptimal) {
    return {
      needed: false,
      reason: 'Solução não é ótima. Use Simplex Primal.',
      negativeRows: []
    };
  }
  
  if (!hasNegativeRHS) {
    return {
      needed: false,
      reason: 'Solução é ótima e factível.',
      negativeRows: []
    };
  }
  
  return {
    needed: true,
    reason: `Solução é ótima mas infactível. ${negativeRows.length} linha(s) com RHS negativo.`,
    negativeRows
  };
}
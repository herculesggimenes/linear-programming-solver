/**
 * Common functions and utilities for the simplex method
 * Used by both Phase I and Phase II solvers
 */

import type { SimplexTableau } from '../components/types';

/**
 * Find entering variable (most negative coefficient in objective row for minimization)
 * @param tableau - Current simplex tableau
 * @returns Column index of entering variable or null if optimal
 */
export function findEnteringVariable(tableau: SimplexTableau): number | null {
  const { matrix, nonBasicVariables } = tableau;
  
  let minCoeff = 0;
  let enteringVarIndex = null;
  
  // Only check non-basic variables
  for (let j = 0; j < nonBasicVariables.length; j++) {
    const col = nonBasicVariables[j];
    if (matrix[0][col] < minCoeff) {
      minCoeff = matrix[0][col];
      enteringVarIndex = col;
    }
  }
  
  return enteringVarIndex;
}

/**
 * Find leaving variable using minimum ratio test
 * @param tableau - Current simplex tableau
 * @param enteringCol - Column index of entering variable
 * @returns Row index of leaving variable or null if unbounded
 */
export function findLeavingVariable(tableau: SimplexTableau, enteringCol: number): number | null {
  const { matrix, basicVariables } = tableau;
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rhs = cols - 1;
  
  let minRatio = Infinity;
  let leavingRow = null;
  
  // Check each constraint row (skip objective row)
  for (let i = 1; i < rows; i++) {
    const coefficient = matrix[i][enteringCol];
    
    // Only consider positive coefficients
    if (coefficient > 0) {
      const ratio = matrix[i][rhs] / coefficient;
      
      if (ratio < minRatio) {
        minRatio = ratio;
        leavingRow = i;
      }
    }
  }
  
  return leavingRow;
}

/**
 * Perform pivot operation on tableau
 * @param tableau - Current tableau
 * @param pivotRow - Row index of pivot element
 * @param pivotCol - Column index of pivot element
 * @returns New tableau after pivot
 */
export function pivot(tableau: SimplexTableau, pivotRow: number, pivotCol: number): SimplexTableau {
  const { matrix, basicVariables, nonBasicVariables, variableNames } = tableau;
  const rows = matrix.length;
  const cols = matrix[0].length;
  
  // Create a deep copy of the matrix
  const newMatrix = matrix.map(row => [...row]);
  
  // Get pivot element
  const pivotElement = newMatrix[pivotRow][pivotCol];
  
  // Divide pivot row by pivot element
  for (let j = 0; j < cols; j++) {
    newMatrix[pivotRow][j] /= pivotElement;
  }
  
  // Eliminate pivot column from other rows
  for (let i = 0; i < rows; i++) {
    if (i !== pivotRow) {
      const factor = newMatrix[i][pivotCol];
      for (let j = 0; j < cols; j++) {
        newMatrix[i][j] -= factor * newMatrix[pivotRow][j];
      }
    }
  }
  
  // Update basic and non-basic variables
  const newBasicVariables = [...basicVariables];
  const newNonBasicVariables = [...nonBasicVariables];
  
  // Find which basic variable is leaving
  const leavingVarIndex = newBasicVariables.indexOf(basicVariables[pivotRow - 1]);
  const enteringVarIndex = newNonBasicVariables.indexOf(pivotCol);
  
  // Swap the variables
  if (leavingVarIndex !== -1 && enteringVarIndex !== -1) {
    const temp = newBasicVariables[leavingVarIndex];
    newBasicVariables[leavingVarIndex] = pivotCol;
    newNonBasicVariables[enteringVarIndex] = temp;
  }
  
  // Calculate new objective value
  // The simplex tableau stores -z in the objective row for maximization
  // For Phase I, we're minimizing w, so the value is stored directly
  let objectiveValue = newMatrix[0][cols - 1];
  
  // For Phase I, the objective value represents w (sum of artificial variables)
  if ('phase' in tableau && tableau.phase === 'phase1') {
    // Phase I minimizes w, value is stored directly (negated for tableau format)
    objectiveValue = -objectiveValue;
  } 
  // For Phase II maximization, negate to get actual objective value
  else if ('isMaximization' in tableau && tableau.isMaximization) {
    objectiveValue = -objectiveValue;
  }
  
  // Create new tableau based on phase
  if ('phase' in tableau) {
    return {
      ...tableau,
      matrix: newMatrix,
      basicVariables: newBasicVariables,
      nonBasicVariables: newNonBasicVariables,
      objectiveValue
    };
  }
  
  return {
    ...tableau,
    matrix: newMatrix,
    basicVariables: newBasicVariables,
    nonBasicVariables: newNonBasicVariables,
    objectiveValue
  };
}

/**
 * Generate detailed explanation for a simplex iteration
 */
export function generateIterationExplanation(
  tableau: SimplexTableau,
  enteringVar: number | null,
  leavingVar: number | null,
  iteration: number
): string {
  let explanation = `### Iteração ${iteration}\n\n`;
  
  if (enteringVar !== null && leavingVar !== null) {
    const enteringVarName = tableau.variableNames[enteringVar];
    const basicVarIndex = tableau.basicVariables[leavingVar - 1];
    const leavingVarName = tableau.variableNames[basicVarIndex];
    
    explanation += `**Variável Entrante**: ${enteringVarName} (coluna ${enteringVar})\n`;
    explanation += `**Variável que Sai**: ${leavingVarName} (linha ${leavingVar})\n\n`;
    
    explanation += "A variável entrante foi selecionada porque tem o coeficiente mais negativo ";
    explanation += "na linha objetivo, indicando que melhorará o valor objetivo.\n\n";
    
    explanation += "A variável que sai foi determinada usando o teste de razão mínima ";
    explanation += "para manter a viabilidade da solução.";
  } else if (enteringVar === null) {
    explanation += "Nenhuma variável entrante pode ser encontrada com coeficiente negativo na linha objetivo.\n";
    explanation += "Isso indica que a solução atual é ótima.";
  } else {
    explanation += "Nenhuma variável de saída pode ser encontrada (todos os coeficientes na coluna entrante são não-positivos).\n";
    explanation += "Isso indica que o problema é ilimitado.";
  }
  
  return explanation;
}

/**
 * Check if a solution is optimal
 */
export function isOptimal(tableau: SimplexTableau): boolean {
  const enteringVar = findEnteringVariable(tableau);
  return enteringVar === null;
}

/**
 * Check if a problem is unbounded
 */
export function isUnbounded(tableau: SimplexTableau, enteringCol: number): boolean {
  const leavingVar = findLeavingVariable(tableau, enteringCol);
  return leavingVar === null;
}
/**
 * Matrix operations for Linear Programming
 * Includes basis extraction, matrix inversion, and tableau reconstruction
 */

import type { SimplexTableau, LinearProgram } from '@/components/types';

/**
 * Represents a matrix as a 2D array of numbers
 */
export type Matrix = number[][];

/**
 * Represents the decomposition of an LP into matrix form
 */
export interface MatrixFormLP {
  A: Matrix;           // Constraint matrix
  b: number[];         // Right-hand side vector
  c: number[];         // Objective coefficients
  basicIndices: number[];    // Indices of basic variables
  nonBasicIndices: number[]; // Indices of non-basic variables
  B: Matrix;           // Basic columns matrix
  N: Matrix;           // Non-basic columns matrix
  cB: number[];        // Basic variable coefficients
  cN: number[];        // Non-basic variable coefficients
}

/**
 * Extract the matrix form from a linear program in standard form
 */
export function extractMatrixForm(lp: LinearProgram): { A: Matrix; b: number[]; c: number[] } {
  // Extract constraint matrix A
  const A = lp.constraints.map(constraint => [...constraint.coefficients]);
  
  // Extract RHS vector b
  const b = lp.constraints.map(constraint => constraint.rhs);
  
  // Extract objective coefficients c (negate if maximization since we work with minimization)
  const c = lp.objective.map(coef => lp.isMaximization ? -coef : coef);
  
  return { A, b, c };
}

/**
 * Extract basis and non-basis matrices from a tableau
 */
export function extractBasisMatrices(
  A: Matrix, 
  basicIndices: number[], 
  nonBasicIndices: number[]
): { B: Matrix; N: Matrix } {
  const m = A.length; // number of constraints
  
  // Extract basic columns
  const B: Matrix = Array(m).fill(null).map(() => Array(basicIndices.length).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < basicIndices.length; j++) {
      B[i][j] = A[i][basicIndices[j]];
    }
  }
  
  // Extract non-basic columns
  const N: Matrix = Array(m).fill(null).map(() => Array(nonBasicIndices.length).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < nonBasicIndices.length; j++) {
      N[i][j] = A[i][nonBasicIndices[j]];
    }
  }
  
  return { B, N };
}

/**
 * Calculate the inverse of a matrix using Gauss-Jordan elimination
 * Returns null if matrix is singular
 */
export function invertMatrix(matrix: Matrix): Matrix | null {
  const n = matrix.length;
  if (n === 0 || matrix[0].length !== n) {
    throw new Error("Matrix must be square");
  }
  
  // Create augmented matrix [A | I]
  const augmented: Matrix = matrix.map((row, i) => [
    ...row,
    ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
  ]);
  
  // Forward elimination
  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    
    // Swap rows
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    
    // Check for singular matrix
    if (Math.abs(augmented[i][i]) < 1e-10) {
      return null;
    }
    
    // Scale pivot row
    const pivot = augmented[i][i];
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }
    
    // Eliminate column
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }
  
  // Extract inverse from augmented matrix
  const inverse: Matrix = augmented.map(row => row.slice(n));
  
  return inverse;
}

/**
 * Multiply two matrices
 */
export function multiplyMatrices(A: Matrix, B: Matrix): Matrix {
  if (A[0].length !== B.length) {
    throw new Error("Invalid matrix dimensions for multiplication");
  }
  
  const m = A.length;
  const n = B[0].length;
  const result: Matrix = Array(m).fill(null).map(() => Array(n).fill(0));
  
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < A[0].length; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  
  return result;
}

/**
 * Multiply a matrix by a vector
 */
export function multiplyMatrixVector(A: Matrix, x: number[]): number[] {
  if (A[0].length !== x.length) {
    throw new Error("Invalid dimensions for matrix-vector multiplication");
  }
  
  return A.map(row => 
    row.reduce((sum, val, j) => sum + val * x[j], 0)
  );
}

/**
 * Check if a basic solution is feasible
 */
export function checkBasicFeasibility(
  B: Matrix, 
  b: number[]
): { feasible: boolean; solution: number[] | null } {
  const B_inv = invertMatrix(B);
  
  if (!B_inv) {
    return { feasible: false, solution: null };
  }
  
  // Calculate basic variable values: xB = B^(-1) * b
  const xB = multiplyMatrixVector(B_inv, b);
  
  // Check if all values are non-negative
  const feasible = xB.every(val => val >= -1e-10);
  
  return { feasible, solution: feasible ? xB : null };
}

/**
 * Reconstruct the simplex tableau using basis inverse
 */
export function reconstructTableau(
  A: Matrix,
  b: number[],
  c: number[],
  basicIndices: number[],
  B_inv: Matrix
): SimplexTableau {
  const m = A.length;
  const n = A[0].length;
  
  // Calculate updated constraint matrix: B^(-1) * A
  const updatedA = multiplyMatrices(B_inv, A);
  
  // Calculate updated RHS: B^(-1) * b
  const updatedRHS = multiplyMatrixVector(B_inv, b);
  
  // Extract basic variable costs
  const cB = basicIndices.map(idx => c[idx]);
  
  // Calculate reduced costs for all variables
  const reducedCosts = Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    // Extract column j from updated A
    const column = updatedA.map(row => row[j]);
    
    // Calculate cB^T * column
    let dotProduct = 0;
    for (let i = 0; i < m; i++) {
      dotProduct += cB[i] * column[i];
    }
    
    // Reduced cost = cj - cB^T * aj
    reducedCosts[j] = c[j] - dotProduct;
  }
  
  // Calculate objective value: cB^T * B^(-1) * b
  let objectiveValue = 0;
  for (let i = 0; i < m; i++) {
    objectiveValue += cB[i] * updatedRHS[i];
  }
  
  // Construct the tableau matrix
  const matrix: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // First row: reduced costs and objective value
  for (let j = 0; j < n; j++) {
    matrix[0][j] = reducedCosts[j];
  }
  matrix[0][n] = -objectiveValue; // Negative for minimization form
  
  // Constraint rows
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      matrix[i + 1][j] = updatedA[i][j];
    }
    matrix[i + 1][n] = updatedRHS[i];
  }
  
  // Create basic and non-basic variable arrays
  const nonBasicVariables = Array.from({ length: n }, (_, i) => i)
    .filter(i => !basicIndices.includes(i));
  
  // Variable names
  const variableNames = Array.from({ length: n }, (_, i) => {
    if (i < (n - m)) {
      return `x${i + 1}`;
    } else {
      return `s${i - (n - m) + 1}`;
    }
  });
  
  return {
    matrix,
    basicVariables: basicIndices,
    nonBasicVariables,
    variableNames,
    objectiveValue,
    phase: 'phase2',
    isMaximization: false
  };
}

/**
 * Format a matrix for display
 */
export function formatMatrix(matrix: Matrix, precision: number = 2): string[][] {
  return matrix.map(row => 
    row.map(val => val.toFixed(precision))
  );
}

/**
 * Create an identity matrix of size n
 */
export function identityMatrix(n: number): Matrix {
  return Array(n).fill(null).map((_, i) => 
    Array(n).fill(0).map((_, j) => i === j ? 1 : 0)
  );
}

/**
 * Transpose a matrix
 */
export function transposeMatrix(matrix: Matrix): Matrix {
  if (matrix.length === 0) return [];
  
  const m = matrix.length;
  const n = matrix[0].length;
  const transposed: Matrix = Array(n).fill(null).map(() => Array(m).fill(0));
  
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      transposed[j][i] = matrix[i][j];
    }
  }
  
  return transposed;
}

/**
 * Extract submatrix given row and column indices
 */
export function extractSubmatrix(
  matrix: Matrix, 
  rowIndices: number[], 
  colIndices: number[]
): Matrix {
  return rowIndices.map(i => 
    colIndices.map(j => matrix[i][j])
  );
}
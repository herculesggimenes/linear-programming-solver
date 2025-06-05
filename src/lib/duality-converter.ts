import type { LinearProgram } from '@/components/types';

export interface Constraint {
  coefficients: number[];
  rhs: number;
  operator: '<=' | '>=' | '=';
}

export interface DualityExplanation {
  primal: LinearProgram;
  dual: LinearProgram;
  conversionSteps: string;
  implications: string;
  economicInterpretation: string;
  theorems: string;
}

/**
 * Convert a primal linear program to its dual form
 * Handles both maximization and minimization problems
 */
export function convertToDual(primal: LinearProgram): DualityExplanation {
  // Determine if primal is maximization or minimization
  const isPrimalMax = primal.isMaximization !== false; // Default to true if not specified
  
  // Create dual problem
  const dual: LinearProgram = {
    isMaximization: !isPrimalMax,
    objective: [], // Will be filled based on RHS of primal constraints
    constraints: [],
    variables: [],
    variableRestrictions: [], // Will be filled based on primal constraint types
    objectiveRHS: primal.objectiveRHS || 0
  };
  
  // Step 1: Dual variables (one for each primal constraint)
  const dualVariables: string[] = [];
  const dualVariableRestrictions: boolean[] = [];
  
  for (let i = 0; i < primal.constraints.length; i++) {
    dualVariables.push(`y${i + 1}`);
    
    // Determine dual variable restrictions based on primal constraint type
    if (isPrimalMax) {
      // Max problem: <= gives y >= 0, >= gives y <= 0, = gives y unrestricted
      if (primal.constraints[i].operator === '<=') {
        dualVariableRestrictions.push(true); // y >= 0
      } else if (primal.constraints[i].operator === '>=') {
        dualVariableRestrictions.push(false); // Would need to handle y <= 0
      } else {
        dualVariableRestrictions.push(false); // y unrestricted
      }
    } else {
      // Min problem: >= gives y >= 0, <= gives y <= 0, = gives y unrestricted
      if (primal.constraints[i].operator === '>=') {
        dualVariableRestrictions.push(true); // y >= 0
      } else if (primal.constraints[i].operator === '<=') {
        dualVariableRestrictions.push(false); // Would need to handle y <= 0
      } else {
        dualVariableRestrictions.push(false); // y unrestricted
      }
    }
  }
  
  dual.variables = dualVariables;
  dual.variableRestrictions = dualVariableRestrictions;
  
  // Step 2: Dual objective coefficients (from primal constraint RHS)
  dual.objective = primal.constraints.map(c => c.rhs);
  
  // Step 3: Dual constraints (one for each primal variable)
  for (let j = 0; j < primal.variables.length; j++) {
    const dualConstraint: Constraint = {
      coefficients: [],
      operator: '>=', // Will be adjusted based on primal type and variable restrictions
      rhs: primal.objective[j]
    };
    
    // Extract column j from primal constraint matrix
    for (let i = 0; i < primal.constraints.length; i++) {
      dualConstraint.coefficients.push(primal.constraints[i].coefficients[j]);
    }
    
    // Determine constraint type based on primal variable restrictions
    const isVariableRestricted = primal.variableRestrictions && primal.variableRestrictions[j] !== false;
    
    if (!isVariableRestricted) {
      // Unrestricted variable → equality constraint in dual
      dualConstraint.operator = '=';
    } else if (isPrimalMax) {
      // Max primal with x ≥ 0 → dual constraint ≥
      dualConstraint.operator = '>=';
    } else {
      // Min primal with x ≥ 0 → dual constraint ≤
      dualConstraint.operator = '<=';
    }
    
    dual.constraints.push(dualConstraint);
  }
  
  return {
    primal,
    dual,
    conversionSteps: '',
    implications: '',
    economicInterpretation: '',
    theorems: ''
  };
}

/**
 * Format a linear program for display
 */
export function formatLinearProgram(lp: LinearProgram): string {
  let formatted = `${lp.isMaximization ? 'Maximizar' : 'Minimizar'}: `;
  
  // Format objective
  const objTerms = lp.objective.map((coef, i) => {
    if (coef === 0) return '';
    const sign = coef > 0 ? (i === 0 ? '' : ' + ') : ' - ';
    const absCoef = Math.abs(coef);
    const coefStr = absCoef === 1 ? '' : absCoef;
    return `${i === 0 && coef > 0 ? '' : sign}${coefStr}${lp.variables[i]}`;
  }).filter(term => term !== '').join('');
  
  formatted += objTerms;
  if (lp.objectiveRHS && lp.objectiveRHS !== 0) {
    formatted += ` + ${lp.objectiveRHS}`;
  }
  formatted += '\n\n';
  
  // Format constraints
  formatted += 'Sujeito a:\n';
  lp.constraints.forEach((constraint, i) => {
    const terms = constraint.coefficients.map((coef, j) => {
      if (coef === 0) return '';
      const sign = coef > 0 ? (j === 0 ? '' : ' + ') : ' - ';
      const absCoef = Math.abs(coef);
      const coefStr = absCoef === 1 ? '' : absCoef;
      return `${j === 0 && coef > 0 ? '' : sign}${coefStr}${lp.variables[j]}`;
    }).filter(term => term !== '').join('');
    
    formatted += `${terms} ${constraint.operator} ${constraint.rhs}\n`;
  });
  
  // Add variable restrictions
  formatted += '\n';
  if (lp.variableRestrictions) {
    const restricted: string[] = [];
    const unrestricted: string[] = [];
    
    lp.variables.forEach((v, i) => {
      if (lp.variableRestrictions![i] === false) {
        unrestricted.push(v);
      } else {
        restricted.push(v);
      }
    });
    
    if (restricted.length > 0) {
      formatted += restricted.join(', ') + ' ≥ 0';
    }
    if (unrestricted.length > 0) {
      if (restricted.length > 0) formatted += ', ';
      formatted += unrestricted.join(', ') + ' irrestrito';
    }
  } else {
    // Default: all variables non-negative
    formatted += lp.variables.join(', ') + ' ≥ 0';
  }
  
  return formatted;
}
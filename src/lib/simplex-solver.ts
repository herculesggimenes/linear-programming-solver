/**
 * Simplex method orchestrator for solving linear programming problems
 * Coordinates Phase I and Phase II solvers
 */

import type { LinearProgram, SimplexTableau, SimplexStep } from '../components/types';
import { convertToStandardFormWithExplanation } from './standard-form-conversion';
import { 
  needsPhaseOne, 
  createPhaseOneTableauOriginal,
  createPhaseOneTableau, 
  isInfeasible as isPhaseOneInfeasible,
  generateArtificialVarsExplanation,
  generatePhaseOneIntroductionExplanation,
  generatePhaseOneOptimalExplanation,
  generateInfeasibilityExplanation,
  createCanonicalSteps,
  generateCanonicalStepExplanation
} from './phase-one-solver';
import { 
  createInitialTableau, 
  createPhaseIITableau,
  createPhaseIINonCanonicalTableau,
  createPhaseIICanonicalSteps,
  generateStandardFormExplanation,
  generatePhaseTransitionExplanation,
  generatePhaseIINonCanonicalExplanation,
  generatePhaseIICanonicalExplanation,
  generatePhaseIICanonicalStepExplanation
} from './phase-two-solver';
import {
  findEnteringVariable,
  findLeavingVariable,
  pivot,
  generateIterationExplanation
} from './simplex-common';

// Re-export commonly used functions for backward compatibility
export { needsPhaseOne, createPhaseOneTableau, createInitialTableau, createPhaseIITableau, findEnteringVariable, findLeavingVariable };

/**
 * Solve a linear program with step-by-step visualization
 * @param lp - Linear program to solve
 * @param isAlreadyStandardForm - Whether the LP is already in standard form
 * @returns Array of steps showing the solution process
 */
export function solveWithSteps(lp: LinearProgram, isAlreadyStandardForm = false): SimplexStep[] {
  const steps: SimplexStep[] = [];
  
  // Keep track of original LP for Phase II
  const originalLP = lp;
  
  // Convert to standard form if needed
  let standardLP: LinearProgram;
  if (isAlreadyStandardForm) {
    standardLP = lp;
  } else {
    const conversionResult = convertToStandardFormWithExplanation(lp);
    standardLP = conversionResult.standardLP;
  }
  
  // Check if we need Phase I
  const needsPhaseI = needsPhaseOne(standardLP);
  
  let currentTableau: SimplexTableau;
  let iteration = 1;
  
  if (needsPhaseI) {
    // Phase I needed - show the steps
    
    // Step 1: Show standard form
    const standardFormTableau = createInitialTableau(standardLP);
    steps.push({
      tableau: standardFormTableau,
      enteringVariable: null,
      leavingVariable: null,
      pivotElement: null,
      status: 'standard_form',
      explanation: generateStandardFormExplanation(standardLP)
    });
    
    // Step 2: Show artificial variables being added
    const originalPhaseITableau = createPhaseOneTableauOriginal(standardLP);
    steps.push({
      tableau: originalPhaseITableau,
      enteringVariable: null,
      leavingVariable: null,
      pivotElement: null,
      status: 'artificial_vars',
      explanation: generateArtificialVarsExplanation(originalPhaseITableau, standardLP)
    });
    
    // Step 3: Introduce Phase I
    steps.push({
      tableau: originalPhaseITableau,
      enteringVariable: null,
      leavingVariable: null,
      pivotElement: null,
      status: 'phase1_introduction',
      explanation: generatePhaseOneIntroductionExplanation(originalPhaseITableau)
    });
    
    // Step 4: Show canonicalization steps
    const canonicalSteps = createCanonicalSteps(originalPhaseITableau);
    let previousTableau = originalPhaseITableau;
    
    canonicalSteps.forEach((stepTableau, index) => {
      steps.push({
        tableau: stepTableau,
        enteringVariable: null,
        leavingVariable: null,
        pivotElement: null,
        status: 'phase1_canonicalize',
        explanation: generateCanonicalStepExplanation(index, previousTableau, originalPhaseITableau.artificialVariableNames[index])
      });
      previousTableau = stepTableau;
    });
    
    // Step 5: Get the canonicalized Phase I tableau
    // Use the last canonical step as the starting point for Phase I iterations
    let phaseITableau = canonicalSteps.length > 0 
      ? canonicalSteps[canonicalSteps.length - 1]
      : createPhaseOneTableau(standardLP);
    
    // Step 7: Perform Phase I iterations to minimize artificial variables
    let phaseIIteration = 1;
    currentTableau = phaseITableau;
    
    // Phase I iterations - minimize w (sum of artificial variables)
    while (true) {
      const enteringCol = findEnteringVariable(currentTableau);
      
      if (enteringCol === null) {
        // Phase I optimal - check if feasible
        if (isPhaseOneInfeasible(currentTableau as typeof phaseITableau)) {
          steps.push({
            tableau: currentTableau,
            enteringVariable: null,
            leavingVariable: null,
            pivotElement: null,
            status: 'infeasible',
            explanation: generateInfeasibilityExplanation(currentTableau as typeof phaseITableau)
          });
          return steps;
        }
        // Phase I complete with w = 0, ready for Phase II
        steps.push({
          tableau: currentTableau,
          enteringVariable: null,
          leavingVariable: null,
          pivotElement: null,
          status: 'phase1_optimal',
          explanation: generatePhaseOneOptimalExplanation(currentTableau as typeof phaseITableau)
        });
        break;
      }
      
      const leavingRow = findLeavingVariable(currentTableau, enteringCol);
      
      if (leavingRow === null) {
        // This shouldn't happen in Phase I
        steps.push({
          tableau: currentTableau,
          enteringVariable: enteringCol,
          leavingVariable: null,
          pivotElement: null,
          status: 'unbounded',
          explanation: 'Phase I appears to be unbounded, which indicates an error in the formulation.'
        });
        return steps;
      }
      
      // Add Phase I iteration step
      steps.push({
        tableau: currentTableau,
        enteringVariable: enteringCol,
        leavingVariable: leavingRow,
        pivotElement: [leavingRow, enteringCol],
        status: 'iteration',
        explanation: generateIterationExplanation(currentTableau, enteringCol, leavingRow, phaseIIteration) + '\n\n**Note**: This is a Phase I iteration minimizing w (sum of artificial variables).'
      });
      
      // Perform pivot
      currentTableau = pivot(currentTableau, leavingRow, enteringCol);
      phaseIIteration++;
    }
    
    // Step 7: Transition to Phase II - First show non-canonical form
    const nonCanonicalTableau = createPhaseIINonCanonicalTableau(currentTableau as typeof phaseITableau, standardLP);
    steps.push({
      tableau: nonCanonicalTableau,
      enteringVariable: null,
      leavingVariable: null,
      pivotElement: null,
      status: 'phase2_noncanonical',
      explanation: generatePhaseIINonCanonicalExplanation(currentTableau as typeof phaseITableau, nonCanonicalTableau, standardLP)
    });
    
    // Step 8: Show step-by-step canonicalization for Phase II
    const phaseIICanonicalSteps = createPhaseIICanonicalSteps(nonCanonicalTableau);
    let previousPhaseIITableau = nonCanonicalTableau;
    
    let stepCount = 0;
    for (let i = 0; i < nonCanonicalTableau.basicVariables.length; i++) {
      const basicVarIdx = nonCanonicalTableau.basicVariables[i];
      const objCoeff = previousPhaseIITableau.matrix[0][basicVarIdx];
      
      if (Math.abs(objCoeff) > 1e-10) {
        // This basic variable needs canonicalization
        const stepTableau = phaseIICanonicalSteps[stepCount];
        const basicVarName = stepTableau.variableNames[basicVarIdx];
        
        steps.push({
          tableau: stepTableau,
          enteringVariable: null,
          leavingVariable: null,
          pivotElement: null,
          status: 'phase2_canonical',
          explanation: generatePhaseIICanonicalStepExplanation(i, previousPhaseIITableau, basicVarName, objCoeff)
        });
        previousPhaseIITableau = stepTableau;
        stepCount++;
      }
    }
    
    // Use the last canonical step as the Phase II tableau
    const phaseIITableau = phaseIICanonicalSteps.length > 0 
      ? phaseIICanonicalSteps[phaseIICanonicalSteps.length - 1]
      : createPhaseIITableau(currentTableau as typeof phaseITableau, standardLP);
    
    
    currentTableau = phaseIITableau;
    iteration = phaseIIteration;
  } else {
    // No Phase I needed - start directly with Phase II
    currentTableau = createInitialTableau(standardLP);
    
    steps.push({
      tableau: currentTableau,
      enteringVariable: null,
      leavingVariable: null,
      pivotElement: null,
      status: 'initial',
      explanation: 'Initial tableau created from standard form.'
    });
  }
  
  // Phase II iterations
  while (true) {
    const enteringCol = findEnteringVariable(currentTableau);
    
    if (enteringCol === null) {
      // Check if artificial variables are still in basis (infeasibility check)
      if ('variableNames' in currentTableau && currentTableau.variableNames) {
        const artificialInBasis = currentTableau.basicVariables.some((varIdx, i) => {
          const varName = currentTableau.variableNames[varIdx];
          // Check if it's an artificial variable and has non-zero value
          if (varName.startsWith('a') && varName !== 'a') {
            const value = currentTableau.matrix[i + 1][currentTableau.matrix[0].length - 1];
            return Math.abs(value) > 1e-10;
          }
          return false;
        });
        
        if (artificialInBasis) {
          // Infeasible - artificial variables still have positive values
          steps.push({
            tableau: currentTableau,
            enteringVariable: null,
            leavingVariable: null,
            pivotElement: null,
            status: 'infeasible',
            explanation: generatePhaseIIInfeasibilityExplanation(currentTableau)
          });
          return steps;
        }
      }
      
      // Optimal solution found
      steps.push({
        tableau: currentTableau,
        enteringVariable: null,
        leavingVariable: null,
        pivotElement: null,
        status: 'optimal',
        explanation: generateOptimalExplanation(currentTableau)
      });
      return steps;
    }
    
    // Find leaving variable
    const leavingRow = findLeavingVariable(currentTableau, enteringCol);
    
    if (leavingRow === null) {
      // Unbounded
      steps.push({
        tableau: currentTableau,
        enteringVariable: enteringCol,
        leavingVariable: null,
        pivotElement: null,
        status: 'unbounded',
        explanation: generateUnboundedExplanation(currentTableau, enteringCol)
      });
      return steps;
    }
    
    // Add iteration step
    steps.push({
      tableau: currentTableau,
      enteringVariable: enteringCol,
      leavingVariable: leavingRow,
      pivotElement: [leavingRow, enteringCol],
      status: 'iteration',
      explanation: generateIterationExplanation(currentTableau, enteringCol, leavingRow, iteration)
    });
    
    // Perform pivot
    currentTableau = pivot(currentTableau, leavingRow, enteringCol);
    iteration++;
  }
}

/**
 * Generate explanation for infeasibility detected in Phase II
 */
function generatePhaseIIInfeasibilityExplanation(tableau: SimplexTableau): string {
  let explanation = "### Problem is Infeasible\n\n";
  
  explanation += "The simplex algorithm has reached optimality, but artificial variables ";
  explanation += "remain in the basis with positive values. This indicates that the original ";
  explanation += "problem has no feasible solution.\n\n";
  
  explanation += "#### Why is this problem infeasible?\n\n";
  
  // List artificial variables still in basis
  const artificialInBasis: string[] = [];
  tableau.basicVariables.forEach((varIdx, i) => {
    const varName = tableau.variableNames[varIdx];
    if (varName.startsWith('a') && varName !== 'a') {
      const value = tableau.matrix[i + 1][tableau.matrix[0].length - 1];
      if (Math.abs(value) > 1e-10) {
        artificialInBasis.push(`${varName} = ${value.toFixed(4)}`);
      }
    }
  });
  
  explanation += "Artificial variables still in basis: " + artificialInBasis.join(', ') + "\n\n";
  
  explanation += "In a feasible problem, all artificial variables would be driven to zero ";
  explanation += "(out of the basis) during Phase II. Since they remain with positive values, ";
  explanation += "the constraints are contradictory and cannot be satisfied simultaneously.\n\n";
  
  explanation += "**Recommendation**: Review the constraints to identify contradictions or ";
  explanation += "adjust the right-hand side values to create a feasible region.";
  
  return explanation;
}

/**
 * Generate explanation for optimal solution
 */
function generateOptimalExplanation(tableau: SimplexTableau): string {
  let explanation = "### Optimal Solution Found\n\n";
  
  explanation += "All coefficients in the objective row are non-negative, ";
  explanation += "which means no variable can enter the basis to improve the objective value.\n\n";
  
  explanation += "**Solution Summary:**\n";
  
  // Get variable values
  const values: Record<string, number> = {};
  const { matrix, basicVariables, variableNames } = tableau;
  const rhsCol = matrix[0].length - 1;
  
  // Basic variables have their values in the RHS column
  for (let i = 0; i < basicVariables.length; i++) {
    const varIndex = basicVariables[i];
    const value = matrix[i + 1][rhsCol];
    values[variableNames[varIndex]] = value;
  }
  
  // Non-basic variables are zero
  for (const varName of variableNames) {
    if (!(varName in values)) {
      values[varName] = 0;
    }
  }
  
  // Display solution
  for (const [varName, value] of Object.entries(values)) {
    if (!varName.startsWith('s')) { // Show only decision variables
      explanation += `- ${varName} = ${value.toFixed(2)}\n`;
    }
  }
  
  explanation += `\n**Optimal objective value**: ${Math.abs(tableau.objectiveValue).toFixed(2)}`;
  
  return explanation;
}

/**
 * Generate explanation for unbounded problem
 */
function generateUnboundedExplanation(tableau: SimplexTableau, enteringCol: number): string {
  const enteringVarName = tableau.variableNames[enteringCol];
  
  let explanation = "### Problem is Unbounded\n\n";
  
  explanation += `The variable ${enteringVarName} can enter the basis, `;
  explanation += "but there is no limit to how much it can increase.\n\n";
  
  explanation += "All coefficients in the entering column are non-positive, ";
  explanation += "which means the objective value can be improved indefinitely.\n\n";
  
  explanation += "This typically indicates a modeling error - ";
  explanation += "real-world problems usually have natural bounds on variables.";
  
  return explanation;
}

/**
 * Simple standard form conversion for backward compatibility
 */
export function convertToStandardForm(lp: LinearProgram): LinearProgram {
  const result = convertToStandardFormWithExplanation(lp);
  return result.standardLP;
}
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
  generatePhaseIINonCanonicalExplanation,
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
    const phaseITableau = canonicalSteps.length > 0 
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
          explanation: 'A Fase I parece ser ilimitada, o que indica um erro na formulação.'
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
      explanation: 'Tableau inicial criado a partir da forma padrão.'
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
  let explanation = "### Problema é Inviável\n\n";
  
  explanation += "O algoritmo simplex alcançou a otimalidade, mas variáveis artificiais ";
  explanation += "permanecem na base com valores positivos. Isso indica que o problema ";
  explanation += "original não tem solução viável.\n\n";
  
  explanation += "#### Por que este problema é inviável?\n\n";
  
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
  
  explanation += "Variáveis artificiais ainda na base: " + artificialInBasis.join(', ') + "\n\n";
  
  explanation += "Em um problema viável, todas as variáveis artificiais seriam levadas a zero ";
  explanation += "(fora da base) durante a Fase II. Como elas permanecem com valores positivos, ";
  explanation += "as restrições são contraditórias e não podem ser satisfeitas simultaneamente.\n\n";
  
  explanation += "**Recomendação**: Revise as restrições para identificar contradições ou ";
  explanation += "ajuste os valores do lado direito para criar uma região viável.";
  
  return explanation;
}

/**
 * Generate explanation for optimal solution
 */
function generateOptimalExplanation(tableau: SimplexTableau): string {
  let explanation = "### Solução Ótima Encontrada\n\n";
  
  explanation += "Todos os coeficientes na linha objetivo são não-negativos, ";
  explanation += "o que significa que nenhuma variável pode entrar na base para melhorar o valor objetivo.\n\n";
  
  explanation += "**Resumo da Solução:**\n";
  
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
  
  explanation += `\n**Valor objetivo ótimo**: ${Math.abs(tableau.objectiveValue).toFixed(2)}`;
  
  return explanation;
}

/**
 * Generate explanation for unbounded problem
 */
function generateUnboundedExplanation(tableau: SimplexTableau, enteringCol: number): string {
  const enteringVarName = tableau.variableNames[enteringCol];
  
  let explanation = "### Problema é Ilimitado\n\n";
  
  explanation += `A variável ${enteringVarName} pode entrar na base, `;
  explanation += "mas não há limite para o quanto ela pode aumentar.\n\n";
  
  explanation += "Todos os coeficientes na coluna entrante são não-positivos, ";
  explanation += "o que significa que o valor objetivo pode ser melhorado indefinidamente.\n\n";
  
  explanation += "Isso geralmente indica um erro de modelagem - ";
  explanation += "problemas do mundo real geralmente têm limites naturais nas variáveis.";
  
  return explanation;
}

/**
 * Simple standard form conversion for backward compatibility
 */
export function convertToStandardForm(lp: LinearProgram): LinearProgram {
  const result = convertToStandardFormWithExplanation(lp);
  return result.standardLP;
}
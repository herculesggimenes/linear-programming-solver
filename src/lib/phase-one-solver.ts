/**
 * Phase I solver for the Two-Phase Simplex Method
 * 
 * Phase I is used when we don't have an obvious initial basic feasible solution.
 * It creates artificial variables and minimizes their sum to find a feasible solution.
 */

import type { LinearProgram, PhaseITableau } from '../components/types';

/**
 * Check if a linear program needs Phase I
 * @param lp - Linear program in standard form
 * @returns true if Phase I is needed
 */
export function needsPhaseOne(lp: LinearProgram): boolean {
  const numVars = lp.objective.length;
  const numConstraints = lp.constraints.length;
  
  // Check if we can find an identity matrix in the constraint coefficients
  // We need to find m columns (where m = number of constraints) that form an identity matrix
  const identityColumns: Map<number, number> = new Map(); // Maps constraint index to column index
  
  for (let col = 0; col < numVars; col++) {
    let isIdentityCol = true;
    let identityRow = -1;
    
    for (let row = 0; row < numConstraints; row++) {
      const coeff = lp.constraints[row].coefficients[col];
      if (coeff === 1 && identityRow === -1) {
        identityRow = row;
      } else if (coeff !== 0) {
        isIdentityCol = false;
        break;
      }
    }
    
    if (isIdentityCol && identityRow !== -1 && !identityColumns.has(identityRow)) {
      identityColumns.set(identityRow, col);
    }
  }
  
  // If we found identity columns for all constraints, we don't need Phase I
  return identityColumns.size < numConstraints;
}

/**
 * Create the initial Phase I tableau with artificial variables (before canonicalization)
 * This shows the original Phase I objective: minimize w = a1 + a2 + ...
 * @param lp - Linear program in standard form
 * @returns Phase I tableau with original objective row
 */
export function createPhaseOneTableauOriginal(lp: LinearProgram): PhaseITableau {
  const numVars = lp.objective.length;
  const numConstraints = lp.constraints.length;
  
  // Textbook approach: Add artificial variables to ALL constraints
  const needsArtificial: boolean[] = new Array(numConstraints).fill(true);
  
  // Count and create artificial variables (one for each constraint)
  const numArtificialVars = numConstraints;
  const totalVars = numVars + numArtificialVars;
  
  // Create artificial variable indices and names
  const artificialVarIndices: number[] = [];
  const artificialVarNames: string[] = [];
  for (let i = 0; i < numArtificialVars; i++) {
    artificialVarIndices.push(numVars + i);
    artificialVarNames.push(`a${i + 1}`);
  }
  
  // Initialize matrix for Phase I tableau
  const matrix: number[][] = [];
  
  // Step 1: Create the original Phase I objective row
  // Minimize w = a1 + a2 + ... 
  // In tableau form for minimization, we write: minimize z = a1 + a2 + ...
  // The coefficients are positive (+1) because we're minimizing their sum
  const objectiveRow = new Array(totalVars + 1).fill(0);
  
  // Set coefficient +1 for each artificial variable
  for (let i = 0; i < numArtificialVars; i++) {
    objectiveRow[numVars + i] = 1;
  }
  
  matrix.push(objectiveRow);
  
  // Step 2: Create constraint rows with artificial variables
  let artCount = 0;
  
  for (let i = 0; i < numConstraints; i++) {
    const row = new Array(totalVars + 1).fill(0);
    
    // Copy original variable coefficients
    for (let j = 0; j < numVars; j++) {
      row[j] = lp.constraints[i].coefficients[j];
    }
    
    // Add artificial variable if needed
    if (needsArtificial[i]) {
      row[numVars + artCount] = 1;
      artCount++;
    }
    
    // RHS
    row[totalVars] = lp.constraints[i].rhs;
    
    matrix.push(row);
  }
  
  // Determine basic variables (all artificial variables in textbook approach)
  const basicVariables: number[] = [];
  
  for (let i = 0; i < numConstraints; i++) {
    // All artificial variables are basic
    basicVariables.push(numVars + i);
  }
  
  // Non-basic variables are all others
  const nonBasicVariables: number[] = [];
  for (let i = 0; i < totalVars; i++) {
    if (!basicVariables.includes(i)) {
      nonBasicVariables.push(i);
    }
  }
  
  // Create combined variable names for display
  const allVariableNames = [...lp.variables, ...artificialVarNames];
  
  return {
    phase: 'phase1',
    matrix,
    basicVariables,
    nonBasicVariables,
    objectiveValue: 0, // Initial objective value before canonicalization
    originalVariableNames: lp.variables,
    artificialVariableIndices: artificialVarIndices,
    artificialVariableNames: artificialVarNames,
    variableNames: allVariableNames
  };
}


/**
 * Create the Phase I tableau with canonicalized objective row
 * This is the working tableau where artificial variables have been eliminated from the objective
 * @param lp - Linear program in standard form
 * @returns Phase I tableau ready for simplex iterations
 */
export function createPhaseOneTableau(lp: LinearProgram): PhaseITableau {
  // Start with the original tableau
  const tableau = createPhaseOneTableauOriginal(lp);
  
  // Deep copy the matrix to avoid modifying the original
  const matrix = tableau.matrix.map(row => [...row]);
  
  // Canonicalize the objective row by eliminating artificial variables
  // In textbook approach, all constraints have artificial variables that are basic
  for (let i = 0; i < tableau.basicVariables.length; i++) {
    const basicVar = tableau.basicVariables[i];
    const constraintRow = i + 1; // Constraint rows start at index 1
    
    // All basic variables are artificial variables in textbook approach
    // Get the coefficient of this artificial variable in the objective row
    const objCoeff = matrix[0][basicVar];
    
    if (objCoeff !== 0) {
      // Eliminate by subtracting objCoeff * constraint row from objective row
      // Row 0 = Row 0 - objCoeff * Row i
      for (let j = 0; j < matrix[0].length; j++) {
        matrix[0][j] -= objCoeff * matrix[constraintRow][j];
      }
    }
  }
  
  // The canonicalized tableau is now ready for Phase I iterations
  // After canonicalization:
  // - Basic variables (artificial) have coefficient 0
  // - Non-basic variables have negative coefficients
  // Negative coefficients indicate variables that can decrease w (minimize artificial variables)
  
  tableau.matrix = matrix;
  tableau.objectiveValue = matrix[0][matrix[0].length - 1];
  
  return tableau;
}


/**
 * Check if Phase I is complete (all artificial variables are zero)
 * @param tableau - Current Phase I tableau
 * @returns true if Phase I is complete and feasible
 */
export function isPhaseOneComplete(tableau: PhaseITableau): boolean {
  // The objective value is stored as negative in the tableau
  // Phase I is complete when w = 0, which means tableau.objectiveValue = 0
  return Math.abs(tableau.objectiveValue) < 1e-10;
}

/**
 * Check if the problem is infeasible based on Phase I results
 * @param tableau - Final Phase I tableau
 * @returns true if the problem is infeasible
 */
export function isInfeasible(tableau: PhaseITableau): boolean {
  // If we can't drive artificial variables to zero, the problem is infeasible
  // The objective value in Phase I represents w (sum of artificial variables)
  // For a feasible problem, w should be 0 at optimality
  // Due to the way we store values in the tableau (negated), we check if |objectiveValue| > epsilon
  return Math.abs(tableau.objectiveValue) > 1e-10;
}

/**
 * Create intermediate tableaus showing the canonicalization process
 * @param originalTableau - The Phase I tableau before canonicalization
 * @returns Array of intermediate tableaus showing each canonicalization step
 */
export function createCanonicalSteps(originalTableau: PhaseITableau): PhaseITableau[] {
  const steps: PhaseITableau[] = [];
  
  // Start with a deep copy of the original tableau
  let currentMatrix = originalTableau.matrix.map(row => [...row]);
  
  // For each artificial variable that is basic, eliminate it from the objective row
  originalTableau.artificialVariableIndices.forEach((artVarIndex, i) => {
    const constraintRow = i + 1; // Constraint rows start at index 1
    const objCoeff = currentMatrix[0][artVarIndex];
    
    if (objCoeff !== 0) {
      // Create a copy for this step
      const stepMatrix = currentMatrix.map(row => [...row]);
      
      // Perform the elimination
      for (let j = 0; j < stepMatrix[0].length; j++) {
        stepMatrix[0][j] -= objCoeff * stepMatrix[constraintRow][j];
      }
      
      // Create a tableau for this intermediate step
      const stepTableau: PhaseITableau = {
        ...originalTableau,
        matrix: stepMatrix,
        objectiveValue: stepMatrix[0][stepMatrix[0].length - 1]
      };
      
      steps.push(stepTableau);
      
      // Update current matrix for next iteration
      currentMatrix = stepMatrix.map(row => [...row]);
    }
  });
  
  return steps;
}

/**
 * Generate explanation for canonicalization step
 * @param stepIndex - Which artificial variable is being eliminated (0-based)
 * @param tableau - The tableau before this step
 * @param artificialVarName - Name of the artificial variable being eliminated
 * @returns Explanation string
 */
export function generateCanonicalStepExplanation(stepIndex: number, tableau: PhaseITableau, artificialVarName: string): string {
  let explanation = `### Canonicalizando a Linha Objetivo - Passo ${stepIndex + 1}\n\n`;
  
  const artVarIndex = tableau.artificialVariableIndices[stepIndex];
  const constraintRow = stepIndex + 1;
  const objCoeff = tableau.matrix[0][artVarIndex];
  
  explanation += `**Eliminando ${artificialVarName} da linha objetivo**\n\n`;
  
  explanation += `Coeficiente objetivo atual para ${artificialVarName}: ${objCoeff}\n`;
  explanation += `${artificialVarName} é básica na restrição ${constraintRow}\n\n`;
  
  explanation += `Para tornar o coeficiente 0, realizamos:\n`;
  explanation += `Linha 0 = Linha 0 - (${objCoeff}) × Linha ${constraintRow}\n\n`;
  
  explanation += `Esta operação garante que a variável básica ${artificialVarName} tenha coeficiente 0 na linha objetivo, `;
  explanation += `mantendo a forma canônica necessária para o método simplex.\n\n`;
  
  // Show the row operation details
  explanation += `**Detalhes da operação de linha:**\n`;
  const row0 = tableau.matrix[0];
  const rowN = tableau.matrix[constraintRow];
  
  explanation += `- Linha 0 Original: [${row0.map(v => v.toFixed(1)).join(', ')}]\n`;
  explanation += `- Linha ${constraintRow}: [${rowN.map(v => v.toFixed(1)).join(', ')}]\n`;
  explanation += `- ${objCoeff} × Linha ${constraintRow}: [${rowN.map(v => (objCoeff * v).toFixed(1)).join(', ')}]\n`;
  
  return explanation;
}

/**
 * Generate explanation for artificial variables step
 */
export function generateArtificialVarsExplanation(tableau: PhaseITableau, standardLP: LinearProgram): string {
  const { artificialVariableNames, matrix, variableNames } = tableau;
  
  let explanation = "### Adicionando Variáveis Artificiais\n\n";
  explanation += `Precisamos adicionar ${artificialVariableNames.length} variável${artificialVariableNames.length > 1 ? ' artificial' : ' artificial'} `;
  explanation += "para criar uma solução básica viável inicial.\n\n";
  
  explanation += "#### Por que Não Podemos Formar uma Base Inicial?\n\n";
  explanation += "Para o método simplex começar, precisamos de uma **matriz identidade** dentro da matriz de coeficientes das restrições. ";
  explanation += "Cada restrição precisa de uma variável que:\n";
  explanation += "- Tenha coeficiente 1 nessa restrição\n";
  explanation += "- Tenha coeficiente 0 em todas as outras restrições\n";
  explanation += "- Tenha coeficiente 0 na função objetivo\n\n";
  
  explanation += "**Quando variáveis de folga não funcionam:**\n\n";
  explanation += "1. **Restrições de igualdade (=)**: Nenhuma variável de folga é adicionada, então não existem colunas identidade\n";
  explanation += "   - Exemplo: `x₁ + x₂ = 4` não tem variável de folga\n\n";
  explanation += "2. **Restrições do tipo maior-ou-igual (≥)**: Variáveis de excesso têm coeficiente -1, não +1\n";
  explanation += "   - Exemplo: `x₁ + x₂ ≥ 5` torna-se `x₁ + x₂ - s₁ = 5`\n";
  explanation += "   - A variável de excesso s₁ tem coeficiente -1, que não forma uma coluna identidade\n\n";
  
  explanation += "3. **Restrições do tipo menor-ou-igual (≤)**: Estas CRIAM colunas identidade com variáveis de folga\n";
  explanation += "   - Exemplo: `2x₁ + 3x₂ ≤ 10` torna-se `2x₁ + 3x₂ + s₁ = 10`\n";
  explanation += "   - A variável de folga s₁ tem coeficiente +1, formando uma coluna identidade\n\n";
  
  explanation += "Como não podemos formar uma base inicial apenas com as variáveis de folga disponíveis, ";
  explanation += "precisamos introduzir variáveis artificiais para criar um ponto de partida para o método simplex.\n\n";
  
  explanation += "#### A Abordagem do Livro-Texto\n\n";
  explanation += "Adicionamos variáveis artificiais a TODAS as restrições para criar uma solução básica viável inicial uniforme. ";
  explanation += "Isso garante:\n";
  explanation += "- Um método consistente que funciona para qualquer tipo de restrição\n";
  explanation += "- Todas as variáveis artificiais formam uma matriz identidade\n";
  explanation += "- Fácil identificação da base inicial\n\n";
  
  explanation += "**Como variáveis artificiais criam uma matriz identidade:**\n";
  explanation += "```\n";
  explanation += "Restrições originais:    Após adicionar variáveis artificiais:\n";
  explanation += "x₁ + x₂ = 4             x₁ + x₂ + a₁ = 4\n";
  explanation += "2x₁ + x₂ = 8            2x₁ + x₂ + a₂ = 8\n\n";
  explanation += "Matriz de coeficientes para [x₁, x₂, a₁, a₂]:\n";
  explanation += "[1  1  1  0]   <- a₁ tem coeficiente 1 aqui, 0 em outros lugares\n";
  explanation += "[2  1  0  1]   <- a₂ tem coeficiente 1 aqui, 0 em outros lugares\n";
  explanation += "```\n\n";
  explanation += "As variáveis artificiais (a₁, a₂) formam uma matriz identidade perfeita, ";
  explanation += "nos dando uma base inicial: a₁ = 4, a₂ = 8, com todas as outras variáveis = 0.\n\n";
  
  // Show which constraints get artificial variables
  explanation += "#### Constraint Analysis:\n\n";
  for (let i = 0; i < standardLP.constraints.length; i++) {
    const constraint = standardLP.constraints[i];
    explanation += `Constraint ${i + 1}: `;
    // Format constraint
    const terms = [];
    for (let j = 0; j < constraint.coefficients.length; j++) {
      const coeff = constraint.coefficients[j];
      if (coeff !== 0) {
        const sign = terms.length > 0 && coeff > 0 ? "+" : "";
        terms.push(`${sign}${coeff}${standardLP.variables[j]}`);
      }
    }
    explanation += `${terms.join(" ")} = ${constraint.rhs}`;
    explanation += ` → Add artificial variable ${artificialVariableNames[i]}\n`;
  }
  
  explanation += "\n#### Modified Constraints:\n\n";
  explanation += "After adding artificial variables, the constraints become:\n\n";
  
  // Show modified constraints from the tableau
  const numConstraints = matrix.length - 1;
  for (let i = 1; i <= numConstraints; i++) {
    const row = matrix[i];
    const terms = [];
    
    // Original variables
    for (let j = 0; j < variableNames.length; j++) {
      const coeff = row[j];
      if (coeff !== 0) {
        const sign = terms.length > 0 && coeff > 0 ? "+" : "";
        terms.push(`${sign}${coeff}${variableNames[j]}`);
      }
    }
    
    explanation += `${terms.join(" ")} = ${row[row.length - 1]}\n`;
  }
  
  explanation += "\n#### New Objective Function:\n\n";
  explanation += "The original objective is temporarily replaced with:\n\n";
  explanation += "**Minimize w = ";
  explanation += artificialVariableNames.join(' + ');
  explanation += "**\n\n";
  
  explanation += "In tableau form, this becomes:\n";
  explanation += "- Coefficients for original variables: 0\n";
  explanation += "- Coefficients for artificial variables: -1\n";
  explanation += "- RHS: 0\n\n";
  
  // Show the objective row
  explanation += "Objective row: [";
  const objCoeffs = [];
  for (let j = 0; j < matrix[0].length - 1; j++) {
    objCoeffs.push(j < standardLP.variables.length ? "0" : "-1");
  }
  objCoeffs.push("0");
  explanation += objCoeffs.join(", ");
  explanation += "]\n\n";
  
  explanation += "#### Initial Basic Solution:\n\n";
  explanation += "The artificial variables form an identity matrix and become our initial basis:\n";
  
  // Show which variables are basic
  const basicVars = [];
  for (let i = 0; i < artificialVariableNames.length; i++) {
    basicVars.push(`${artificialVariableNames[i]} = ${matrix[i + 1][matrix[0].length - 1]}`);
  }
  explanation += "- " + basicVars.join(", ") + "\n";
  explanation += "- All other variables = 0\n\n";
  
  explanation += "This gives us a starting point for the simplex algorithm. ";
  explanation += "Our goal in Phase I is to minimize w (drive all artificial variables to zero).";
  
  return explanation;
}


/**
 * Generate explanation for Phase I introduction (before canonicalization)
 */
export function generatePhaseOneIntroductionExplanation(tableau: PhaseITableau): string {
  const { artificialVariableNames } = tableau;
  
  // Return a marker that will be handled by the StepExplanation component
  return `PHASE_I_INTRO:${artificialVariableNames.join(',')}`; 
}


/**
 * Generate explanation for Phase I optimal solution
 */
export function generatePhaseOneOptimalExplanation(tableau: PhaseITableau): string {
  const { objectiveValue } = tableau;
  
  let explanation = "### Phase I Optimal Solution Found\n\n";
  
  explanation += "**Phase I Complete!**\n\n";
  
  const wValue = -objectiveValue; // Negate because it's stored as negative
  explanation += `The optimal value of w = ${Math.abs(wValue) < 1e-10 ? '0' : wValue.toFixed(6)}\n\n`;
  
  if (Math.abs(wValue) < 1e-10) {
    explanation += "✅ **The problem is feasible!**\n\n";
    explanation += "All artificial variables have been successfully driven to zero. ";
    explanation += "This means we have found a feasible solution to the original problem.\n\n";
    explanation += "**Next Step**: Transition to Phase II\n\n";
    explanation += "We will now:\n";
    explanation += "1. Replace the Phase I objective with the original objective function\n";
    explanation += "2. Continue with the simplex method to find the optimal solution\n";
  } else {
    explanation += "❌ **The problem is infeasible!**\n\n";
    explanation += "The artificial variables could not be driven to zero. ";
    explanation += "This means the original constraints are contradictory and have no feasible solution.";
  }
  
  return explanation;
}

/**
 * Generate explanation for infeasibility
 */
export function generateInfeasibilityExplanation(): string {
  let explanation = "### Problem is Infeasible\n\n";
  
  explanation += "Phase I has terminated with a positive objective value, which means ";
  explanation += "we couldn't drive all artificial variables to zero. This indicates that ";
  explanation += "the original problem has no feasible solution.\n\n";
  
  explanation += "#### Why is this problem infeasible?\n\n";
  explanation += "The constraints are contradictory - there is no point that satisfies all constraints simultaneously. ";
  explanation += "This often happens when:\n\n";
  explanation += "1. Constraints define an empty feasible region\n";
  explanation += "2. Equality constraints are inconsistent\n";
  explanation += "3. Upper and lower bounds on variables conflict\n\n";
  
  explanation += "Since no feasible solution exists, the simplex method terminates.";
  
  return explanation;
}
/**
 * Phase II solver for the Simplex Method
 * 
 * Phase II solves the original linear programming problem
 * either directly (if no Phase I was needed) or after Phase I finds a feasible solution.
 */

import type { LinearProgram, PhaseITableau, PhaseIITableau } from '../components/types';

/**
 * Create an initial Phase II tableau directly from a linear program
 * Used when Phase I is not needed (we have an obvious initial basis)
 * @param lp - Linear program in standard form
 * @returns Initial Phase II tableau
 */
export function createInitialTableau(lp: LinearProgram): PhaseIITableau {
  const numVars = lp.variables.length;
  const numConstraints = lp.constraints.length;
  const totalVars = numVars; // No artificial variables in Phase II
  
  // Create matrix
  const matrix: number[][] = [];
  
  // Create objective row (negate coefficients for minimization)
  const objectiveRow: number[] = [];
  for (let j = 0; j < numVars; j++) {
    // For minimization, use coefficients as-is
    // For maximization, negate coefficients
    objectiveRow.push(lp.isMaximization ? -lp.objective[j] : lp.objective[j]);
  }
  
  // Add RHS for objective (usually 0)
  objectiveRow.push(lp.objectiveRHS || 0);
  matrix.push(objectiveRow);
  
  // Add constraint rows
  for (let i = 0; i < numConstraints; i++) {
    const row: number[] = [];
    
    // Copy coefficients
    for (let j = 0; j < numVars; j++) {
      row.push(lp.constraints[i].coefficients[j]);
    }
    
    // Add RHS
    row.push(lp.constraints[i].rhs);
    
    matrix.push(row);
  }
  
  // Find basic variables (look for identity columns)
  const basicVariables: number[] = [];
  const identityColumns: Map<number, number> = new Map(); // Maps row to column
  
  // Search for identity columns
  for (let col = 0; col < totalVars; col++) {
    let isIdentityColumn = true;
    let identityRow = -1;
    let oneCount = 0;
    
    for (let row = 1; row <= numConstraints; row++) {
      if (matrix[row][col] === 1) {
        oneCount++;
        identityRow = row - 1; // Convert to 0-based index
      } else if (matrix[row][col] !== 0) {
        isIdentityColumn = false;
        break;
      }
    }
    
    // Also check that objective row has 0 for this column
    if (matrix[0][col] !== 0) {
      isIdentityColumn = false;
    }
    
    if (isIdentityColumn && oneCount === 1 && identityRow >= 0) {
      identityColumns.set(identityRow, col);
    }
  }
  
  // Set basic variables based on identity columns found
  for (let i = 0; i < numConstraints; i++) {
    if (identityColumns.has(i)) {
      basicVariables[i] = identityColumns.get(i)!;
    } else {
      // This shouldn't happen in a proper standard form LP
      console.warn(`No identity column found for constraint ${i}`);
      // Default to assuming later variables are slack
      basicVariables[i] = numVars - numConstraints + i;
    }
  }
  
  // Non-basic variables are all others
  const nonBasicVariables: number[] = [];
  for (let i = 0; i < totalVars; i++) {
    if (!basicVariables.includes(i)) {
      nonBasicVariables.push(i);
    }
  }
  
  // Calculate initial objective value
  const objectiveValue = matrix[0][totalVars];
  
  return {
    phase: 'phase2',
    matrix,
    basicVariables,
    nonBasicVariables,
    objectiveValue,
    variableNames: lp.variables,
    isMaximization: lp.isMaximization
  };
}

/**
 * Create a non-canonical Phase II tableau from a completed Phase I tableau
 * This just replaces the objective row without canonicalizing
 * @param phaseOneTableau - The final Phase I tableau (with w = 0)
 * @param originalLP - The linear program in standard form (includes slack/surplus variables)
 * @returns Phase II tableau with non-canonical objective row
 */
export function createPhaseIINonCanonicalTableau(phaseOneTableau: PhaseITableau, originalLP: LinearProgram): PhaseIITableau {
  const { matrix: phaseIMatrix, basicVariables, variableNames, artificialVariableIndices } = phaseOneTableau;
  
  const numConstraints = phaseIMatrix.length - 1;
  const numVars = phaseIMatrix[0].length - 1; // All variables including artificial
  
  // Determine which columns to keep (drop artificial variables)
  const columnsToKeep: number[] = [];
  const newVariableNames: string[] = [];
  
  for (let i = 0; i < numVars; i++) {
    if (!artificialVariableIndices.includes(i)) {
      columnsToKeep.push(i);
      newVariableNames.push(variableNames[i]);
    }
  }
  
  // Add RHS column
  columnsToKeep.push(numVars);
  
  // Create mapping from old indices to new indices
  const oldToNewIndex = new Map<number, number>();
  columnsToKeep.forEach((oldIdx, newIdx) => {
    if (oldIdx < numVars) { // Don't map RHS column
      oldToNewIndex.set(oldIdx, newIdx);
    }
  });
  
  // Create matrix without artificial variable columns
  const matrix: number[][] = [];
  
  // Create new objective row with original objective coefficients
  const objectiveRow = new Array(columnsToKeep.length).fill(0);
  
  // Set original objective coefficients (only for non-artificial variables)
  for (let i = 0; i < originalLP.objective.length && i < newVariableNames.length; i++) {
    objectiveRow[i] = originalLP.objective[i];
  }
  
  // Set RHS of objective
  objectiveRow[columnsToKeep.length - 1] = originalLP.objectiveRHS || 0;
  
  // Add the non-canonical objective row
  matrix.push(objectiveRow);
  
  // Copy constraint rows, dropping artificial variable columns
  for (let i = 1; i <= numConstraints; i++) {
    const newRow: number[] = [];
    for (const colIdx of columnsToKeep) {
      newRow.push(phaseIMatrix[i][colIdx]);
    }
    matrix.push(newRow);
  }
  
  // Update basic variables indices to match new column positions
  const phaseIIBasicVars: number[] = [];
  
  // For each constraint, we need a basic variable
  for (let i = 0; i < basicVariables.length; i++) {
    const oldBasicVar = basicVariables[i];
    
    if (!artificialVariableIndices.includes(oldBasicVar)) {
      // This basic variable is not artificial, map it to new index
      const newIdx = oldToNewIndex.get(oldBasicVar);
      if (newIdx !== undefined) {
        phaseIIBasicVars.push(newIdx);
      }
    } else {
      // This is an artificial variable that's still basic
      // At the end of Phase I with w = 0, artificial variables should be non-basic
      // If they're still basic but have value 0, we can proceed but need to find a replacement
      
      // Look for a non-artificial variable in this row that could be basic
      const constraintRow = i + 1;
      let replacementFound = false;
      
      for (let j = 0; j < numVars; j++) {
        if (!artificialVariableIndices.includes(j) && Math.abs(phaseIMatrix[constraintRow][j]) > 1e-10) {
          const newIdx = oldToNewIndex.get(j);
          if (newIdx !== undefined && !phaseIIBasicVars.includes(newIdx)) {
            phaseIIBasicVars.push(newIdx);
            replacementFound = true;
            break;
          }
        }
      }
      
      if (!replacementFound) {
        // This constraint might be redundant or the problem might be degenerate
        console.warn(`Could not find replacement for artificial variable ${variableNames[oldBasicVar]} in row ${constraintRow}`);
      }
    }
  }
  
  // Calculate non-basic variables
  const phaseIINonBasicVars: number[] = [];
  for (let i = 0; i < newVariableNames.length; i++) {
    if (!phaseIIBasicVars.includes(i)) {
      phaseIINonBasicVars.push(i);
    }
  }
  
  return {
    phase: 'phase2',
    matrix,
    basicVariables: phaseIIBasicVars,
    nonBasicVariables: phaseIINonBasicVars,
    objectiveValue: objectiveRow[columnsToKeep.length - 1],
    variableNames: newVariableNames,
    isMaximization: false // Standard form is always minimization
  };
}

/**
 * Create a Phase II tableau from a completed Phase I tableau
 * @param phaseOneTableau - The final Phase I tableau (with w = 0)
 * @param originalLP - The linear program in standard form (includes slack/surplus variables)
 * @returns Phase II tableau ready to solve the original problem
 */
export function createPhaseIITableau(phaseOneTableau: PhaseITableau, originalLP: LinearProgram): PhaseIITableau {
  // First create the non-canonical tableau (which drops artificial variables)
  const nonCanonicalTableau = createPhaseIINonCanonicalTableau(phaseOneTableau, originalLP);
  
  // Then canonicalize it
  const { matrix, basicVariables, nonBasicVariables, variableNames } = nonCanonicalTableau;
  const numVars = matrix[0].length - 1;
  
  // Deep copy the matrix for canonicalization
  const canonicalMatrix = matrix.map(row => [...row]);
  
  // Make objective row canonical (zero out basic variable columns)
  for (let i = 0; i < basicVariables.length; i++) {
    const basicVarCol = basicVariables[i];
    const constraintRow = i + 1;
    
    if (Math.abs(canonicalMatrix[0][basicVarCol]) > 1e-10) {
      const coeff = canonicalMatrix[0][basicVarCol];
      // Subtract coeff * constraint row from objective row
      for (let j = 0; j <= numVars; j++) {
        canonicalMatrix[0][j] -= coeff * canonicalMatrix[constraintRow][j];
      }
    }
  }
  
  return {
    phase: 'phase2',
    matrix: canonicalMatrix,
    basicVariables: basicVariables,
    nonBasicVariables: nonBasicVariables,
    objectiveValue: canonicalMatrix[0][numVars],
    variableNames: variableNames,
    isMaximization: false // Standard form is always minimization
  };
}

/**
 * Create canonicalization steps for Phase II
 * @param nonCanonicalTableau - The Phase II tableau with non-canonical objective row
 * @returns Array of tableaus showing each canonicalization step
 */
export function createPhaseIICanonicalSteps(nonCanonicalTableau: PhaseIITableau): PhaseIITableau[] {
  const steps: PhaseIITableau[] = [];
  
  // Start with a deep copy of the non-canonical tableau
  let currentMatrix = nonCanonicalTableau.matrix.map(row => [...row]);
  
  // For each basic variable, eliminate it from the objective row if needed
  for (let i = 0; i < nonCanonicalTableau.basicVariables.length; i++) {
    const basicVar = nonCanonicalTableau.basicVariables[i];
    const constraintRow = i + 1; // Constraint rows start at index 1
    const objCoeff = currentMatrix[0][basicVar];
    
    if (Math.abs(objCoeff) > 1e-10) { // If coefficient is not zero
      // Create a copy for this step
      const stepMatrix = currentMatrix.map(row => [...row]);
      
      // Perform the elimination: Row 0 = Row 0 - objCoeff * Row i
      for (let j = 0; j < stepMatrix[0].length; j++) {
        stepMatrix[0][j] -= objCoeff * stepMatrix[constraintRow][j];
      }
      
      // Create a tableau for this intermediate step
      const stepTableau: PhaseIITableau = {
        ...nonCanonicalTableau,
        matrix: stepMatrix,
        objectiveValue: stepMatrix[0][stepMatrix[0].length - 1]
      };
      
      steps.push(stepTableau);
      
      // Update current matrix for next iteration
      currentMatrix = stepMatrix.map(row => [...row]);
    }
  }
  
  return steps;
}

/**
 * Generate explanation for Phase II canonicalization step
 * @param stepIndex - Which basic variable is being eliminated (0-based)
 * @param tableau - The tableau before this step
 * @param basicVarName - Name of the basic variable being eliminated
 * @param objCoeff - The objective coefficient being eliminated
 * @returns Explanation string
 */
export function generatePhaseIICanonicalStepExplanation(
  stepIndex: number, 
  tableau: PhaseIITableau, 
  basicVarName: string,
  objCoeff: number
): string {
  let explanation = `### Canonicalização da Fase II - Passo ${stepIndex + 1}\n\n`;
  
  const basicVar = tableau.basicVariables[stepIndex];
  const constraintRow = stepIndex + 1;
  
  explanation += `**Eliminando ${basicVarName} da linha objetivo**\n\n`;
  
  explanation += `Coeficiente objetivo atual para ${basicVarName}: ${objCoeff}\n`;
  explanation += `${basicVarName} é básica na linha ${constraintRow}\n\n`;
  
  explanation += `Para tornar o coeficiente 0, realizamos:\n`;
  explanation += `**Linha 0 = Linha 0 - (${objCoeff}) × Linha ${constraintRow}**\n\n`;
  
  // Show the row operation details
  explanation += `**Detalhes da operação de linha:**\n`;
  const row0 = tableau.matrix[0];
  const rowN = tableau.matrix[constraintRow];
  
  explanation += `- Linha 0 Original: [${row0.map(v => v.toFixed(2)).join(', ')}]\n`;
  explanation += `- Linha ${constraintRow}: [${rowN.map(v => v.toFixed(2)).join(', ')}]\n`;
  explanation += `- ${objCoeff} × Linha ${constraintRow}: [${rowN.map(v => (objCoeff * v).toFixed(2)).join(', ')}]\n\n`;
  
  explanation += `Após esta operação, ${basicVarName} terá coeficiente 0 na linha objetivo, `;
  explanation += `mantendo a forma canônica necessária para o método simplex.`;
  
  return explanation;
}

/**
 * Generate explanation for Phase II transition
 */
export function generatePhaseTransitionExplanation(phaseOneTableau: PhaseITableau, phaseTwoTableau: PhaseIITableau, standardLP: LinearProgram): string {
  let explanation = "### Transição para a Fase II\n\n";
  
  explanation += "A Fase I encontrou com sucesso uma solução viável (w = 0). Agora substituímos o objetivo da Fase I pela função objetivo original.\n\n";
  
  explanation += "#### Passo 1: Substituir Função Objetivo\n\n";
  explanation += "A função objetivo em forma padrão é:\n";
  explanation += "Minimizar: ";
  for (let i = 0; i < standardLP.objective.length; i++) {
    if (i > 0 && standardLP.objective[i] >= 0) explanation += " + ";
    explanation += `${standardLP.objective[i]}${phaseTwoTableau.variableNames[i]}`;
  }
  if (standardLP.objectiveRHS) {
    explanation += ` + ${standardLP.objectiveRHS}`;
  }
  explanation += "\n\n";
  
  explanation += "#### Passo 2: Canonicalização\n\n";
  explanation += "**O que é canonicalização?** No método simplex, o tableau deve estar em forma canônica em relação à base atual. ";
  explanation += "Isso significa que cada variável básica deve ter um coeficiente de 0 na linha objetivo e formar uma matriz identidade nas linhas de restrição.\n\n";
  
  explanation += "Variáveis básicas atuais: " + phaseTwoTableau.basicVariables.map(idx => phaseTwoTableau.variableNames[idx]).join(', ') + "\n\n";
  
  // Show the canonicalization calculations
  const phaseIMatrix = phaseOneTableau.matrix;
  const initialObjective = new Array(phaseIMatrix[0].length).fill(0);
  
  // Set initial objective coefficients
  for (let i = 0; i < standardLP.objective.length && i < initialObjective.length - 1; i++) {
    initialObjective[i] = standardLP.objective[i];
  }
  initialObjective[initialObjective.length - 1] = standardLP.objectiveRHS || 0;
  
  explanation += "Linha objetivo inicial (antes da canonicalização):\n";
  explanation += `[${initialObjective.map(v => v.toFixed(2)).join(', ')}]\n\n`;
  
  explanation += "**Processo de canonicalização:**\n\n";
  
  // Show calculations for each basic variable
  for (let i = 0; i < phaseTwoTableau.basicVariables.length; i++) {
    const basicVarCol = phaseTwoTableau.basicVariables[i];
    const varName = phaseTwoTableau.variableNames[basicVarCol];
    const coeff = initialObjective[basicVarCol];
    
    if (Math.abs(coeff) > 1e-10) {
      explanation += `- Variável básica ${varName} (coluna ${basicVarCol}) tem coeficiente ${coeff}\n`;
      explanation += `  Para eliminar: Linha 0 = Linha 0 - (${coeff}) × Linha ${i + 1}\n`;
      explanation += `  Linha ${i + 1}: [${phaseIMatrix[i + 1].map(v => v.toFixed(2)).join(', ')}]\n\n`;
    }
  }
  
  explanation += "Linha objetivo final (após canonicalização):\n";
  explanation += `[${phaseTwoTableau.matrix[0].map(v => v.toFixed(2)).join(', ')}]\n\n`;
  
  explanation += "O tableau agora está pronto para as iterações da Fase II para otimizar a função objetivo original.\n";
  
  // Return marker for component to parse additional info
  const basicVarIndices = phaseTwoTableau.basicVariables.join(',');
  const basicVarNames = phaseTwoTableau.basicVariables.map(idx => phaseTwoTableau.variableNames[idx]).join(',');
  return `PHASE_II_TRANSITION_DETAILED:${explanation}:${basicVarIndices}:${basicVarNames}`;
}

/**
 * Generate explanation for non-canonical Phase II tableau
 */
export function generatePhaseIINonCanonicalExplanation(phaseOneTableau: PhaseITableau, phaseTwoTableau: PhaseIITableau, standardLP: LinearProgram): string {
  let explanation = "### Transição para Fase II - Forma Não-Canônica\n\n";
  
  explanation += "A Fase I encontrou com sucesso uma solução viável com w = 0. Agora nós:\n";
  explanation += "1. **Removemos as colunas das variáveis artificiais** - elas não são mais necessárias\n";
  explanation += "2. **Substituímos o objetivo da Fase I** pela função objetivo original\n";
  
  // Show which columns were dropped
  const droppedVars = phaseOneTableau.artificialVariableNames;
  if (droppedVars.length > 0) {
    explanation += `**Colunas removidas:** ${droppedVars.join(', ')}\n\n`;
  }
  
  explanation += "### Função Objetivo Original (Forma Padrão)\n\n";
  explanation += "A função objetivo em forma padrão é:\n";
  explanation += "**Minimizar:** ";
  
  // Show the objective function
  const terms = [];
  for (let i = 0; i < standardLP.objective.length; i++) {
    const coeff = standardLP.objective[i];
    const varName = phaseTwoTableau.variableNames[i];
    if (Math.abs(coeff) > 1e-10) {
      if (coeff > 0 && terms.length > 0) {
        terms.push(`+ ${coeff}${varName}`);
      } else {
        terms.push(`${coeff}${varName}`);
      }
    }
  }
  explanation += terms.join(' ') || '0';
  
  if (standardLP.objectiveRHS) {
    explanation += ` + ${standardLP.objectiveRHS}`;
  }
  explanation += "\n\n";
  
  explanation += "### Tableau Não-Canônico\n\n";
  explanation += "Substituímos a linha objetivo da Fase I pelos coeficientes objetivos originais:\n\n";
  
  // Show the new objective row
  explanation += "**Nova linha objetivo:** [";
  explanation += phaseTwoTableau.matrix[0].map(v => v.toFixed(2)).join(', ');
  explanation += "]\n\n";
  
  explanation += "⚠️ **Nota:** Este tableau ainda NÃO está em forma canônica porque as variáveis básicas ";
  explanation += "têm coeficientes não-zero na linha objetivo. Precisamos realizar operações de linha para ";
  explanation += "tornar os coeficientes das variáveis básicas iguais a zero.\n\n";
  
  // Show which basic variables have non-zero coefficients
  const basicVarsWithNonZero = [];
  for (let i = 0; i < phaseTwoTableau.basicVariables.length; i++) {
    const varIdx = phaseTwoTableau.basicVariables[i];
    const coeff = phaseTwoTableau.matrix[0][varIdx];
    if (Math.abs(coeff) > 1e-10) {
      basicVarsWithNonZero.push({
        name: phaseTwoTableau.variableNames[varIdx],
        coeff: coeff,
        row: i + 1
      });
    }
  }
  
  if (basicVarsWithNonZero.length > 0) {
    explanation += "Variáveis básicas com coeficientes não-zero:\n";
    for (const basicVar of basicVarsWithNonZero) {
      explanation += `- ${basicVar.name}: coeficiente = ${basicVar.coeff} (na linha ${basicVar.row})\n`;
    }
  }
  
  return explanation;
}

/**
 * Generate explanation for canonical Phase II tableau
 */
export function generatePhaseIICanonicalExplanation(nonCanonicalTableau: PhaseIITableau, canonicalTableau: PhaseIITableau, standardLP: LinearProgram): string {
  let explanation = "### Canonicalizando o Tableau da Fase II\n\n";
  
  explanation += "Para continuar com a Fase II, devemos canonicalizar o tableau tornando os coeficientes ";
  explanation += "das variáveis básicas iguais a zero na linha objetivo.\n\n";
  
  explanation += "#### Operações de Canonicalização\n\n";
  
  // Find which operations need to be performed
  const operations = [];
  for (let i = 0; i < nonCanonicalTableau.basicVariables.length; i++) {
    const varIdx = nonCanonicalTableau.basicVariables[i];
    const coeff = nonCanonicalTableau.matrix[0][varIdx];
    if (Math.abs(coeff) > 1e-10) {
      const varName = nonCanonicalTableau.variableNames[varIdx];
      const rowNum = i + 1;
      operations.push({
        varName,
        coeff,
        rowNum,
        operation: `L₀ ← L₀ - (${coeff}) × L${rowNum}`
      });
    }
  }
  
  if (operations.length > 0) {
    explanation += "Realizamos as seguintes operações de linha:\n\n";
    for (const op of operations) {
      explanation += `**${op.operation}**\n`;
      explanation += `Isso elimina o coeficiente ${op.coeff} da variável básica ${op.varName}\n\n`;
      
      // Show the calculation details
      explanation += "Valores da linha " + op.rowNum + ": [";
      explanation += nonCanonicalTableau.matrix[op.rowNum].map(v => v.toFixed(2)).join(', ');
      explanation += "]\n";
      
      explanation += "Multiplicar por " + op.coeff + ": [";
      explanation += nonCanonicalTableau.matrix[op.rowNum].map(v => (v * op.coeff).toFixed(2)).join(', ');
      explanation += "]\n\n";
    }
  }
  
  explanation += "#### Tableau Canônico\n\n";
  explanation += "Após realizar essas operações, obtemos o tableau canônico:\n\n";
  
  explanation += "**Linha objetivo final:** [";
  explanation += canonicalTableau.matrix[0].map(v => v.toFixed(2)).join(', ');
  explanation += "]\n\n";
  
  explanation += "✅ O tableau agora está em forma canônica em relação à base atual. ";
  explanation += "Todas as variáveis básicas têm coeficiente 0 na linha objetivo.\n\n";
  
  explanation += "Agora podemos continuar com as iterações da Fase II para otimizar a função objetivo original.";
  
  return explanation;
}

/**
 * Generate explanation for standard form
 */
export function generateStandardFormExplanation(lp: LinearProgram): string {
  let explanation = "### Conversão para Forma Padrão\n\n";
  explanation += "O programa linear foi convertido para forma padrão:\n\n";
  explanation += "- Todas as restrições agora são igualdades (usando variáveis de folga/excesso)\n";
  explanation += "- Todas as variáveis são não-negativas\n";
  explanation += "- O objetivo está em forma de minimização\n\n";
  
  // Count slack variables
  let slackCount = 0;
  for (const variable of lp.variables) {
    if (variable.startsWith('s')) {
      slackCount++;
    }
  }
  
  if (slackCount > 0) {
    explanation += `Adicionada${slackCount > 1 ? 's' : ''} ${slackCount} variáve${slackCount > 1 ? 'is' : 'l'} de folga/excesso para converter desigualdades em igualdades.\n\n`;
  }
  
  const needsPhaseOne = lp.constraints.some(c => c.operator === '=' || c.operator === '>=');
  if (needsPhaseOne) {
    explanation += "No entanto, não podemos formar uma base inicial apenas com as variáveis de folga, ";
    explanation += "então precisamos usar o método de Duas Fases.";
  } else {
    explanation += "As variáveis de folga formam uma matriz identidade, fornecendo uma solução básica viável inicial.";
  }
  
  return explanation;
}
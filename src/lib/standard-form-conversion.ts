import type { LinearProgram } from '../components/types';

/**
 * Utility to convert a linear program to standard form with detailed explanation
 * @param lp - Linear program in any form
 * @returns The original LP, converted LP, and detailed explanation
 */
export function convertToStandardFormWithExplanation(lp: LinearProgram): {
  originalLP: LinearProgram;
  standardLP: LinearProgram;
  explanation: string;
} {
  // Create a deep copy of the input to avoid mutations
  const originalLP: LinearProgram = {
    objective: [...lp.objective],
    constraints: lp.constraints.map(c => ({...c, coefficients: [...c.coefficients]})),
    isMaximization: lp.isMaximization,
    variables: [...lp.variables],
    variableRestrictions: lp.variableRestrictions ? [...lp.variableRestrictions] : Array(lp.variables.length).fill(true)
  };
  
  // Standard form LP starts with a copy but will be modified
  const standardLP: LinearProgram = {
    objective: [...lp.objective],
    objectiveRHS: lp.objectiveRHS || 0, // Include objective RHS if provided, default to 0
    constraints: [],
    isMaximization: lp.isMaximization,
    variables: [...lp.variables],
    // Copy the original variableRestrictions if they exist, otherwise initialize all as non-negative
    variableRestrictions: lp.variableRestrictions ? [...lp.variableRestrictions] : Array(lp.variables.length).fill(true)
  };

  // Explanation will be built step by step
  let explanation = '## Convertendo para Forma Padrão\n\n';
  
  // Step 1: Convert maximization to minimization if needed (following example strategy)
  if (standardLP.isMaximization) {
    explanation += '### Passo 1: Converter Maximização para Minimização\n\n';
    explanation += 'Como este é um problema de maximização, convertemos para minimização multiplicando a função objetivo por -1:\n\n';
    explanation += `**Objetivo original (maximizar):** ${formatObjective(originalLP)}${originalLP.objectiveRHS ? ` + ${originalLP.objectiveRHS}` : ''}\n\n`;
    
    standardLP.objective = standardLP.objective.map(coeff => -coeff);
    if (standardLP.objectiveRHS !== undefined) {
      standardLP.objectiveRHS = -standardLP.objectiveRHS; // Also negate the RHS if it exists
    }
    standardLP.isMaximization = false;
    
    explanation += `**Objetivo convertido (minimizar):** ${formatObjective(standardLP)}${standardLP.objectiveRHS ? ` + ${standardLP.objectiveRHS}` : ''}\n\n`;
  } else {
    explanation += '### Passo 1: Verificar Tipo da Função Objetivo\n\n';
    explanation += 'Este já é um problema de minimização, então nenhuma conversão é necessária para a função objetivo.\n\n';
  }
  
  // Step 2: Handle unrestricted variables by substitution
  const unrestrictedVars = [];
  
  // Make sure variableRestrictions is defined, default to all non-negative if not provided
  if (!originalLP.variableRestrictions) {
    originalLP.variableRestrictions = Array(originalLP.variables.length).fill(true);
  }
  
  for (let i = 0; i < originalLP.variables.length; i++) {
    if (!originalLP.variableRestrictions[i]) {
      unrestrictedVars.push(i);
    }
  }
  
  if (unrestrictedVars.length > 0) {
    explanation += '### Passo 2: Tratar Variáveis Irrestritas\n\n';
    explanation += 'Para cada variável irrestrita, substituímos pela diferença de duas variáveis não-negativas:\n\n';
    
    // Process unrestricted variables
    for (const varIndex of unrestrictedVars) {
      const varName = originalLP.variables[varIndex];
      explanation += `Para a variável irrestrita ${varName}, substituímos: ${varName} = ${varName}⁺ - ${varName}⁻ onde ${varName}⁺ ≥ 0 e ${varName}⁻ ≥ 0\n\n`;
      
      // Add the substitution variables to the standard form LP
      const posVarName = `${varName}⁺`;
      const negVarName = `${varName}⁻`;
      
      // Replace the original variable with positive part in the array
      standardLP.variables[varIndex] = posVarName;
      
      // Make sure variableRestrictions is defined and set this positive part to non-negative
      if (!standardLP.variableRestrictions) {
        standardLP.variableRestrictions = Array(standardLP.variables.length).fill(true);
      }
      standardLP.variableRestrictions[varIndex] = true; // Positive part is non-negative
      
      // Add negative part as a new variable
      standardLP.variables.push(negVarName);
      
      // Add the restriction for the negative part (non-negative)
      standardLP.variableRestrictions.push(true);
      
      // Update objective function
      const coeff = standardLP.objective[varIndex];
      standardLP.objective[varIndex] = coeff; // Coefficient for positive part
      
      // Add zeros for slack variables that might be in between
      for (let i = standardLP.objective.length; i < standardLP.variables.length - 1; i++) {
        standardLP.objective.push(0);
      }
      
      standardLP.objective.push(-coeff); // Add coefficient for negative part (note the negation)
      
      // Update all constraints
      for (let i = 0; i < originalLP.constraints.length; i++) {
        const constraint = originalLP.constraints[i];
        const newConstraint = standardLP.constraints[i] || { 
          coefficients: [...constraint.coefficients], 
          rhs: constraint.rhs, 
          operator: constraint.operator 
        };
        
        const coeff = constraint.coefficients[varIndex];
        newConstraint.coefficients[varIndex] = coeff; // Coefficient for positive part
        newConstraint.coefficients.push(-coeff); // Add coefficient for negative part (note the negation)
        
        // Store the updated constraint
        if (!standardLP.constraints[i]) {
          standardLP.constraints.push(newConstraint);
        } else {
          standardLP.constraints[i] = newConstraint;
        }
      }
      
      explanation += `Após substituição na função objetivo: ${formatSubstitution(originalLP, standardLP, varIndex)}\n\n`;
      explanation += `A variável ${varName} é substituída por ${posVarName} - ${negVarName} em todas as restrições.\n\n`;
    }
  } else {
    explanation += '### Passo 2: Verificar Variáveis Irrestritas\n\n';
    explanation += 'Todas as variáveis já são não-negativas, então nenhuma substituição é necessária.\n\n';
  }
  
  // Step 3: Process constraints
  explanation += '### Passo 3: Converter Restrições para Forma Padrão\n\n';
  explanation += 'Para cada restrição, precisamos:\n';
  explanation += '- Converter desigualdades em equações adicionando variáveis de folga/excesso\n';
  explanation += '- Garantir que todas as restrições tenham a forma: ax₁ + bx₂ + ... + folga = LD\n\n';
  
  // Process each constraint
  // Track the number of slack/surplus variables to ensure unique naming
  let slackVarCount = 0;
  // Store indices of slack variables to avoid duplication
  const slackVarIndices = [];
  
  // Make sure variableRestrictions is defined before we extend it with slack variables
  if (!standardLP.variableRestrictions) {
    standardLP.variableRestrictions = Array(standardLP.variables.length).fill(true);
  }
  
  // Only create new constraints if they haven't already been created by the unrestricted variables step
  if (standardLP.constraints.length === 0) {
    standardLP.constraints = originalLP.constraints.map(constraint => {
      // Initialize coefficients array with the original coefficients
      const coeffs = [...constraint.coefficients];
      
      // Ensure all constraints have the same number of coefficients by filling with zeros
      // This may be needed if unrestricted variables were added
      while (coeffs.length < standardLP.variables.length) {
        coeffs.push(0);
      }
      
      return {
        coefficients: coeffs,
        rhs: constraint.rhs,
        operator: constraint.operator
      };
    });
  }
  
  // Now process each constraint to add slack/surplus variables
  for (let index = 0; index < standardLP.constraints.length; index++) {
    const constraint = standardLP.constraints[index];
    
    explanation += `#### Restrição ${index + 1}: ${formatConstraint(constraint, standardLP.variables)}\n\n`;
    
    // Add slack/surplus variables based on constraint type
    if (constraint.operator === '<=') {
      // Add a slack variable (s_i ≥ 0)
      slackVarCount++;
      const slackVar = `s${slackVarCount}`;
      standardLP.variables.push(slackVar);
      // Add the slack variable's restriction (non-negative)
      standardLP.variableRestrictions.push(true); 
      slackVarIndices.push(standardLP.variables.length - 1); // Store index of this slack variable
      
      // First ensure all constraints have the same number of coefficients (up to the current variable count - 1)
      for (let i = 0; i < standardLP.constraints.length; i++) {
        while (standardLP.constraints[i].coefficients.length < standardLP.variables.length - 1) {
          standardLP.constraints[i].coefficients.push(0);
        }
      }
      
      // Now add the slack variable coefficient only once
      for (let i = 0; i < standardLP.constraints.length; i++) {
        // Add either 1 for the current constraint or 0 for others
        if (i === index) {
          // Add 1 for the slack in this constraint
          standardLP.constraints[i].coefficients.push(1);
        } else {
          // For other constraints, add 0 for this slack variable
          standardLP.constraints[i].coefficients.push(0);
        }
      }
      
      explanation += `This is a ≤ constraint. We add a slack variable ${slackVar} ≥ 0 to convert it to an equality:\n\n`;
      explanation += `${formatConstraintWithVariable(constraint, standardLP.variables, slackVar, '+')}\n\n`;
      
      // For <= constraints, ensure RHS is non-negative
      if (standardLP.constraints[index].rhs < 0) {
        explanation += `Como o lado direito é negativo (${standardLP.constraints[index].rhs}), multiplicamos toda a restrição por -1:\n\n`;
        
        standardLP.constraints[index].coefficients = standardLP.constraints[index].coefficients.map(coeff => -coeff);
        standardLP.constraints[index].rhs = -standardLP.constraints[index].rhs;
        
        explanation += `After multiplying by -1, the constraint has a positive right-hand side:\n\n`;
        explanation += `${formatConstraint({ 
          coefficients: standardLP.constraints[index].coefficients, 
          rhs: standardLP.constraints[index].rhs, 
          operator: '=' 
        }, standardLP.variables)}\n\n`;
      }
      
      // Set the operator to equality
      standardLP.constraints[index].operator = '=';
      
    } else if (constraint.operator === '>=') {
      // For >= constraints, we add a surplus variable with coefficient -1
      slackVarCount++;
      const surplusVar = `s${slackVarCount}`;
      standardLP.variables.push(surplusVar);
      // Add the surplus variable's restriction (non-negative)
      standardLP.variableRestrictions.push(true);
      slackVarIndices.push(standardLP.variables.length - 1); // Store index of this surplus variable
      
      explanation += `This is a ≥ constraint. We add a surplus variable ${surplusVar} ≥ 0 with coefficient -1 to convert it to an equality:\n\n`;
      explanation += `${formatConstraintWithVariable(constraint, standardLP.variables, surplusVar, '-')}\n\n`;
      
      // Only mention multiplication by -1 if needed
      if (constraint.rhs < 0) {
        explanation += `If the right-hand side is negative, we'll multiply the entire constraint by -1 to maintain non-negative values on the right side of the equation.\n\n`;
      }
      
      // First ensure all constraints have the same number of coefficients (up to the current variable count - 1)
      for (let i = 0; i < standardLP.constraints.length; i++) {
        while (standardLP.constraints[i].coefficients.length < standardLP.variables.length - 1) {
          standardLP.constraints[i].coefficients.push(0);
        }
      }
      
      // Now add the surplus variable coefficient only once
      for (let i = 0; i < standardLP.constraints.length; i++) {
        // Add either -1 for the current constraint or 0 for others
        if (i === index) {
          // Add -1 for the surplus in this constraint
          standardLP.constraints[i].coefficients.push(-1);
        } else {
          // For other constraints, add 0 for this surplus variable
          standardLP.constraints[i].coefficients.push(0);
        }
      }
      
      // Multiply by -1 only if the RHS is negative
      // This ensures we maintain positive RHS values in standard form
      if (standardLP.constraints[index].rhs < 0) {
        explanation += `Como o lado direito é negativo (${standardLP.constraints[index].rhs}), multiplicamos toda a restrição por -1:\n\n`;
        
        standardLP.constraints[index].coefficients = standardLP.constraints[index].coefficients.map(coeff => -coeff);
        standardLP.constraints[index].rhs = -standardLP.constraints[index].rhs;
        
        explanation += `After multiplying by -1, the constraint has a positive right-hand side:\n\n`;
      } else {
        explanation += `The constraint already has a non-negative right-hand side, so it's in standard form with the surplus variable:\n\n`;
      }
      
      explanation += `${formatConstraint({ 
        coefficients: standardLP.constraints[index].coefficients, 
        rhs: standardLP.constraints[index].rhs, 
        operator: '=' 
      }, standardLP.variables)}\n\n`;
      
      // Set the operator to equality
      standardLP.constraints[index].operator = '=';
      
    } else {
      // Equality constraint
      explanation += 'Esta já é uma restrição de igualdade, então nenhuma variável de folga ou excesso é necessária.\n\n';
      
      // For equality constraints, ensure RHS is non-negative
      if (standardLP.constraints[index].rhs < 0) {
        explanation += `Como o lado direito é negativo (${standardLP.constraints[index].rhs}), multiplicamos toda a restrição por -1:\n\n`;
        
        standardLP.constraints[index].coefficients = standardLP.constraints[index].coefficients.map(coeff => -coeff);
        standardLP.constraints[index].rhs = -standardLP.constraints[index].rhs;
        
        explanation += `Após multiplicar por -1:\n`;
        explanation += `${formatConstraint({ 
          coefficients: standardLP.constraints[index].coefficients, 
          rhs: standardLP.constraints[index].rhs, 
          operator: '=' 
        }, standardLP.variables)}\n\n`;
      }
    }
  }

  // Make sure all constraints have the correct number of variables
  const totalVars = standardLP.variables.length;
  for (let i = 0; i < standardLP.constraints.length; i++) {
    while (standardLP.constraints[i].coefficients.length < totalVars) {
      standardLP.constraints[i].coefficients.push(0);
    }
  }
  
  // Make sure objective function has coefficients for all variables
  while (standardLP.objective.length < totalVars) {
    standardLP.objective.push(0);
  }
  
  // Fix any -0 values to be regular 0
  standardLP.objective = standardLP.objective.map(coeff => Object.is(coeff, -0) || coeff === 0 ? 0 : coeff);
  
  // Also fix -0 in constraint coefficients
  for (let i = 0; i < standardLP.constraints.length; i++) {
    standardLP.constraints[i].coefficients = standardLP.constraints[i].coefficients.map(
      coeff => Object.is(coeff, -0) || coeff === 0 ? 0 : coeff
    );
  }
  
  // Final step summary
  explanation += '### Summary of Standard Form Conversion\n\n';
  explanation += '**Original Problem:**\n\n';
  explanation += `${originalLP.isMaximization ? 'Maximize' : 'Minimize'} ${formatObjective(originalLP)}${originalLP.objectiveRHS ? ` + ${originalLP.objectiveRHS}` : ''}\n\n`;
  explanation += 'Subject to:\n';
  originalLP.constraints.forEach((constraint) => {
    explanation += `${formatConstraint(constraint, originalLP.variables)}\n`;
  });
  
  // Format variable restrictions for original LP
  const nonNegativeOrigVars = originalLP.variables.filter((_, i) => 
    !originalLP.variableRestrictions || originalLP.variableRestrictions[i]
  );
  const unrestrictedOrigVars = originalLP.variables.filter((_, i) => 
    originalLP.variableRestrictions && !originalLP.variableRestrictions[i]
  );
  
  if (nonNegativeOrigVars.length > 0) {
    explanation += `${nonNegativeOrigVars.join(', ')} ≥ 0\n`;
  }
  if (unrestrictedOrigVars.length > 0) {
    explanation += `${unrestrictedOrigVars.join(', ')} unrestricted\n`;
  }
  explanation += '\n';
  
  explanation += '**Standard Form:**\n\n';
  explanation += `Minimize ${formatObjective(standardLP)}${standardLP.objectiveRHS ? ` + ${standardLP.objectiveRHS}` : ''}\n\n`;
  explanation += 'Subject to:\n';
  standardLP.constraints.forEach((constraint) => {
    explanation += `${formatConstraint(constraint, standardLP.variables)}\n`;
  });
  explanation += `All variables (including slack/surplus variables) ≥ 0\n\n`;
  
  return { originalLP, standardLP, explanation };
}

/**
 * Format substitution of unrestricted variable in objective function
 */
function formatSubstitution(
  originalLP: LinearProgram, 
  standardLP: LinearProgram,
  varIndex: number
): string {
  const originalCoeff = originalLP.objective[varIndex];
  const varName = originalLP.variables[varIndex];
  const posVarName = `${varName}⁺`;
  const negVarName = `${varName}⁻`;
  
  return `${Math.abs(originalCoeff)}${varName} → ${Math.abs(originalCoeff)}(${posVarName} - ${negVarName})`;
}

/**
 * Format an objective function for display
 */
function formatObjective(lp: LinearProgram): string {
  return lp.objective
    .map((coeff, index) => {
      if (coeff === 0) return '';
      const sign = index > 0 && coeff > 0 ? '+ ' : coeff < 0 ? '- ' : '';
      const absCoeff = Math.abs(coeff);
      const coeffStr = absCoeff === 1 ? '' : `${absCoeff}`;
      return `${sign}${coeffStr}${lp.variables[index]} `;
    })
    .filter(Boolean)
    .join('');
}

/**
 * Format a constraint for display
 */
function formatConstraint(
  constraint: { coefficients: number[], rhs: number, operator: string }, 
  variables: string[],
  slackVar?: string,
  slackSign?: string
): string {
  let result = constraint.coefficients
    .map((coeff, index) => {
      if (coeff === 0) return '';
      const sign = index > 0 && coeff > 0 ? '+ ' : coeff < 0 ? '- ' : '';
      const absCoeff = Math.abs(coeff);
      const coeffStr = absCoeff === 1 ? '' : `${absCoeff}`;
      return `${sign}${coeffStr}${variables[index]} `;
    })
    .filter(Boolean)
    .join('');
  
  if (slackVar && slackSign) {
    result += `${slackSign} ${slackVar} `;
  }
  
  result += `${constraint.operator} ${constraint.rhs}`;
  return result;
}

/**
 * Format a constraint with an added slack/surplus variable
 */
function formatConstraintWithVariable(
  constraint: { coefficients: number[], rhs: number, operator: string },
  variables: string[],
  slackVar: string,
  sign: string
): string {
  let result = constraint.coefficients
    .map((coeff, index) => {
      if (coeff === 0) return '';
      const sign = index > 0 && coeff > 0 ? '+ ' : coeff < 0 ? '- ' : '';
      const absCoeff = Math.abs(coeff);
      const coeffStr = absCoeff === 1 ? '' : `${absCoeff}`;
      return `${sign}${coeffStr}${variables[index]} `;
    })
    .filter(Boolean)
    .join('');
  
  result += `${sign} ${slackVar} = ${constraint.rhs}`;
  return result;
}
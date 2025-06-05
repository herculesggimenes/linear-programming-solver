import React from 'react';
import type { LinearProgram } from '@/components/types';

interface StandardFormExplanationDetailedProps {
  originalLP: LinearProgram;
  standardLP: LinearProgram;
}

/**
 * A more detailed and visually appealing standard form explanation component
 * that shows the conversion process step by step with proper formatting
 */
const StandardFormExplanationDetailed: React.FC<StandardFormExplanationDetailedProps> = ({ 
  originalLP, 
  standardLP 
}) => {
  // Helper function to format objective function
  const formatObjective = (lp: LinearProgram): JSX.Element => {
    return (
      <div className="flex flex-wrap items-center text-lg font-mono">
        {lp.objective.map((coeff, index) => {
          if (coeff === 0) return null;
          
          const sign = index > 0 && coeff > 0 ? '+' : '';
          const varName = lp.variables[index];
          
          return (
            <span key={index} className="mx-1">
              {sign}{coeff !== 1 && coeff !== -1 ? coeff : coeff === -1 ? '-' : ''}{varName}
            </span>
          );
        })}
      </div>
    );
  };
  
  // Helper function to format constraints
  const formatConstraints = (lp: LinearProgram): JSX.Element[] => {
    return lp.constraints.map((constraint, idx) => (
      <div key={idx} className="flex flex-wrap items-center text-lg font-mono my-2">
        {constraint.coefficients.map((coeff, index) => {
          if (coeff === 0) return null;
          
          // If we're out of bounds in the variables array, handle it
          if (index >= lp.variables.length) {
            console.warn(`Variable index ${index} is out of bounds for variables array of length ${lp.variables.length}`);
            return null;
          }
          
          const sign = index > 0 && coeff > 0 ? '+' : '';
          const varName = lp.variables[index];
          
          return (
            <span key={index} className="mx-1">
              {sign}{coeff !== 1 && coeff !== -1 ? coeff : coeff === -1 ? '-' : ''}{varName}
            </span>
          );
        })}
        <span className="mx-2">{constraint.operator}</span>
        <span>{constraint.rhs}</span>
      </div>
    ));
  };
  
  // Helper function to format variable restrictions
  const formatVariableRestrictions = (lp: LinearProgram): JSX.Element => {
    const nonNegativeVars: string[] = [];
    const unrestrictedVars: string[] = [];
    
    // Only consider the original variables, not slack/surplus variables
    const originalVarCount = originalLP.variables.length;
    
    lp.variables.slice(0, originalVarCount).forEach((varName, idx) => {
      if (!lp.variableRestrictions || lp.variableRestrictions[idx]) {
        nonNegativeVars.push(varName);
      } else {
        unrestrictedVars.push(varName);
      }
    });
    
    return (
      <div className="text-lg font-mono">
        {nonNegativeVars.length > 0 && (
          <div className="my-1">{nonNegativeVars.join(', ')} ≥ 0</div>
        )}
        {unrestrictedVars.length > 0 && (
          <div className="my-1">{unrestrictedVars.join(', ')} livres</div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-blue-700 mb-3">Problema Original</h3>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="mb-3">
            <span className="font-semibold mr-2">
              {originalLP.isMaximization ? 'Maximizar:' : 'Minimizar:'}
            </span>
            {formatObjective(originalLP)}
          </div>
          
          <div className="mb-3">
            <div className="font-semibold mb-2">Sujeito a:</div>
            <div className="pl-4">
              {formatConstraints(originalLP)}
            </div>
          </div>
          
          <div>
            <div className="font-semibold mb-1">Restrições das variáveis:</div>
            <div className="pl-4">
              {formatVariableRestrictions(originalLP)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-blue-700 mb-3">Processo de Conversão</h3>
        
        {/* Step 1: Objective Function Conversion */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold mb-2 text-gray-800">Passo 1: Função Objetivo</h4>
          
          {originalLP.isMaximization !== standardLP.isMaximization ? (
            <div className="space-y-2">
              <p className="text-gray-700">
                Convertendo {originalLP.isMaximization ? 'maximização' : 'minimização'} para {standardLP.isMaximization ? 'maximização' : 'minimização'} 
                multiplicando a função objetivo por -1:
              </p>
              <div className="flex items-center space-x-4">
                <div>
                  {originalLP.isMaximization ? 'Max' : 'Min'}{' '}
                  {formatObjective(originalLP)}
                </div>
                <div className="text-gray-500">→</div>
                <div>
                  {standardLP.isMaximization ? 'Max' : 'Min'}{' '}
                  {formatObjective(standardLP)}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-700">
              A função objetivo já está na forma correta (nenhuma conversão necessária).
            </p>
          )}
        </div>
        
        {/* Step 2: Handle Unrestricted Variables */}
        {originalLP.variableRestrictions && originalLP.variableRestrictions.some(r => !r) ? (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h4 className="font-semibold mb-2 text-gray-800">Passo 2: Variáveis Livres</h4>
            <p className="text-gray-700 mb-2">
              Variáveis livres são substituídas pela diferença de duas variáveis não-negativas:
            </p>
            
            <div className="space-y-2 pl-4">
              {originalLP.variableRestrictions.map((isRestricted, idx) => {
                if (!isRestricted) {
                  const varName = originalLP.variables[idx];
                  return (
                    <div key={idx} className="font-mono">
                      {varName} = {varName}⁺ - {varName}⁻ onde {varName}⁺ ≥ 0, {varName}⁻ ≥ 0
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <h4 className="font-semibold mb-2 text-gray-800">Passo 2: Variáveis Livres</h4>
            <p className="text-gray-700">
              Todas as variáveis já são não-negativas. Nenhuma substituição é necessária.
            </p>
          </div>
        )}
        
        {/* Step 3: Convert Constraints */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold mb-2 text-gray-800">Passo 3: Converter Restrições</h4>
          
          <div className="space-y-3">
            {originalLP.constraints.map((constraint, idx) => {
              const operator = constraint.operator;
              const slackVar = `s${idx + 1}`;
              
              return (
                <div key={idx} className="space-y-2">
                  <div className="font-mono">
                    {/* Original constraint */}
                    {constraint.coefficients.map((coeff, i) => {
                      if (coeff === 0) return null;
                      const sign = i > 0 && coeff > 0 ? '+' : '';
                      const varName = originalLP.variables[i];
                      return (
                        <span key={i} className="mx-1">
                          {sign}{coeff !== 1 && coeff !== -1 ? coeff : coeff === -1 ? '-' : ''}{varName}
                        </span>
                      );
                    })}{' '}
                    {operator}{' '}
                    {constraint.rhs}
                  </div>
                  
                  <div className="pl-4 flex items-center">
                    <span className="text-gray-500 mr-2">→</span>
                    
                    {/* Converted constraint explanation */}
                    <div>
                      {operator === '<=' ? (
                        <span>Adicionar variável de folga {slackVar} ≥ 0</span>
                      ) : operator === '>=' ? (
                        <span>Adicionar variável de excesso {slackVar} ≥ 0 com coeficiente -1</span>
                      ) : (
                        <span>Já é uma restrição de igualdade</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-blue-700 mb-3">Resultado em Forma Padrão</h3>
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <div className="mb-3">
            <span className="font-semibold mr-2">
              {standardLP.isMaximization ? 'Maximizar:' : 'Minimizar:'}
            </span>
            {formatObjective(standardLP)}
          </div>
          
          <div className="mb-3">
            <div className="font-semibold mb-2">Sujeito a:</div>
            <div className="pl-4 space-y-1">
              {formatConstraints(standardLP)}
            </div>
          </div>
          
          <div>
            <div className="font-semibold mb-1">Todas as variáveis:</div>
            <div className="pl-4">
              {/* Only show original variables and any substitution variables (like x₁⁺, x₁⁻), not slack/surplus variables */}
              {standardLP.variables
                .filter(v => !v.startsWith('s'))
                .join(', ')} ≥ 0
              {/* Add a separate section for slack variables */}
              {standardLP.variables.some(v => v.startsWith('s')) && (
                <div className="mt-1">Todas as variáveis de folga/excesso ≥ 0</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardFormExplanationDetailed;
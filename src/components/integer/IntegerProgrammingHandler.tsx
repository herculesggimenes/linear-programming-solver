import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { LinearProgram, SimplexStep } from '@/components/types';
import type { IntegerProgram } from '@/lib/integer-programming';
import IntegerProgrammingVisualizer from './IntegerProgrammingVisualizer';

interface IntegerProgrammingHandlerProps {
  problem: LinearProgram;
  relaxationSolution: SimplexStep;
}

const IntegerProgrammingHandler: React.FC<IntegerProgrammingHandlerProps> = ({ 
  problem, 
  relaxationSolution 
}) => {
  const [showBranchAndBound, setShowBranchAndBound] = useState(false);
  
  // Extract solution values from tableau
  const solutionValues = new Array(problem.objective.length).fill(0);
  const tableau = relaxationSolution.tableau;
  
  for (let i = 0; i < tableau.basicVariables.length; i++) {
    const varIndex = tableau.basicVariables[i];
    if (varIndex < problem.objective.length) {
      solutionValues[varIndex] = tableau.matrix[i + 1][tableau.matrix[0].length - 1];
    }
  }
  
  // Check which integer variables have fractional values
  const fractionalVars = problem.integerConstraints!
    .map(varIndex => ({
      index: varIndex,
      name: problem.variables[varIndex],
      value: solutionValues[varIndex],
      isFractional: Math.abs(solutionValues[varIndex] - Math.round(solutionValues[varIndex])) > 1e-6
    }))
    .filter(v => v.isFractional);
  
  const allInteger = fractionalVars.length === 0;
  
  // Convert to IntegerProgram format
  const integerProgram: IntegerProgram = {
    ...problem,
    integerConstraints: problem.integerConstraints!.map(index => ({
      variableIndex: index,
      variableName: problem.variables[index],
      mustBeInteger: true
    }))
  };
  
  if (showBranchAndBound) {
    return (
      <div className="space-y-4">
        <Button 
          onClick={() => setShowBranchAndBound(false)}
          variant="outline"
          size="sm"
        >
          ← Voltar para Solução Relaxada
        </Button>
        <IntegerProgrammingVisualizer problem={integerProgram} />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Alert className={allInteger ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
        <AlertDescription className={allInteger ? "text-green-800" : "text-amber-800"}>
          {allInteger ? (
            <strong>A solução ótima já satisfaz todas as restrições de integralidade!</strong>
          ) : (
            <>
              <strong>Solução relaxada encontrada!</strong> Algumas variáveis inteiras têm valores fracionários.
              Use Branch and Bound para encontrar a solução inteira ótima.
            </>
          )}
        </AlertDescription>
      </Alert>
      
      <div className="space-y-3">
        <h4 className="font-semibold text-sm">Variáveis com Restrição de Integralidade:</h4>
        <div className="space-y-2">
          {problem.integerConstraints!.map(varIndex => {
            const value = solutionValues[varIndex];
            const isFractional = Math.abs(value - Math.round(value)) > 1e-6;
            
            return (
              <div key={varIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="font-mono text-sm">
                  {problem.variables[varIndex]} = {value.toFixed(4)}
                </span>
                <Badge variant={isFractional ? "secondary" : "default"} className={
                  isFractional ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
                }>
                  {isFractional ? "Fracionário" : "Inteiro"}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="pt-2">
        <p className="text-sm text-gray-600 mb-3">
          Valor da função objetivo (relaxação): <strong>{tableau.objectiveValue.toFixed(4)}</strong>
        </p>
        
        {!allInteger && (
          <Button 
            onClick={() => setShowBranchAndBound(true)}
            className="w-full"
          >
            Executar Branch and Bound
          </Button>
        )}
      </div>
    </div>
  );
};

export default IntegerProgrammingHandler;
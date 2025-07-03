import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { LinearProgram } from '@/components/types';
import type { IntegerProgram } from '@/lib/integer-programming';

interface IntegerProblemFormProps {
  baseProblem: LinearProgram;
  onSubmit: (problem: IntegerProgram) => void;
}

const IntegerProblemForm: React.FC<IntegerProblemFormProps> = ({ baseProblem, onSubmit }) => {
  const [integerVars, setIntegerVars] = useState<boolean[]>(
    new Array(baseProblem.variables.length).fill(false)
  );
  
  const handleToggleInteger = (index: number) => {
    const newIntegerVars = [...integerVars];
    newIntegerVars[index] = !newIntegerVars[index];
    setIntegerVars(newIntegerVars);
  };
  
  const handleSubmit = () => {
    const integerConstraints = integerVars
      .map((isInteger, index) => 
        isInteger ? {
          variableIndex: index,
          variableName: baseProblem.variables[index],
          mustBeInteger: true
        } : null
      )
      .filter(constraint => constraint !== null);
    
    if (integerConstraints.length === 0) {
      alert('Selecione pelo menos uma variável para ser inteira');
      return;
    }
    
    const integerProgram: IntegerProgram = {
      ...baseProblem,
      integerConstraints: integerConstraints as NonNullable<typeof integerConstraints[number]>[]
    };
    
    onSubmit(integerProgram);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Definir Restrições de Integralidade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Selecione quais variáveis devem ter valores inteiros. 
            O algoritmo Branch and Bound será usado para encontrar a solução ótima inteira.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Variáveis:</h4>
          {baseProblem.variables.map((varName, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Checkbox
                id={`var-${index}`}
                checked={integerVars[index]}
                onCheckedChange={() => handleToggleInteger(index)}
              />
              <label
                htmlFor={`var-${index}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {varName} deve ser inteira
              </label>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-600">
            {integerVars.filter(v => v).length} de {baseProblem.variables.length} variáveis 
            selecionadas como inteiras
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={!integerVars.some(v => v)}
          >
            Resolver com Branch & Bound
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegerProblemForm;
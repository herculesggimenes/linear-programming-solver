import React, { useState } from 'react';
import type { LinearProgram } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, X } from 'lucide-react';

interface StructuredProblemFormProps {
  onSubmit: (problem: LinearProgram) => void;
}

const DEFAULT_VARS_COUNT = 2;

const StructuredProblemForm: React.FC<StructuredProblemFormProps> = ({ onSubmit }) => {
  // Problem type (maximize or minimize)
  const [problemType, setProblemType] = useState<'maximize' | 'minimize'>('maximize');
  
  // Number of variables
  const [variableCount, setVariableCount] = useState(DEFAULT_VARS_COUNT);
  
  // Variable names (x1, x2, etc.)
  const [variableNames, setVariableNames] = useState<string[]>(
    Array(DEFAULT_VARS_COUNT).fill(0).map((_, i) => `x${i + 1}`)
  );
  
  // Variable restrictions (true = non-negative, false = unrestricted)
  const [variableRestrictions, setVariableRestrictions] = useState<boolean[]>(
    Array(DEFAULT_VARS_COUNT).fill(true)
  );
  
  // Objective function coefficients and RHS
  const [objectiveCoeffs, setObjectiveCoeffs] = useState<number[]>(
    Array(DEFAULT_VARS_COUNT).fill(1)
  );
  
  // Objective function RHS/constant term
  const [objectiveRHS, setObjectiveRHS] = useState<number | undefined>(undefined);
  
  // Constraints
  const [constraints, setConstraints] = useState<
    {coefficients: number[], operator: '<=' | '>=' | '=', rhs: number}[]
  >([
    { coefficients: Array(DEFAULT_VARS_COUNT).fill(1), operator: '<=', rhs: 10 },
    { coefficients: Array(DEFAULT_VARS_COUNT).fill(1), operator: '<=', rhs: 10 }
  ]);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Update variable count
  const handleVariableCountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCount = parseInt(e.target.value);
    if (isNaN(newCount) || newCount < 1) return;
    
    const difference = newCount - variableCount;
    
    if (difference > 0) {
      // Add new variables
      setVariableNames([
        ...variableNames,
        ...Array(difference).fill(0).map((_, i) => `x${variableCount + i + 1}`)
      ]);
      
      setObjectiveCoeffs([
        ...objectiveCoeffs,
        ...Array(difference).fill(1)
      ]);
      
      // Add new variable restrictions (default to non-negative)
      setVariableRestrictions([
        ...variableRestrictions,
        ...Array(difference).fill(true)
      ]);
      
      // Update constraints
      setConstraints(
        constraints.map(c => ({
          ...c,
          coefficients: [...c.coefficients, ...Array(difference).fill(1)]
        }))
      );
      
    } else if (difference < 0) {
      // Remove variables
      setVariableNames(variableNames.slice(0, newCount));
      setObjectiveCoeffs(objectiveCoeffs.slice(0, newCount));
      setVariableRestrictions(variableRestrictions.slice(0, newCount));
      
      // Update constraints
      setConstraints(
        constraints.map(c => ({
          ...c,
          coefficients: c.coefficients.slice(0, newCount)
        }))
      );
    }
    
    setVariableCount(newCount);
  };
  
  // Update variable name
  const handleVariableNameChange = (index: number, name: string) => {
    const newNames = [...variableNames];
    newNames[index] = name;
    setVariableNames(newNames);
  };
  
  // Toggle variable restriction (non-negative/unrestricted)
  const toggleVariableRestriction = (index: number) => {
    const newRestrictions = [...variableRestrictions];
    newRestrictions[index] = !newRestrictions[index];
    setVariableRestrictions(newRestrictions);
  };
  
  // Update objective coefficient
  const handleObjectiveCoeffChange = (index: number, value: string) => {
    const coefficient = parseFloat(value);
    if (isNaN(coefficient)) return;
    
    const newCoeffs = [...objectiveCoeffs];
    newCoeffs[index] = coefficient;
    setObjectiveCoeffs(newCoeffs);
  };
  
  // Add a constraint
  const addConstraint = () => {
    setConstraints([
      ...constraints,
      {
        coefficients: Array(variableCount).fill(1),
        operator: '<=',
        rhs: 10
      }
    ]);
  };
  
  // Remove a constraint
  const removeConstraint = (index: number) => {
    if (constraints.length <= 1) {
      setError("You must have at least one constraint");
      return;
    }
    
    setConstraints(constraints.filter((_, i) => i !== index));
  };
  
  // Update constraint coefficient
  const handleConstraintCoeffChange = (
    constraintIndex: number,
    varIndex: number,
    value: string
  ) => {
    const coefficient = parseFloat(value);
    if (isNaN(coefficient)) return;
    
    const newConstraints = [...constraints];
    newConstraints[constraintIndex].coefficients[varIndex] = coefficient;
    setConstraints(newConstraints);
  };
  
  // Update constraint operator
  const handleConstraintOperatorChange = (
    constraintIndex: number,
    operator: '<=' | '>=' | '='
  ) => {
    const newConstraints = [...constraints];
    newConstraints[constraintIndex].operator = operator;
    setConstraints(newConstraints);
  };
  
  // Update constraint RHS
  const handleConstraintRhsChange = (constraintIndex: number, value: string) => {
    const rhs = parseFloat(value);
    if (isNaN(rhs)) return;
    
    const newConstraints = [...constraints];
    newConstraints[constraintIndex].rhs = rhs;
    setConstraints(newConstraints);
  };
  
  // Submit the form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Check for valid variable names
      if (new Set(variableNames).size !== variableNames.length) {
        throw new Error("Os nomes das variáveis devem ser únicos");
      }
      
      // Create the LinearProgram object
      const linearProgram: LinearProgram = {
        objective: [...objectiveCoeffs],
        objectiveRHS: objectiveRHS !== undefined ? objectiveRHS : undefined,
        constraints: constraints.map(c => ({
          coefficients: [...c.coefficients],
          operator: c.operator,
          rhs: c.rhs
        })),
        isMaximization: problemType === 'maximize',
        variables: [...variableNames],
        variableRestrictions: [...variableRestrictions] // Add variable restrictions
      };
      
      onSubmit(linearProgram);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Format the problem as a string for display
  const formatProblem = () => {
    let result = `${problemType === 'maximize' ? 'Maximizar' : 'Minimizar'}\n`;
    
    // Format objective function
    result += objectiveCoeffs.map((coeff, i) => 
      `${i > 0 && coeff >= 0 ? '+ ' : ''}${coeff}${variableNames[i]}`
    ).join(' ');
    
    // Add objective RHS if it exists
    if (objectiveRHS !== undefined) {
      result += `${objectiveRHS >= 0 ? ' + ' : ' '}${objectiveRHS}`;
    }
    
    result += '\n\n';
    
    result += 'Sujeito a\n';
    
    // Format constraints
    constraints.forEach((constraint) => {
      result += constraint.coefficients.map((coeff, i) => 
        `${i > 0 && coeff >= 0 ? '+ ' : ''}${coeff}${variableNames[i]}`
      ).join(' ') + ` ${constraint.operator} ${constraint.rhs}\n`;
    });
    
    // Add variable restrictions
    const nonNegativeVars = variableNames.filter((_, i) => variableRestrictions[i]);
    const unrestrictedVars = variableNames.filter((_, i) => !variableRestrictions[i]);
    
    if (nonNegativeVars.length > 0) {
      result += `${nonNegativeVars.join(', ')} ≥ 0\n`;
    }
    
    if (unrestrictedVars.length > 0) {
      result += `${unrestrictedVars.join(', ')} livres`;
    }
    
    return result;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl mb-2">Criar Problema de Programação Linear Personalizado</CardTitle>
        <p className="text-gray-600 text-sm">
          Preencha o formulário abaixo para definir seu problema de programação linear.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Problem Type */}
          <div className="space-y-2">
            <Label>Tipo de Problema</Label>
            <RadioGroup 
              value={problemType} 
              onValueChange={(value) => setProblemType(value as 'maximize' | 'minimize')}
              className="flex flex-row space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maximize" id="maximize" />
                <Label htmlFor="maximize">Maximizar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minimize" id="minimize" />
                <Label htmlFor="minimize">Minimizar</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Variables */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Variáveis</Label>
              <Select 
                value={variableCount.toString()} 
                onChange={handleVariableCountChange}
                className="w-24"
              >
                {[2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} variáveis</option>
                ))}
              </Select>
            </div>
            
            <div className="grid gap-2">
              {Array(variableCount).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Input
                    value={variableNames[i]}
                    onChange={e => handleVariableNameChange(i, e.target.value)}
                    className="w-20 font-mono"
                    placeholder={`x${i + 1}`}
                    title="Nome da variável"
                  />
                  <div 
                    className={`cursor-pointer p-1 rounded-md border ${variableRestrictions[i] ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`} 
                    onClick={() => toggleVariableRestriction(i)}
                  >
                    <span className="text-sm">
                      {variableRestrictions[i] ? '≥ 0' : 'livre'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Objective Function */}
          <div className="space-y-3">
            <Label>Função Objetivo ({problemType === 'maximize' ? 'Maximizar' : 'Minimizar'})</Label>
            <div className="flex flex-wrap items-center gap-2">
              {objectiveCoeffs.map((coeff, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span>+</span>}
                  <Input
                    type="number"
                    step="any"
                    value={coeff}
                    onChange={e => handleObjectiveCoeffChange(i, e.target.value)}
                    className="w-16 font-mono"
                    title={`Coeficiente para ${variableNames[i]}`}
                  />
                  <span className="mr-1">{variableNames[i]}</span>
                </React.Fragment>
              ))}
              
              {/* Objective constant term */}
              <span className="ml-2">+</span>
              <Input
                type="number"
                step="any"
                value={objectiveRHS !== undefined ? objectiveRHS : ''}
                onChange={e => {
                  if (e.target.value === '') {
                    setObjectiveRHS(undefined);
                  } else {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value)) setObjectiveRHS(value);
                  }
                }}
                className="w-16 font-mono"
                placeholder="0"
                title="Termo constante (opcional)"
              />
              <span className="text-sm text-gray-500">(termo constante)</span>
            </div>
          </div>
          
          {/* Constraints */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-md font-semibold">Restrições</Label>
              <Button 
                type="button" 
                size="sm" 
                onClick={addConstraint}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Adicionar Restrição
              </Button>
            </div>
            
            {constraints.map((constraint, constraintIndex) => (
              <Card key={constraintIndex} className="p-4 relative">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 right-1 h-8 w-8 p-0"
                  onClick={() => removeConstraint(constraintIndex)}
                  title="Remover restrição"
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex flex-wrap items-center gap-2">
                  {constraint.coefficients.map((coeff, varIndex) => (
                    <React.Fragment key={varIndex}>
                      {varIndex > 0 && <span>+</span>}
                      <Input
                        type="number"
                        step="any"
                        value={coeff}
                        onChange={e => handleConstraintCoeffChange(constraintIndex, varIndex, e.target.value)}
                        className="w-16 font-mono"
                        title={`Coeficiente para ${variableNames[varIndex]}`}
                      />
                      <span className="mr-1">{variableNames[varIndex]}</span>
                    </React.Fragment>
                  ))}
                  
                  <Select
                    value={constraint.operator}
                    onChange={e => handleConstraintOperatorChange(
                      constraintIndex, 
                      e.target.value as '<=' | '>=' | '='
                    )}
                    className="w-20"
                  >
                    <option value="<=">≤</option>
                    <option value=">=">≥</option>
                    <option value="=">=</option>
                  </Select>
                  
                  <Input
                    type="number"
                    step="any"
                    value={constraint.rhs}
                    onChange={e => handleConstraintRhsChange(constraintIndex, e.target.value)}
                    className="w-16 font-mono"
                    title="Valor do lado direito"
                  />
                </div>
              </Card>
            ))}
          </div>
          
          {/* Error display */}
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertTitle className="text-red-700">Erro</AlertTitle>
              <AlertDescription className="text-red-600">{error}</AlertDescription>
            </Alert>
          )}
          
          {/* Preview */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">Pré-visualização do Problema</h3>
            <div className="bg-gray-50 p-4 rounded font-mono text-sm whitespace-pre-wrap">
              {formatProblem()}
            </div>
          </div>
          
          {/* Submit */}
          <Button type="submit" className="w-full">
            Criar Visualização
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default StructuredProblemForm;
import React, { useState } from 'react';
import type { LinearProgram } from './types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';

interface CustomProblemInputProps {
  onSubmit: (problem: LinearProgram) => void;
}

// Example problem format as a guide for users
const EXAMPLE_FORMAT = `Maximize
3x₁ + 2x₂
Subject to
2x₁ + x₂ <= 10
x₁ + 2x₂ <= 8
x₁, x₂ >= 0`;

const CustomProblemInput: React.FC<CustomProblemInputProps> = ({ onSubmit }) => {
  const [inputText, setInputText] = useState<string>('');
  const [problemType, setProblemType] = useState<'maximize' | 'minimize'>('maximize');
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<LinearProgram | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // Parse the input text to create a LinearProgram object
  const parseProblem = () => {
    try {
      setError(null);
      
      // Trim input and split by line
      const lines = inputText.trim().split('\n').map(line => line.trim()).filter(line => line);
      
      // Find the objective function line(s)
      const objectiveIndex = lines.findIndex(line => 
        line.toLowerCase() === 'maximize' || line.toLowerCase() === 'minimize'
      );
      
      if (objectiveIndex === -1) {
        throw new Error('Could not find "Maximize" or "Minimize" keyword');
      }
      
      // Determine if it's a maximization or minimization problem
      const isMaximization = lines[objectiveIndex].toLowerCase() === 'maximize';
      
      // Find the "Subject to" line
      const subjectToIndex = lines.findIndex(line => 
        line.toLowerCase() === 'subject to' || line.toLowerCase() === 'st' || line.toLowerCase() === 's.t.'
      );
      
      if (subjectToIndex === -1 || subjectToIndex <= objectiveIndex) {
        throw new Error('Could not find "Subject to" after the objective function');
      }
      
      // Extract the objective function (should be in the line after "Maximize"/"Minimize")
      const objectiveStr = lines.slice(objectiveIndex + 1, subjectToIndex).join(' ');
      const { coefficients: objective, variables } = parseLinearExpression(objectiveStr);
      
      // Extract constraints (all lines after "Subject to" until the end or another keyword)
      const constraintLines = lines.slice(subjectToIndex + 1);
      const constraints = [];
      const nonNegativity = [];
      
      for (const line of constraintLines) {
        // Skip empty lines
        if (!line.trim()) continue;
        
        // Check if this is a non-negativity constraint
        if (line.includes('>=') && line.includes('0') && !line.includes('+') && !line.includes('-')) {
          // This is likely a non-negativity constraint like "x₁, x₂ >= 0"
          continue;
        }
        
        // Parse the constraint
        const constraint = parseConstraint(line, variables);
        constraints.push(constraint);
      }
      
      // Create the linear program
      const linearProgram: LinearProgram = {
        objective,
        constraints,
        isMaximization,
        variables
      };
      
      setParsed(linearProgram);
      onSubmit(linearProgram);
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Helper function to parse linear expressions like "3x₁ + 2x₂"
  const parseLinearExpression = (expr: string): { coefficients: number[], variables: string[] } => {
    const cleaned = expr.replace(/\s+/g, '');
    const terms = cleaned.match(/[+\-]?\d*[a-zα-ω₀-₉][\u2080-\u2089₀-₉]*/g) || [];
    
    if (!terms.length) {
      throw new Error(`Could not parse expression: "${expr}"`);
    }
    
    // Extract variable names (assuming format like "x₁" or "x1")
    const variableSet = new Set<string>();
    
    for (const term of terms) {
      // Find the variable part (letters + subscripts)
      const varMatch = term.match(/[a-zα-ω₀-₉][\u2080-\u2089₀-₉]*/);
      if (varMatch) {
        variableSet.add(varMatch[0]);
      }
    }
    
    // Sort variables naturally (x₁, x₂, etc.)
    const variables = Array.from(variableSet).sort((a, b) => {
      // Extract the numeric part of the subscript
      const aNum = a.match(/\d+$/) || a.match(/[₀-₉]+$/);
      const bNum = b.match(/\d+$/) || b.match(/[₀-₉]+$/);
      
      // Convert subscript numbers to regular numbers if needed
      const aVal = aNum ? parseInt(aNum[0].replace(/₀/g, '0').replace(/₁/g, '1').replace(/₂/g, '2')
                             .replace(/₃/g, '3').replace(/₄/g, '4').replace(/₅/g, '5')
                             .replace(/₆/g, '6').replace(/₇/g, '7').replace(/₈/g, '8').replace(/₉/g, '9')) : 0;
      const bVal = bNum ? parseInt(bNum[0].replace(/₀/g, '0').replace(/₁/g, '1').replace(/₂/g, '2')
                             .replace(/₃/g, '3').replace(/₄/g, '4').replace(/₅/g, '5')
                             .replace(/₆/g, '6').replace(/₇/g, '7').replace(/₈/g, '8').replace(/₉/g, '9')) : 0;
      
      return aVal - bVal;
    });
    
    // Extract coefficients for each variable
    const coefficients = Array(variables.length).fill(0);
    
    for (const term of terms) {
      for (let i = 0; i < variables.length; i++) {
        const variable = variables[i];
        
        // Check if this term contains the variable
        if (term.includes(variable)) {
          // Extract the coefficient
          let coeff = term.replace(variable, '');
          
          if (coeff === '' || coeff === '+') {
            coeff = '1';
          } else if (coeff === '-') {
            coeff = '-1';
          }
          
          coefficients[i] += parseFloat(coeff);
          break;
        }
      }
    }
    
    return { coefficients, variables };
  };

  // Helper function to parse constraints like "2x₁ + x₂ <= 10"
  const parseConstraint = (constraintStr: string, allVars: string[]): { 
    coefficients: number[], rhs: number, operator: '<=' | '>=' | '=' 
  } => {
    // Determine the operator type
    let operator: '<=' | '>=' | '=' = '<=';
    
    if (constraintStr.includes('<=')) {
      operator = '<=';
    } else if (constraintStr.includes('>=')) {
      operator = '>=';
    } else if (constraintStr.includes('=')) {
      operator = '=';
    } else {
      throw new Error(`Could not find operator (<=, >=, =) in constraint: "${constraintStr}"`);
    }
    
    // Split by the operator
    const [lhs, rhsStr] = constraintStr.split(operator as string).map(s => s.trim());
    
    if (!lhs || !rhsStr) {
      throw new Error(`Invalid constraint format: "${constraintStr}"`);
    }
    
    // Parse the right-hand side
    const rhs = parseFloat(rhsStr);
    
    if (isNaN(rhs)) {
      throw new Error(`Could not parse RHS value from: "${rhsStr}"`);
    }
    
    // Parse the left-hand side
    const { coefficients: unfilteredCoeffs, variables: unfilteredVars } = parseLinearExpression(lhs);
    
    // Map these coefficients to match the original variable list
    const coefficients = Array(allVars.length).fill(0);
    
    for (let i = 0; i < unfilteredVars.length; i++) {
      const varIndex = allVars.indexOf(unfilteredVars[i]);
      if (varIndex !== -1) {
        coefficients[varIndex] = unfilteredCoeffs[i];
      } else {
        throw new Error(`Variable "${unfilteredVars[i]}" in constraint is not defined in the objective function`);
      }
    }
    
    return { coefficients, rhs, operator };
  };

  // Format the parsed problem back as readable text
  const formatLinearProgram = (lp: LinearProgram): string => {
    let result = `${lp.isMaximization ? 'Maximize' : 'Minimize'}\n`;
    
    // Format objective function
    result += lp.objective.map((coeff, i) => 
      `${i > 0 && coeff >= 0 ? '+ ' : ''}${coeff === 1 ? '' : coeff === -1 ? '-' : coeff}${lp.variables[i]}`
    ).join(' ') + '\n\n';
    
    result += 'Subject to\n';
    
    // Format constraints
    lp.constraints.forEach(constraint => {
      result += constraint.coefficients.map((coeff, i) => 
        `${i > 0 && coeff >= 0 ? '+ ' : ''}${coeff === 1 ? '' : coeff === -1 ? '-' : coeff}${lp.variables[i]}`
      ).join(' ') + ` ${constraint.operator} ${constraint.rhs}\n`;
    });
    
    // Add non-negativity constraints
    result += `${lp.variables.join(', ')} >= 0`;
    
    return result;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl mb-2">Custom Linear Programming Problem</CardTitle>
        <p className="text-gray-600 text-sm">
          Enter your linear programming problem below. The parser will attempt to interpret it and create a visualization.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <Label htmlFor="lpInput" className="mb-2 block font-medium text-gray-700">
              Problem Input
              <Button 
                variant="link" 
                size="sm" 
                className="ml-2 p-0 h-auto" 
                onClick={() => setShowHelp(!showHelp)}
              >
                {showHelp ? 'Hide Help' : 'Show Help'}
              </Button>
            </Label>
            
            {showHelp && (
              <Alert className="mb-2">
                <AlertTitle>Format Example</AlertTitle>
                <AlertDescription>
                  <pre className="text-xs mt-2 bg-gray-50 p-2 rounded-md whitespace-pre-wrap">
                    {EXAMPLE_FORMAT}
                  </pre>
                  <p className="text-sm mt-2">
                    Start with "Maximize" or "Minimize", followed by your objective function.
                    Then write "Subject to" and list your constraints line by line.
                    Variables should be in the format x₁, x₂, etc.
                  </p>
                </AlertDescription>
              </Alert>
            )}
            
            <Textarea
              id="lpInput"
              className="font-mono h-48"
              placeholder={EXAMPLE_FORMAT}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <RadioGroup 
                value={problemType} 
                onValueChange={(value) => setProblemType(value as 'maximize' | 'minimize')}
                className="flex flex-row space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="maximize" id="maximize" />
                  <Label htmlFor="maximize">Maximize</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minimize" id="minimize" />
                  <Label htmlFor="minimize">Minimize</Label>
                </div>
              </RadioGroup>
              
              <Button onClick={parseProblem} className="ml-auto">
                Create Visualization
              </Button>
            </div>
          </div>
          
          {parsed && (
            <div className="flex-1">
              <Label className="mb-2 block font-medium text-gray-700">
                Parsed Problem
              </Label>
              <div className="p-4 bg-gray-50 rounded-md h-48 overflow-auto font-mono text-sm whitespace-pre-wrap">
                {formatLinearProgram(parsed)}
              </div>
              
              <div className="mt-4">
                <Alert variant="success" className="bg-green-50 border-green-200">
                  <AlertTitle className="text-green-700">Problem Parsed Successfully</AlertTitle>
                  <AlertDescription className="text-green-600">
                    Your problem has been parsed and will be visualized below.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
          
          {error && !parsed && (
            <div className="flex-1">
              <Label className="mb-2 block font-medium text-gray-700">
                Error
              </Label>
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertTitle className="text-red-700">Failed to Parse Problem</AlertTitle>
                <AlertDescription className="text-red-600 whitespace-pre-wrap">
                  {error}
                </AlertDescription>
              </Alert>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="font-semibold text-gray-700 mb-2">Tips for Fixing:</h4>
                <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
                  <li>Make sure you include "Maximize" or "Minimize" on its own line</li>
                  <li>Include "Subject to" on its own line</li>
                  <li>Write each constraint on a separate line</li>
                  <li>Use operators like &lt;=, &gt;=, or = for constraints</li>
                  <li>Use consistent variable names throughout</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomProblemInput;
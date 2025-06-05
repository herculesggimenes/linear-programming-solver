import React, { useState, useEffect } from 'react';
import SimplexVisualizer from '@/components/SimplexVisualizer';
import StructuredProblemForm from '@/components/StructuredProblemForm';
import type { LinearProgram } from '@/components/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { convertToStandardFormWithExplanation } from '@/lib/standard-form-conversion';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const EXAMPLE_PROBLEMS: { [key: string]: LinearProgram } = {
  example1: {
    objective: [3, 2],
    constraints: [
      { coefficients: [2, 1], rhs: 10, operator: '<=' },
      { coefficients: [1, 2], rhs: 8, operator: '<=' }
    ],
    isMaximization: true,
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true] // both non-negative
  },
  example2: {
    objective: [5, 4],
    constraints: [
      { coefficients: [1, 1], rhs: 5, operator: '<=' },
      { coefficients: [2, 1], rhs: 8, operator: '<=' }
    ],
    isMaximization: true,
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true]
  },
  example3: {
    objective: [2, 3],
    constraints: [
      { coefficients: [1, 2], rhs: 6, operator: '<=' },
      { coefficients: [3, 2], rhs: 12, operator: '<=' }
    ],
    isMaximization: true,
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true]
  },
  unbounded: {
    objective: [2, 1],
    constraints: [
      { coefficients: [-1, 1], rhs: 1, operator: '<=' },
      { coefficients: [-1, -1], rhs: -3, operator: '<=' }
    ],
    isMaximization: true,
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true]
  },
  unrestricted: {
    objective: [3, -2],
    constraints: [
      { coefficients: [1, 1], rhs: 6, operator: '<=' },
      { coefficients: [2, -1], rhs: 8, operator: '<=' }
    ],
    isMaximization: true,
    variables: ['x1', 'x2'],
    variableRestrictions: [true, false] // x1 ≥ 0, x2 unrestricted
  },
  example4: {
    objective: [5, 2],
    constraints: [
      { coefficients: [10, 12], rhs: -60, operator: '>=' },
      { coefficients: [2, 1], rhs: 6, operator: '=' }
    ],
    isMaximization: true,
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true]
  },
  example5: {
    objective: [10, 7, 0],
    constraints: [
      { coefficients: [2, 1, 1], rhs: 5000, operator: '<=' },
      { coefficients: [4, 5, 0], rhs: 15000, operator: '>=' }
    ],
    isMaximization: true,
    variables: ['x₁', 'x₂', 'x₃'],
    variableRestrictions: [true, false, true] // x₁ ≥ 0, x₂ unrestricted, x₃ ≥ 0
  },
  // Example with RHS value in objective function
  objectiveRHS: {
    objective: [3, 2],
    objectiveRHS: 5, // z = 3x1 + 2x2 + 5
    constraints: [
      { coefficients: [2, 1], rhs: 10, operator: '<=' },
      { coefficients: [1, 2], rhs: 8, operator: '<=' }
    ],
    isMaximization: true,
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true]
  },
  // New problems from user input
  newProblem1: {
    objective: [2, 3],
    isMaximization: false, // min z = 2x1 + 3x2
    constraints: [
      { coefficients: [1, 3], rhs: 9, operator: '>=' }, // x1 + 3x2 ≥ 9
      { coefficients: [-1, 2], rhs: 4, operator: '<=' }, // −x1 + 2x2 ≤ 4
      { coefficients: [1, 1], rhs: 6, operator: '<=' }   // x1 + x2 ≤ 6
    ],
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true] // x1, x2 ≥ 0
  },
  newProblem2: {
    objective: [5, 2],
    isMaximization: true, // max z = 5x1 + 2x2
    constraints: [
      { coefficients: [10, 12], rhs: 60, operator: '<=' }, // 10x1 + 12x2 ≤ 60
      { coefficients: [2, 1], rhs: 6, operator: '<=' }     // 2x1 + x2 ≤ 6
    ],
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true] // x1, x2 ≥ 0
  },
  newProblem3: {
    objective: [10, 7],
    isMaximization: true, // max z = 10x1 + 7x2
    constraints: [
      { coefficients: [2, 1], rhs: 5, operator: '<=' }, // 2x1 + x2 ≤ 5
      { coefficients: [4, 5], rhs: 15, operator: '<=' } // 4x1 + 5x2 ≤ 15
    ],
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true] // x1, x2 ≥ 0
  },
  newProblem4: {
    objective: [2, 3],
    isMaximization: true, // max z = 2x1 + 3x2
    constraints: [
      { coefficients: [1, 3], rhs: 9, operator: '<=' }, // x1 + 3x2 ≤ 9
      { coefficients: [-1, 2], rhs: 4, operator: '<=' }, // −x1 + 2x2 ≤ 4
      { coefficients: [1, 1], rhs: 6, operator: '<=' }   // x1 + x2 ≤ 6
    ],
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true] // x1, x2 ≥ 0
  },
  // Phase I examples
  phaseIExample: {
    objective: [3, 2],
    isMaximization: true, // max z = 3x1 + 2x2
    constraints: [
      { coefficients: [1, 2], rhs: 8, operator: '=' }, // x1 + 2x2 = 8
      { coefficients: [3, 1], rhs: 10, operator: '=' }  // 3x1 + x2 = 10
    ],
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true] // x1, x2 ≥ 0
  },
  infeasibleExample: {
    objective: [2, 3],
    isMaximization: true, // max z = 2x1 + 3x2
    constraints: [
      { coefficients: [1, 1], rhs: 10, operator: '<=' }, // x1 + x2 ≤ 10
      { coefficients: [1, 1], rhs: 15, operator: '>=' }  // x1 + x2 ≥ 15 (contradictory with first constraint)
    ],
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true] // x1, x2 ≥ 0
  },
  phaseIDebugExample: {
    objective: [2, 3],
    isMaximization: true, // max z = 2x1 + 3x2
    constraints: [
      { coefficients: [1, 1], rhs: 3, operator: '=' },  // x1 + x2 = 3
      { coefficients: [1, 2], rhs: 4, operator: '<=' }  // x1 + 2x2 ≤ 4
    ],
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true] // x1, x2 ≥ 0
  },
  productionPlanningPhaseI: {
    objective: [80, 40],
    isMaximization: true, // max z = 80x1 + 40x2
    constraints: [
      { coefficients: [1, 4], rhs: 300, operator: '<=' },  // x1 + 4x2 ≤ 300
      { coefficients: [1, 0], rhs: 50, operator: '>=' },   // x1 ≥ 50
      { coefficients: [0, 1], rhs: 50, operator: '>=' }    // x2 ≥ 50
    ],
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true] // x1, x2 ≥ 0
  },
  mixedConstraints: {
    objective: [6, -1],
    isMaximization: true, // max z = 6x1 - x2
    constraints: [
      { coefficients: [4, 1], rhs: 21, operator: '<=' },   // 4x1 + x2 ≤ 21
      { coefficients: [2, 3], rhs: 13, operator: '>=' },   // 2x1 + 3x2 ≥ 13
      { coefficients: [1, -1], rhs: -1, operator: '=' }    // x1 - x2 = -1
    ],
    variables: ['x1', 'x2'],
    variableRestrictions: [true, true] // x1, x2 ≥ 0
  }
};

function App() {
  const [selectedProblem, setSelectedProblem] = useState<string>('example1');
  const [inputMode, setInputMode] = useState<'examples' | 'custom'>('examples');
  const [customProblem, setCustomProblem] = useState<LinearProgram | null>(null);
  const [standardFormExplanation, setStandardFormExplanation] = useState<string | null>(null);
  const [exampleStandardFormExplanation, setExampleStandardFormExplanation] = useState<{[key: string]: string}>({});
  
  // Determine which problem to use
  const currentProblem = inputMode === 'custom' && customProblem ? 
    customProblem : 
    EXAMPLE_PROBLEMS[selectedProblem];
    
  // Generate standard form explanations for example problems
  useEffect(() => {
    // Generate explanations for all examples
    const explanations: {[key: string]: string} = {};
    Object.entries(EXAMPLE_PROBLEMS).forEach(([key, problem]) => {
      const { standardLP, explanation } = convertToStandardFormWithExplanation(problem);
      explanations[key] = explanation;
    });
    
    setExampleStandardFormExplanation(explanations);
  }, []);
  
  // Handle custom problem submission
  const handleCustomProblemSubmit = (problem: LinearProgram) => {
    // Convert to standard form with explanation
    const { standardLP, explanation } = convertToStandardFormWithExplanation(problem);
    setCustomProblem(standardLP);
    setStandardFormExplanation(explanation);
    setInputMode('custom');
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-5 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600 mb-3">Interactive Simplex Method Visualizer</h1>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Learn linear programming concepts through step-by-step visualization of the simplex algorithm.
        </p>
      </header>

      <Tabs defaultValue="examples" className="mb-8" onValueChange={(value) => setInputMode(value as 'examples' | 'custom')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="examples">Example Problems</TabsTrigger>
          <TabsTrigger value="custom">Custom Problem</TabsTrigger>
        </TabsList>
        
        <TabsContent value="examples" className="mt-4">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">Select Example Problem</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {Object.keys(EXAMPLE_PROBLEMS).map((key) => (
              <div 
                key={key} 
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md
                  ${selectedProblem === key && inputMode === 'examples' 
                    ? 'border-blue-500 bg-blue-50 shadow-blue-100' 
                    : 'border-gray-200'}`}
                onClick={() => {
                  setSelectedProblem(key);
                  setInputMode('examples');
                  setStandardFormExplanation(null);
                }}
              >
                <h3 className="text-xl font-medium text-blue-600 mb-3">
                  {key === 'unbounded' ? 'Unbounded Problem' : 
                   key === 'unrestricted' ? 'Unrestricted Problem' :
                   key === 'example4' ? 'Standard Form Conversion 1' :
                   key === 'example5' ? 'Standard Form Conversion 2' :
                   key === 'objectiveRHS' ? 'Objective with Constant' :
                   key === 'newProblem1' ? 'Min with ≥ Constraint' :
                   key === 'newProblem2' ? 'Max with ≤ Constraints' :
                   key === 'newProblem3' ? 'Max with Resource Constraints' :
                   key === 'newProblem4' ? 'Max with Multiple Constraints' :
                   key === 'phaseIExample' ? 'Phase I Example' :
                   key === 'infeasibleExample' ? 'Infeasible Problem Example' :
                   key === 'phaseIDebugExample' ? 'Phase I Debug Example' :
                   key === 'productionPlanningPhaseI' ? 'Production Planning (Phase I)' :
                   key === 'mixedConstraints' ? 'Mixed Constraints (≤, ≥, =)' :
                   `Example ${key.replace('example', '')}`}
                </h3>
                <div className="text-sm">
                  <p className="mb-2">
                    <span className="font-semibold">{EXAMPLE_PROBLEMS[key].isMaximization ? 'Maximize:' : 'Minimize:'}</span>{" "}
                    {EXAMPLE_PROBLEMS[key].objective.map((coeff, index) => 
                      `${coeff > 0 && index > 0 ? '+' : ''}${coeff}${EXAMPLE_PROBLEMS[key].variables[index]}`
                    ).join(' ')}
                    {EXAMPLE_PROBLEMS[key].objectiveRHS !== undefined ? 
                      `${EXAMPLE_PROBLEMS[key].objectiveRHS > 0 ? ' +' : ' '}${EXAMPLE_PROBLEMS[key].objectiveRHS}` : 
                      ''}
                  </p>
                  <p className="font-semibold mb-1">Subject to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {EXAMPLE_PROBLEMS[key].constraints.map((constraint, i) => (
                      <li key={i}>
                        {constraint.coefficients.map((coeff, j) => 
                          `${coeff > 0 && j > 0 ? '+' : ''}${coeff}${EXAMPLE_PROBLEMS[key].variables[j]}`
                        ).join(' ')} 
                        {constraint.operator} {constraint.rhs}
                      </li>
                    ))}
                    {EXAMPLE_PROBLEMS[key].variableRestrictions?.some(r => !r) ?
                      EXAMPLE_PROBLEMS[key].variables.map((v, idx) => (
                        <li key={`var-${idx}`}>
                          {v} {EXAMPLE_PROBLEMS[key].variableRestrictions?.[idx] ? '≥ 0' : 'unrestricted'}
                        </li>
                      )) : 
                      <li>{EXAMPLE_PROBLEMS[key].variables.join(', ')} ≥ 0</li>
                    }
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="mt-4">
          <StructuredProblemForm onSubmit={handleCustomProblemSubmit} />
        </TabsContent>
      </Tabs>
      
      {/* Standard form explanation is now shown within the SimplexVisualizer as a step */}
      
      <div className="mt-6 border border-gray-200 rounded-lg p-3 sm:p-5 bg-white shadow-sm overflow-hidden">
        <SimplexVisualizer lp={currentProblem} showGeometric={true} width={900} height={400} />
      </div>

      <footer className="mt-10 py-5 text-center text-gray-500 border-t border-gray-200">
        <p>Interactive Linear Programming Learning Tool</p>
      </footer>
    </div>
  );
}

export default App;
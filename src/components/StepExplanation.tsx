import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { SimplexStep } from '@/components/types';

interface StepExplanationProps {
  step: SimplexStep;
}

const StepExplanation: React.FC<StepExplanationProps> = ({ step }) => {
  // Handle different types of steps with appropriate rendering
  if (step.status === 'standard_form') {
    return <StandardFormExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'artificial_vars') {
    return <ArtificialVarsExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'initial') {
    return <InitialTableauExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'phase1_introduction') {
    return <PhaseOneIntroductionExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'phase1_start') {
    return <PhaseOneExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'phase1_optimal') {
    return <PhaseOneOptimalExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'phase2_start') {
    return <PhaseTransitionExplanation explanation={step.explanation} step={step} />;
  }
  
  if (step.status === 'phase2_noncanonical') {
    return <PhaseIINonCanonicalExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'phase2_canonical') {
    return <PhaseIICanonicalExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'phase1_canonicalize') {
    return <CanonicalStepExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'phase1_negate') {
    return <NegationStepExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'iteration') {
    return <IterationExplanation step={step} />;
  }

  if (step.status === 'optimal') {
    return <OptimalSolutionExplanation step={step} />;
  }
  
  if (step.status === 'unbounded') {
    return <UnboundedExplanation step={step} />;
  }
  
  if (step.status === 'infeasible') {
    return <InfeasibleExplanation explanation={step.explanation} />;
  }
  
  // Fallback for any other status
  return <div className="text-gray-700">{step.explanation}</div>;
};

// Component for standard form conversion explanation
const StandardFormExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  // For now, we'll just structure the explanation for better rendering
  // In the future, we'll parse the explanation and render it with proper components
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-blue-700">Converting to Standard Form</h3>
      <p className="text-gray-700 leading-relaxed">
        The standard form conversion process prepares the problem for solution using the simplex algorithm.
      </p>
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm">
        {explanation.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-3">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

// Component for artificial variables explanation
const ArtificialVarsExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  // Extract the number of artificial variables from the explanation
  const artificialVarMatch = explanation.match(/add (\d+) artificial variable/);
  const artificialVarCount = artificialVarMatch ? parseInt(artificialVarMatch[1]) : 'multiple';
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-purple-700">Adding Artificial Variables</h3>
      
      <p className="text-gray-700 leading-relaxed">
        Since we cannot form an initial basis from the available slack variables alone, 
        we need to introduce artificial variables to create a starting point for the simplex method.
      </p>
      
      <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
        <h4 className="font-semibold mb-2 text-gray-800">Why Artificial Variables?</h4>
        <p className="text-gray-700 mb-3">
          Artificial variables are added to constraints that don't have an obvious basic variable:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Equality constraints (no slack variable available)</li>
          <li>Greater-than-or-equal constraints (surplus variables have coefficient -1)</li>
        </ul>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <h4 className="font-semibold mb-2 text-gray-800">The Auxiliary Objective Function</h4>
        <p className="text-gray-700 mb-2">
          We temporarily replace the original objective function with a new one that minimizes the sum of all artificial variables:
        </p>
        <div className="p-2 bg-white rounded border border-gray-300 font-mono text-sm">
          Phase I: Minimize w = a₁ + a₂ + ... + aₙ
        </div>
        <p className="text-gray-700 mt-2">
          This ensures that if a feasible solution exists, all artificial variables will be driven to zero. 
          Once w = 0, we can remove the artificial variables and restore the original objective function for Phase II.
        </p>
      </div>
      
      <div className="text-gray-700 italic">
        The tableau now shows the artificial variables forming an identity matrix in the constraint rows, 
        providing us with an initial basic feasible solution.
      </div>
    </div>
  );
};

// Component for initial tableau explanation
const InitialTableauExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-blue-700">Initial Tableau Setup</h3>
      <p className="text-gray-700 leading-relaxed">
        This is the starting point of the simplex algorithm. The problem has been converted to standard form
        and arranged in a tableau format.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>The first row contains the coefficients of the minimized objective function</li>
          <li>Each subsequent row represents one constraint equation</li>
          <li>Slack/surplus variables have been added to convert inequalities to equalities</li>
          <li>The rightmost column contains the constraint right-hand side values</li>
        </ul>
      </div>
      
      <div className="font-medium text-gray-700 italic">
        The simplex algorithm will now begin iterations to find the optimal solution.
      </div>
    </div>
  );
};

// Component for iteration explanation
const IterationExplanation: React.FC<{ step: SimplexStep }> = ({ step }) => {
  const pivotElement = step.pivotElement ? step.pivotElement : [0, 0];
  const enteringCol = step.enteringVariable;
  const leavingRow = step.leavingVariable;
  const { matrix, basicVariables, variableNames } = step.tableau;
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  const rhsCol = numCols - 1;
  
  // Calculate the minimum ratio for each row
  const ratios = [];
  for (let i = 1; i < numRows; i++) {
    if (matrix[i][enteringCol] > 0) {
      ratios.push({
        row: i,
        ratio: matrix[i][rhsCol] / matrix[i][enteringCol],
        basicVar: basicVariables[i-1]
      });
    } else {
      ratios.push({
        row: i,
        ratio: Infinity,
        basicVar: basicVariables[i-1]
      });
    }
  }
  
  // Sort ratios to find minimum
  ratios.sort((a, b) => a.ratio - b.ratio);
  
  // Get variable names for better display
  const getVarName = (idx) => {
    if (idx < variableNames.length) {
      return variableNames[idx];
    } else {
      return `s${idx - variableNames.length + 1}`;
    }
  };
  
  const enteringVarName = getVarName(enteringCol);
  const leavingVarName = leavingRow && basicVariables[leavingRow-1] !== undefined ? 
    getVarName(basicVariables[leavingRow-1]) : "none";
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-blue-700">
        Simplex Iteration
      </h3>
      
      <div className="space-y-4">
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <h4 className="font-semibold mb-2 text-gray-800">1. Selecting the Entering Variable</h4>
          <p className="text-gray-700 mb-2">
            Looking at the objective function coefficients in the current tableau:
          </p>
          <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm overflow-x-auto mb-2">
            {matrix[0].slice(0, rhsCol).map((coef, idx) => (
              <span key={idx} className={idx === enteringCol ? "text-red-600 font-bold" : ""}>
                {coef.toFixed(2)}{getVarName(idx)}{idx < rhsCol-1 ? ' + ' : ''}
              </span>
            ))}
          </div>
          <p className="text-gray-700 mt-2">
            Variable <span className="font-semibold">{enteringVarName}</span> (column {enteringCol}) was selected to enter the basis 
            because it has the most negative coefficient ({matrix[0][enteringCol].toFixed(2)}) in the objective row, 
            which will improve our objective value the most.
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <h4 className="font-semibold mb-2 text-gray-800">2. Selecting the Leaving Variable</h4>
          <p className="text-gray-700 mb-2">
            We perform the minimum ratio test to find which variable should leave the basis:
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 mb-3">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left">Row</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Basic Variable</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">RHS Value (b)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Coefficient (a)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Ratio (b/a)</th>
                </tr>
              </thead>
              <tbody>
                {ratios.map((item, idx) => (
                  <tr key={idx} className={item.row === leavingRow ? "bg-yellow-100" : ""}>  
                    <td className="border border-gray-300 px-3 py-2">{item.row}</td>
                    <td className="border border-gray-300 px-3 py-2">{getVarName(item.basicVar)}</td>
                    <td className="border border-gray-300 px-3 py-2">{matrix[item.row][rhsCol].toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2">{matrix[item.row][enteringCol].toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2">
                      {matrix[item.row][enteringCol] > 0 
                        ? (matrix[item.row][rhsCol] / matrix[item.row][enteringCol]).toFixed(2) 
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className="text-gray-700 mb-2">
            Variable <span className="font-semibold">{leavingVarName}</span> from row {leavingRow} was selected to leave the basis 
            because it has the minimum positive ratio ({ratios.find(r => r.row === leavingRow)?.ratio.toFixed(2)}).
          </p>
          
          <div className="mt-2 font-medium text-gray-700 bg-white p-2 rounded border border-gray-200">
            Pivot element: {matrix[pivotElement[0]][pivotElement[1]].toFixed(2)} 
            at position (row {pivotElement[0]}, column {pivotElement[1]})
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold mb-2 text-gray-800">3. Pivot Operation</h4>
          <p className="text-gray-700 mb-2">
            The tableau will be updated using these calculations:
          </p>
          
          <div className="bg-white p-3 rounded border border-gray-200 space-y-3">
            <div>
              <p className="font-semibold">Step 1: Normalize the pivot row (row {pivotElement[0]})</p>
              <p className="font-mono text-sm">New row {pivotElement[0]} = row {pivotElement[0]} ÷ {matrix[pivotElement[0]][pivotElement[1]].toFixed(2)}</p>
            </div>
            
            <div>
              <p className="font-semibold">Step 2: Update all other rows</p>
              {Array.from({length: numRows}).map((_, i) => {
                if (i === pivotElement[0]) return null;
                return (
                  <p key={i} className="font-mono text-sm">
                    New row {i} = row {i} - ({matrix[i][pivotElement[1]].toFixed(2)} × New row {pivotElement[0]})
                  </p>
                );
              })}
            </div>
          </div>
          
          <p className="mt-3 text-gray-700">
            After this operation, <span className="font-semibold">{enteringVarName}</span> will enter the basis, 
            <span className="font-semibold"> {leavingVarName}</span> will leave, 
            and the pivot column will have all zeros except a 1 in the pivot row.
          </p>
        </div>
      </div>
    </div>
  );
};

// Component for optimal solution explanation
const OptimalSolutionExplanation: React.FC<{ step: SimplexStep }> = ({ step }) => {
  const { matrix, basicVariables, nonBasicVariables, variableNames, objectiveValue, isMaximization } = step.tableau;
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  
  // Calculate solution values for display
  const solution = {};
  for (let i = 0; i < variableNames.length; i++) {
    const basicIndex = basicVariables.indexOf(i);
    if (basicIndex >= 0) {
      // This is a basic variable, get its value from the RHS
      solution[variableNames[i]] = matrix[basicIndex + 1][numCols - 1];
    } else {
      // Non-basic variable has value 0
      solution[variableNames[i]] = 0;
    }
  }
  
  // Format solution for display, filter out zero values if there are many variables
  let solutionItems = Object.entries(solution);
  const hasLotsOfVariables = solutionItems.length > 5;
  
  if (hasLotsOfVariables) {
    solutionItems = solutionItems.filter(([_, value]) => Math.abs(value) > 1e-10);
  }
  
  const formattedSolution = solutionItems.map(([varName, value]) => (
    `${varName} = ${value.toFixed(2)}`
  )).join(', ');
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-green-700">Optimal Solution Found!</h3>
      
      <p className="text-gray-700 leading-relaxed">
        The simplex algorithm has converged to an optimal solution. This is the best possible 
        solution for this linear programming problem.
      </p>
      
      <div className="bg-green-50 p-4 rounded-md border border-green-200">
        <h4 className="font-semibold mb-2 text-gray-800">Why This Solution is Optimal:</h4>
        
        <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm mb-3">
          <p className="mb-2"><strong>Current reduced costs (objective row):</strong></p>
          <div>
            {nonBasicVariables.map((colIdx, idx) => (
              <span key={idx} className={"inline-block mr-2 " + (matrix[0][colIdx] < -1e-10 ? "text-red-600" : "")}>
                {(matrix[0][colIdx] >= 0 ? "+" : "") + matrix[0][colIdx].toFixed(2)}{variableNames[colIdx] || `x${colIdx+1}`}
              </span>
            ))}
          </div>
        </div>
        
        <p className="mb-2 text-gray-700">
          <strong>Optimality condition:</strong> All coefficients in the objective row are {isMaximization ? "≥ 0" : "≤ 0"}.
          This means no variable can enter the basis and improve the objective value further.
        </p>
        
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>The solution is feasible (all constraints are satisfied)</li>
          <li>No entering variable can improve the objective function value</li>
          <li>We have reached a vertex of the feasible region that maximizes/minimizes the objective</li>
        </ul>
      </div>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold mb-2 text-gray-800">Optimal Solution Values:</h4>
          
          <div className="bg-white p-3 rounded border border-gray-200 font-mono mb-2">
            <p>{formattedSolution}</p>
          </div>
          
          <p className="text-gray-700 text-sm italic">
            {hasLotsOfVariables && "Note: Only showing non-zero variables"}
          </p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <h4 className="font-semibold mb-2 text-gray-800">Objective Value Calculation:</h4>
          
          <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm mb-2">
            <p className="mb-1"><strong>Objective function evaluated at the optimal solution:</strong></p>
            <p>
              {isMaximization ? "Max" : "Min"} z = {Object.entries(solution)
                .filter(([varName, value]) => Math.abs(value) > 1e-10)
                .map(([varName, value], idx) => {
                  const coef = step.tableau.variableNames.indexOf(varName) >= 0 ? 
                      (isMaximization ? 1 : -1) * matrix[0][step.tableau.variableNames.indexOf(varName)] : 0;
                  return `${idx > 0 ? " + " : ""}(${coef.toFixed(2)} × ${value.toFixed(2)})`;
                })
                .join("")}
              = {objectiveValue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="bg-green-100 px-6 py-3 rounded-md border border-green-300">
          <div className="font-semibold text-lg text-green-800">
            {isMaximization ? "Maximum" : "Minimum"} objective value: {objectiveValue.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for unbounded explanation
const UnboundedExplanation: React.FC<{ step: SimplexStep }> = ({ step }) => {
  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTitle>Problem is Unbounded</AlertTitle>
        <AlertDescription>
          The objective value can increase (or decrease) indefinitely without violating any constraints.
        </AlertDescription>
      </Alert>
      
      <div className="bg-red-50 p-4 rounded-md border border-red-200">
        <h4 className="font-semibold mb-2 text-gray-800">Why This Problem is Unbounded:</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>An entering variable was identified (column {step.enteringVariable})</li>
          <li>No valid leaving variable could be found (no positive coefficients in this column)</li>
          <li>This means the entering variable can be increased indefinitely</li>
        </ul>
      </div>
      
      <p className="text-gray-700 italic">
        An unbounded problem has no finite optimal solution. 
        The feasible region extends infinitely in the direction that improves the objective value.
      </p>
    </div>
  );
};

// Component for canonicalization step explanation
const CanonicalStepExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  // Parse all the details from the explanation
  const stepMatch = explanation.match(/Step (\d+)/);
  const stepNumber = stepMatch ? stepMatch[1] : '1';
  
  const artificialVarMatch = explanation.match(/Eliminating (a\d+) from/);
  const artificialVar = artificialVarMatch ? artificialVarMatch[1] : '';
  
  const coeffMatch = explanation.match(/Current objective coefficient for a\d+: ([-\d.]+)/);
  const currentCoeff = coeffMatch ? coeffMatch[1] : '';
  
  const constraintMatch = explanation.match(/a\d+ is basic in constraint (\d+)/);
  const constraintRow = constraintMatch ? constraintMatch[1] : '';
  
  const rowOperationMatch = explanation.match(/Row 0 = Row 0 - \(([-\d.]+)\) × Row (\d+)/);
  const coefficient = rowOperationMatch ? rowOperationMatch[1] : '';
  
  // Parse the row details
  const origRowMatch = explanation.match(/Original Row 0: \[([-\d., ]+)\]/);
  const origRow = origRowMatch ? origRowMatch[1].split(', ') : [];
  
  const rowNMatch = explanation.match(/Row \d+: \[([-\d., ]+)\]/g);
  const constraintRowData = rowNMatch && rowNMatch[1] ? rowNMatch[1].match(/\[([-\d., ]+)\]/)?.[1].split(', ') : [];
  
  const multRowMatch = explanation.match(/\([-\d.]+\) × Row \d+: \[([-\d., ]+)\]/);
  const multipliedRow = multRowMatch ? multRowMatch[1].split(', ') : [];
  
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Canonicalizing the Objective Row - Step {stepNumber}
        </h3>
        
        <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
          <h4 className="font-semibold text-lg text-gray-800 mb-3">
            Eliminating <span className="text-purple-600">{artificialVar}</span> from the objective row
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">Current objective coefficient for {artificialVar}:</p>
              <p className="text-2xl font-bold text-red-600">{currentCoeff}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">{artificialVar} is basic in:</p>
              <p className="text-2xl font-bold text-blue-600">Constraint {constraintRow}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <p className="text-sm text-gray-700 mb-2">To make the coefficient 0, we perform:</p>
            <p className="text-lg font-mono font-bold text-blue-700">
              Row 0 = Row 0 - ({coefficient}) × Row {constraintRow}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Row Operation Details:</h4>
          
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="text-sm font-semibold text-gray-600 pr-4 whitespace-nowrap">Original Row 0:</td>
                    <td className="font-mono text-sm">
                      <div className="flex flex-wrap gap-2">
                        {origRow.map((val, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 rounded">
                            {val}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-sm font-semibold text-gray-600 pr-4 whitespace-nowrap pt-2">Row {constraintRow}:</td>
                    <td className="font-mono text-sm pt-2">
                      <div className="flex flex-wrap gap-2">
                        {constraintRowData.map((val, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 rounded">
                            {val}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-sm font-semibold text-gray-600 pr-4 whitespace-nowrap pt-2">
                      ({coefficient}) × Row {constraintRow}:
                    </td>
                    <td className="font-mono text-sm pt-2">
                      <div className="flex flex-wrap gap-2">
                        {multipliedRow.map((val, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 rounded">
                            {val}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-md border border-green-200 mt-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Purpose:</span> This operation ensures that the basic variable {artificialVar} has 
            coefficient 0 in the objective row, maintaining the canonical form required for the simplex method.
          </p>
        </div>
      </div>
    </div>
  );
};

// Component for negation step explanation
const NegationStepExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Phase I - Final Preparation Step
        </h3>
        
        <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
          <h4 className="font-semibold text-lg text-gray-800 mb-3">
            Negating the Objective Row
          </h4>
          
          <div className="bg-indigo-50 p-4 rounded-md border border-indigo-200 mb-4">
            <p className="text-gray-700 mb-2">We perform one final operation:</p>
            <p className="text-lg font-mono font-bold text-indigo-700">
              Multiply the entire objective row by -1
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-semibold text-gray-600 mb-2">Before negation:</p>
              <p className="text-sm text-gray-700">Positive coefficients in objective row</p>
              <p className="text-xs text-gray-600 mt-1">Example: [2, 3, 1, 0, 0, 7]</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-semibold text-gray-600 mb-2">After negation:</p>
              <p className="text-sm text-gray-700">Negative coefficients in objective row</p>
              <p className="text-xs text-gray-600 mt-1">Example: [-2, -3, -1, 0, 0, -7]</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-2">Why This Step is Important:</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>The simplex algorithm selects the <strong>most negative</strong> coefficient as the entering variable</li>
            <li>For minimization, negative coefficients indicate variables that can decrease the objective</li>
            <li>This sign convention ensures the algorithm works correctly</li>
            <li>Without this step, the algorithm would move in the wrong direction</li>
          </ul>
        </div>
        
        <div className="bg-green-50 p-3 rounded-md border border-green-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Result:</span> The tableau is now fully prepared for Phase I simplex iterations. 
            We can begin the process of driving all artificial variables to zero.
          </p>
        </div>
      </div>
    </div>
  );
};

// Component for infeasible explanation
const InfeasibleExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  // Try to extract information about which artificial variables couldn't be driven to zero
  const artificialVarMatch = explanation.match(/artificial variables? (.+?) could not be/);
  const artificialVarInfo = artificialVarMatch ? artificialVarMatch[1] : 'some';
  
  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTitle>Problem is Infeasible</AlertTitle>
        <AlertDescription>
          There is no solution that satisfies all constraints simultaneously.
        </AlertDescription>
      </Alert>
      
      <div className="bg-red-50 p-4 rounded-md border border-red-200">
        <h4 className="font-semibold mb-2 text-gray-800">Why This Problem is Infeasible:</h4>
        <p className="mb-4 text-gray-700">
          Phase I of the simplex method has terminated, but the objective value is not zero.
          This means we were unable to drive all artificial variables to zero, which indicates that
          there is no solution that satisfies all the constraints.
        </p>
        
        <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm mb-4">
          <p className="mb-2"><strong>Phase I Objective Value &gt; 0</strong></p>
          <p>Even at the optimal solution for Phase I, some artificial variables remain positive.</p>
          <p>By construction, this means that some constraints cannot be satisfied simultaneously.</p>
        </div>
        
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>The constraints are mutually contradictory</li>
          <li>No combination of variable values can satisfy all constraints simultaneously</li>
          <li>The feasible region is empty (contains no points)</li>
        </ul>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
        <h4 className="font-semibold mb-2 text-gray-800">Mathematical Proof of Infeasibility:</h4>
        
        <p className="mb-3 text-gray-700">
          When a problem is infeasible, we can mathematically prove it through the Phase I solution:
        </p>
        
        <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm mb-3">
          <ol className="list-decimal list-inside space-y-2">
            <li>Our Phase I objective was to minimize the sum of artificial variables</li>
            <li>If this minimum value is greater than zero, then by definition some artificial variables must be positive</li>
            <li>Since artificial variables must equal zero for the original constraints to be satisfied, the problem is infeasible</li>
          </ol>
        </div>
        
        <p className="text-gray-700">
          This is a rigorous mathematical proof of infeasibility - not just a numerical approximation.
        </p>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <h4 className="font-semibold mb-2 text-gray-800">Identifying Conflicting Constraints:</h4>
        
        <p className="mb-3 text-gray-700">
          Look for these common patterns of infeasibility:
        </p>
        
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>Two constraints that form an empty region (e.g., x ≤ 5 and x ≥ 10)</li>
          <li>A system of equality constraints with no solution</li>
          <li>Constraints that create a bounded region, but with non-compatible bounds</li>
        </ol>
        
        <div className="mt-3 pt-3 border-t border-yellow-200">
          <h5 className="font-semibold mb-2 text-gray-800">Possible Solutions:</h5>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Review your constraints and check for errors or inconsistencies</li>
            <li>Relax some constraints if possible</li>
            <li>Reformulate the problem with fewer or modified constraints</li>
          </ul>
        </div>
      </div>
      
      <p className="text-gray-700 italic text-center">
        Since no feasible solution exists, the simplex method terminates.
      </p>
    </div>
  );
};

// Component for Phase One Introduction (before canonicalization)
const PhaseOneIntroductionExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  // Parse the artificial variable names from the marker
  const artificialVars = explanation.startsWith('PHASE_I_INTRO:') 
    ? explanation.substring(14).split(',')
    : ['a1', 'a2'];
  
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-indigo-700">Starting Phase I - The Two-Phase Method</h3>
      
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">What is Phase I?</h4>
        <p className="text-gray-700 leading-relaxed">
          Phase I is a preparatory phase that creates a feasible starting point for the simplex method. 
          Since we had to add artificial variables to form an initial basis, we need to ensure these 
          variables can be driven to zero (made non-basic).
        </p>
      </div>
      
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">The Phase I Objective</h4>
        <p className="text-gray-700 mb-4">
          Instead of optimizing the original objective, Phase I temporarily replaces it with:
        </p>
        
        <div className="bg-white p-4 rounded-md border-2 border-purple-300 text-center">
          <span className="text-xl font-semibold text-purple-700">
            Minimize w = {artificialVars.join(' + ')}
          </span>
        </div>
        
        <div className="mt-4 space-y-2">
          <p className="text-gray-700">This objective ensures that:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>Artificial variables are penalized (we want to minimize their sum)</li>
            <li>If w can be reduced to 0, we have a feasible solution to the original problem</li>
            <li>If w cannot reach 0, the original problem is infeasible</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Current Phase I Tableau</h4>
        <div className="space-y-3">
          <p className="text-gray-700">The tableau now shows:</p>
          <div className="bg-white p-4 rounded border border-gray-300 space-y-2">
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-32">Objective row:</span>
              <span className="font-mono text-sm">w - {artificialVars.join(' - ')} = 0</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-32">Basic variables:</span>
              <span className="font-mono text-sm">{artificialVars.join(', ')} (artificial variables)</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-32">Non-basic:</span>
              <span className="font-mono text-sm">All original and slack/surplus variables</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Next Steps</h4>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>
            <span className="font-semibold">Canonicalize the objective row</span> - 
            Make the coefficients of basic variables equal to 0
          </li>
          <li>
            <span className="font-semibold">Solve Phase I to optimality</span> - 
            Use the simplex method to minimize w
          </li>
          <li>
            <span className="font-semibold">Check feasibility</span> - 
            If w = 0 at optimality, the problem is feasible and we proceed to Phase II
          </li>
        </ol>
      </div>
    </div>
  );
};

// Component for Phase One Optimal Solution
const PhaseOneOptimalExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  // Extract w value from explanation
  const wMatch = explanation.match(/w = ([\d.-]+)/);
  const wValue = wMatch ? parseFloat(wMatch[1]) : 0;
  const isFeasible = Math.abs(wValue) < 1e-10;
  
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-indigo-700">Phase I Optimal Solution Found</h3>
      
      <div className={`p-6 rounded-lg border-2 ${isFeasible ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
        <h4 className="text-lg font-semibold mb-3 flex items-center">
          {isFeasible ? (
            <>
              <span className="text-green-700">✅ The problem is feasible!</span>
            </>
          ) : (
            <>
              <span className="text-red-700">❌ The problem is infeasible!</span>
            </>
          )}
        </h4>
        
        <div className="bg-white p-4 rounded border border-gray-300 mb-4">
          <p className="text-lg font-semibold text-center">
            Optimal value of w = {Math.abs(wValue) < 1e-10 ? '0' : wValue.toFixed(6)}
          </p>
        </div>
        
        {isFeasible ? (
          <div className="space-y-3">
            <p className="text-gray-700">
              All artificial variables have been successfully driven to zero. 
              This means we have found a feasible solution to the original problem.
            </p>
            
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h5 className="font-semibold text-gray-800 mb-2">Next Step: Transition to Phase II</h5>
              <p className="text-gray-700">We will now:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-700 ml-4">
                <li>Replace the Phase I objective with the original objective function</li>
                <li>Continue with the simplex method to find the optimal solution</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-700">
              The artificial variables could not be driven to zero. 
              This means the original constraints are contradictory and have no feasible solution.
            </p>
            <p className="text-gray-700">
              The simplex algorithm will terminate here as no feasible solution exists.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for Phase One explanation
const PhaseOneExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  // Extract artificial variable count from the explanation text
  const artificialVarMatch = explanation.match(/added (\d+) artificial variables/);
  const artificialVarCount = artificialVarMatch ? parseInt(artificialVarMatch[1]) : 'multiple';
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-blue-700">Phase I Introduction</h3>
      
      <p className="text-gray-700 leading-relaxed">
        Phase I of the Two-Phase Simplex Method is needed when the problem doesn't have an obvious initial feasible solution.
      </p>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold mb-2 text-gray-800">Why Phase I is Necessary</h4>
          <p className="text-gray-700">
            In standard simplex, we need to start with a basic feasible solution (a vertex of the feasible region). 
            However, for problems with certain types of constraints (equality constraints or ≥ constraints), 
            finding an initial feasible solution isn't straightforward.
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
          <h4 className="font-semibold mb-2 text-gray-800">Phase I Approach</h4>
          <p className="text-gray-700 mb-3">
            We've added artificial variables (a<sub>1</sub>, a<sub>2</sub>, etc.) to the constraints that need them.
            These artificial variables allow us to create an initial basic feasible solution by providing an identity column
            for each constraint that doesn't already have one.
          </p>
          
          <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm">
            <p className="mb-2"><strong>For equality constraints like:</strong> 
              <span className="ml-2">a<sub>1</sub>x<sub>1</sub> + a<sub>2</sub>x<sub>2</sub> + ... = b</span>
            </p>
            <p className="mb-2"><strong>We add an artificial variable:</strong> 
              <span className="ml-2">a<sub>1</sub>x<sub>1</sub> + a<sub>2</sub>x<sub>2</sub> + ... + a<sub>i</sub> = b</span>
            </p>
            <p><strong>For ≥ constraints:</strong> 
              <span className="ml-2">First convert to ≤ by multiplying by -1, then add a surplus and artificial variable</span>
            </p>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <h4 className="font-semibold mb-2 text-gray-800">Auxiliary Objective Function</h4>
          <p className="text-gray-700 mb-3">
            In Phase I, our goal is to minimize the sum of artificial variables:
          </p>
          
          <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm mb-3">
            <p><strong>Phase I objective:</strong> Minimize w = a<sub>1</sub> + a<sub>2</sub> + ... + a<sub>n</sub></p>
          </div>
          
          <p className="text-gray-700">
            If we can drive this sum to zero, we've found a feasible solution to the original problem.
            If we can't, the original problem is infeasible.
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold mb-2 text-gray-800">Initial Tableau Calculations</h4>
          <p className="text-gray-700 mb-3">
            To set up the Phase I tableau, we:
          </p>
          
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            <li>Add artificial variables to create an identity matrix for the basis</li>
            <li>Set up the Phase I objective row with coefficients for the artificial variables</li>
            <li>Use row operations to ensure the objective row has zeros in the columns of basic variables</li>
          </ol>
          
          <p className="mt-3 text-gray-700">
            Our initial basis consists of the artificial variables and any slack/surplus variables
            that already form identity columns in the constraint matrix.
          </p>
        </div>
      </div>
      
      <div className="font-medium text-gray-700 italic text-center">
        We'll now proceed with Phase I iterations to drive all artificial variables to zero if possible.
      </div>
    </div>
  );
};

// Component for Phase I to Phase II transition explanation
const PhaseTransitionExplanation: React.FC<{ explanation: string, step?: SimplexStep }> = ({ explanation, step }) => {
  // Check if this is the new detailed format
  if (explanation.startsWith('PHASE_II_TRANSITION_DETAILED:')) {
    const parts = explanation.split(':');
    const detailedExplanation = parts[1];
    
    return (
      <div className="space-y-6">
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: detailedExplanation.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </div>
      </div>
    );
  }
  
  // Legacy format handling
  let basicVarNames: string[] = [];
  let wasOriginallyMax = true;
  let standardFormCoeffs: number[] = [];
  
  if (explanation.startsWith('PHASE_II_TRANSITION:')) {
    const parts = explanation.split(':');
    if (parts.length >= 3) {
      basicVarNames = parts[2].split(',').filter(s => s);
    }
    if (parts.length >= 4) {
      wasOriginallyMax = parts[3] === 'max';
    }
    if (parts.length >= 5) {
      standardFormCoeffs = parts[4].split(',').map(s => parseFloat(s));
    }
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-green-700">Transition to Phase II</h3>
      
      <div className="bg-green-100 p-4 rounded-md border border-green-300">
        <div className="font-semibold mb-2 text-green-800 text-center">
          Success! Phase I has found a feasible solution.
        </div>
        <p className="text-gray-700 text-center">
          We've driven all artificial variables to zero, which means we've found a basic feasible solution
          that satisfies all the original constraints.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold mb-2 text-gray-800">What Happens Next</h4>
          <p className="text-gray-700">
            Now that we have a feasible solution, we can proceed with Phase II of the simplex method
            to solve the original problem using this feasible solution as our starting point.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold mb-2 text-gray-800">Replacing the Objective Function</h4>
          <p className="text-gray-700 mb-3">
            We now replace the Phase I objective with the standard form objective function:
          </p>
          
          <div className="bg-white p-3 rounded border border-gray-300 mb-4">
            <p className="text-sm text-gray-600 mb-1">Standard form objective:</p>
            <p className="font-mono font-semibold text-lg">
              Minimize: 
              {standardFormCoeffs.length > 0 ? (
                standardFormCoeffs.map((coeff, i) => (
                  <span key={i}>
                    {i > 0 && coeff >= 0 && ' + '}
                    {coeff}x<sub>{i + 1}</sub>
                  </span>
                ))
              ) : (
                'z = c₁x₁ + c₂x₂ + ...'
              )}
            </p>
          </div>
          
          {wasOriginallyMax && (
            <div className="bg-gray-100 p-3 rounded border border-gray-300 mb-4 text-sm">
              <p className="text-gray-600">
                <strong>Note:</strong> The original problem was maximization, but in standard form 
                all problems are minimization. The coefficients have been negated accordingly.
              </p>
            </div>
          )}
          
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <h5 className="font-semibold text-gray-800 mb-2">⚠️ Important: Canonicalization Required</h5>
            <p className="text-gray-700 mb-2">
              The objective row must be canonicalized with respect to the current basic variables.
              This means the coefficients of basic variables must be zero in the objective row.
            </p>
            
            {basicVarNames.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-700">Current basic variables:</p>
                <p className="font-mono text-sm bg-white p-2 rounded border border-gray-300 mt-1">
                  {basicVarNames.join(', ')}
                </p>
              </div>
            )}
            
            <p className="text-gray-700 mt-3">
              After canonicalization, the objective row coefficients will change to maintain 
              the proper simplex tableau form. This is why the displayed coefficients differ 
              from the original objective function.
            </p>
            
            <div className="bg-white p-3 rounded border border-gray-300 mt-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">Example:</p>
              <p className="text-sm font-mono">
                If x₃ is basic in row 1 with coefficient -80 in the objective:<br/>
                New coefficient = -80 - (-80) × 1 = 0
              </p>
              <p className="text-sm text-gray-600 mt-2">
                This process ensures the basic variable has coefficient 0.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <h4 className="font-semibold mb-2 text-gray-800">Phase II Begins</h4>
          <p className="text-gray-700">
            The simplex method will now optimize the original objective while maintaining feasibility.
            Artificial variables remain in the tableau but will be driven out of the basis
            as we find better solutions.
          </p>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-md border border-indigo-200">
          <h4 className="font-semibold mb-2 text-gray-800">Understanding the Tableau Display</h4>
          <p className="text-gray-700">
            The objective row in the tableau shows the <span className="font-semibold">canonicalized</span> form, 
            not the original coefficients. This is necessary for the simplex method to work correctly.
            The actual objective value being optimized is still based on your original objective function.
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="bg-green-100 px-6 py-3 rounded-md border border-green-300 text-center">
          <div className="font-medium text-gray-700">
            Ready to start Phase II with a feasible basis
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for Phase II Non-Canonical explanation
const PhaseIINonCanonicalExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  return (
    <div className="space-y-6">
      <div className="prose prose-sm max-w-none">
        <div 
          dangerouslySetInnerHTML={{ 
            __html: explanation
              .replace(/\n/g, '<br/>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/### (.*?)<br\/>/g, '<h3 class="text-xl font-semibold text-blue-700 mb-4">$1</h3>')
              .replace(/#### (.*?)<br\/>/g, '<h4 class="text-lg font-semibold text-gray-800 mb-3">$1</h4>')
              .replace(/⚠️/g, '<span class="text-yellow-500">⚠️</span>')
          }} 
        />
      </div>
    </div>
  );
};

// Component for Phase II Canonical explanation
const PhaseIICanonicalExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  // Check if this is a step-by-step canonicalization
  const isStepByStep = explanation.includes('Phase II Canonicalization - Step');
  
  return (
    <div className="space-y-6">
      <div className={`${isStepByStep ? 'bg-gradient-to-r from-blue-50 to-green-50' : ''} p-6 rounded-lg ${isStepByStep ? 'border border-blue-200 shadow-sm' : ''}`}>
        <div className="prose prose-sm max-w-none">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: explanation
                .replace(/\n/g, '<br/>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/### (.*?)<br\/>/g, '<h3 class="text-xl font-semibold text-green-700 mb-4">$1</h3>')
                .replace(/#### (.*?)<br\/>/g, '<h4 class="text-lg font-semibold text-gray-800 mb-3">$1</h4>')
                .replace(/✅/g, '<span class="text-green-500">✅</span>')
                .replace(/Row 0/g, 'Row 0')
                .replace(/Row (\d+)/g, 'Row $1')
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default StepExplanation;
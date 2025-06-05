import React from 'react';
import type { SimplexStep } from '@/components/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface TableauVisualizerProps {
  step: SimplexStep;
  showDetails?: boolean;
}

const TableauVisualizer: React.FC<TableauVisualizerProps> = ({ step, showDetails = true }) => {
  const { tableau, enteringVariable, leavingVariable, pivotElement } = step;
  const { matrix, basicVariables, variableNames } = tableau;
  
  // Num of rows and cols in the matrix
  const rows = matrix.length;
  const cols = matrix[0].length;
  
  // Helper function to determine cell highlighting
  const getCellClassName = (i: number, j: number) => {
    // Highlight the pivot element
    if (pivotElement && pivotElement[0] === i && pivotElement[1] === j) {
      return 'bg-amber-200 font-bold';
    }
    
    // Highlight the entering variable column
    if (enteringVariable !== null && j === enteringVariable) {
      return 'bg-green-100';
    } 
    
    // Highlight the leaving variable row
    if (leavingVariable !== null && i === leavingVariable) {
      return 'bg-red-50';
    } 
    
    // Highlight objective row
    if (i === 0) {
      return 'bg-blue-50';
    } 
    
    // Highlight RHS column
    if (j === cols - 1) {
      return 'bg-gray-50 font-semibold';
    }
    
    // Highlight artificial variable columns (for Phase I)
    if (tableau.phase === 'phase1' && tableau.artificialVariableIndices.includes(j)) {
      return 'bg-purple-50';
    }
    
    return '';
  };
  
  // Get the variable name for the basic variable column
  const getBasicVariableName = (rowIndex: number) => {
    if (rowIndex === 0) {
      // For Phase I, the objective function is w (minimize artificial variables)
      // For Phase II, it's z (the original objective)
      return tableau.phase === 'phase1' ? 'w' : 'z';
    }
    
    const varIndex = basicVariables[rowIndex - 1];
    
    // Check if this is an artificial variable (for Phase I)
    if (tableau.phase === 'phase1' && tableau.artificialVariableIndices.includes(varIndex)) {
      const artificalIndex = tableau.artificialVariableIndices.indexOf(varIndex);
      return tableau.artificialVariableNames[artificalIndex];
    }
    
    // The variableNames array should contain all variables
    if (varIndex < variableNames.length) {
      return variableNames[varIndex];
    } 
    
    // This should not happen if the tableau is set up correctly
    console.warn(`Basic variable index ${varIndex} is out of bounds for variableNames array of length ${variableNames.length}`);
    return `var${varIndex}`;
  };
  
  // Get column header name
  const getColumnHeaderName = (colIndex: number) => {
    // Check if we're at the RHS column
    if (colIndex === cols - 1) {
      return 'LD';
    }
    
    // Check if this is an artificial variable (for Phase I)
    if (tableau.phase === 'phase1' && tableau.artificialVariableIndices.includes(colIndex)) {
      const artificalIndex = tableau.artificialVariableIndices.indexOf(colIndex);
      return tableau.artificialVariableNames[artificalIndex];
    }
    
    // The variableNames array should now contain all variables including slack
    if (colIndex < variableNames.length) {
      return variableNames[colIndex];
    } else {
      // This should not happen if the tableau is set up correctly
      console.warn(`Column index ${colIndex} is out of bounds for variableNames array of length ${variableNames.length}`);
      return `var${colIndex}`;
    }
  };
  
  return (
    <div className="overflow-auto">
      {/* Phase indicator - only show if we're actually in Phase I */}
      {tableau.phase === 'phase1' && (
        <div className="mb-2 flex justify-end">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Fase I
          </span>
        </div>
      )}
      
      <Table className="border-collapse w-full min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead className="text-center border bg-gray-100 font-bold">Básica</TableHead>
            {Array.from({ length: cols }, (_, j) => (
              <TableHead 
                key={`header-${j}`}
                className={cn(
                  "text-center border bg-gray-100 font-bold",
                  enteringVariable === j && "bg-green-200"
                )}
              >
                {j < cols - 1 ? getColumnHeaderName(j) : 'LD'}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {matrix.map((row, i) => (
            <TableRow 
              key={`row-${i}`}
              className={cn(leavingVariable === i && "bg-red-100")}
            >
              {/* Basic variable name */}
              <TableCell className="border text-center font-semibold bg-gray-50">
                {getBasicVariableName(i)}
              </TableCell>
              
              {/* Matrix values - ensure we only render cells up to the expected number */}
              {Array.from({ length: cols }, (_, j) => {
                // In case a row is improperly sized (for debugging), handle it gracefully
                const value = j < row.length ? row[j] : 0;
                return (
                  <TableCell
                    key={`cell-${i}-${j}`}
                    className={cn(
                      "border text-right py-3 px-4",
                      getCellClassName(i, j)
                    )}
                  >
                    {value.toFixed(2)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {showDetails && (step.status === 'optimal' || step.status === 'phase1_start' || step.status === 'phase2_start' || step.status === 'infeasible') && (
        <div className="mt-4 p-4 bg-gray-50 border rounded-md">
          <h4 className="text-lg font-medium mb-2">
            {step.status === 'optimal' ? 'Solução Ótima' : 
             step.status === 'infeasible' ? 'Problema Inviável' : 
             step.status === 'phase1_start' ? 'Tableau Inicial da Fase I' : 
             'Tableau Inicial da Fase II'}
          </h4>
          <div className="text-sm">
            <p className="font-medium mb-2">
              {step.status === 'phase1_start' ? 
                'Objetivo da Fase I (minimizar soma das variáveis artificiais):' :
                'Valor objetivo:'} <span className={step.status === 'infeasible' ? 'text-red-600' : 'text-emerald-600'}>{tableau.objectiveValue.toFixed(2)}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {/* Display all variables with their values */}
              {variableNames.map((varName, i) => {
                const basicIndex = basicVariables.indexOf(i);
                const value = basicIndex >= 0 ? matrix[basicIndex + 1][cols - 1] : 0;
                
                // Determine the styling based on variable type
                let className = "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ";
                
                if (tableau.phase === 'phase1' && tableau.artificialVariableIndices.includes(i)) {
                  // Artificial variable
                  if (Math.abs(value) > 1e-10) {
                    className += "bg-purple-100 text-purple-800";
                  } else {
                    return null; // Don't show zero artificial variables
                  }
                } else if (varName.startsWith('s')) {
                  // Slack/surplus variable
                  className += "bg-blue-100 text-blue-800";
                } else {
                  // Original variable
                  className += "bg-gray-100";
                }
                
                return (
                  <span 
                    key={`var-value-${i}`}
                    className={className}
                  >
                    {varName} = {value.toFixed(2)}
                  </span>
                );
              })}
            </div>
            
            {step.status === 'infeasible' && (
              <p className="mt-4 text-red-600 font-medium">
                Problema é inviável: As variáveis artificiais não podem ser levadas a zero.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableauVisualizer;
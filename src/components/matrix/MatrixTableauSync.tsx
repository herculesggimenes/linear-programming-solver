import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, ArrowRight, X, GripVertical } from 'lucide-react';
import type { SimplexTableau, LinearProgram, SimplexStep } from '@/components/types';
import { 
  extractMatrixForm, 
  extractBasisMatrices,
  formatMatrix,
  invertMatrix,
  checkBasicFeasibility
} from '@/lib/matrix-operations';
import { solveWithSteps } from '@/lib/simplex-solver';
import { convertToStandardFormWithExplanation } from '@/lib/standard-form-conversion';
import StepController from '@/components/StepController';
import BasisInverseCalculator from './BasisInverseCalculator';
import GenericTableauDisplay from './GenericTableauDisplay';
import MatrixFormConverter from './MatrixFormConverter';
import MatrixCalculationSteps from './MatrixCalculationSteps';

interface MatrixTableauSyncProps {
  tableau: SimplexTableau;
  problem: LinearProgram;
  showGenericTableau?: boolean;
  showMatrixForm?: boolean;
}

const MatrixTableauSync: React.FC<MatrixTableauSyncProps> = ({ 
  tableau, 
  problem,
  showGenericTableau = false,
  showMatrixForm = false
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [orderedBasis, setOrderedBasis] = useState<number[]>(tableau.basicVariables);
  const [showCalculationSteps, setShowCalculationSteps] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Simplex step navigation state
  const [steps, setSteps] = useState<SimplexStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Solve the problem and generate steps
  useEffect(() => {
    const solve = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Convert to standard form
        const { standardLP } = convertToStandardFormWithExplanation(problem);
        
        // Solve with steps - it returns an array of steps directly
        const calculatedSteps = solveWithSteps(standardLP, true);
        
        if (calculatedSteps && calculatedSteps.length > 0) {
          setSteps(calculatedSteps);
          setCurrentStepIndex(0);
          // Initialize basis with the first step's basis
          if (calculatedSteps[0].tableau) {
            setOrderedBasis(calculatedSteps[0].tableau.basicVariables);
          }
        } else {
          setError('Não foi possível gerar os passos do simplex');
        }
      } catch (err) {
        setError('Erro ao resolver o problema: ' + (err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };
    
    solve();
  }, [problem]);
  
  // Get current step's tableau or use the provided tableau as fallback
  const currentTableau = steps[currentStepIndex]?.tableau || tableau;
  
  // Extract matrix form from the original problem
  const { A, b, c } = extractMatrixForm(problem);
  
  // Get available variables (not in basis)
  const availableVariables = Array.from({ length: A[0].length }, (_, i) => i)
    .filter(i => !orderedBasis.includes(i));
  
  // Extract basis matrices using the ordered basis
  const nonBasicIndices = Array.from({ length: A[0].length }, (_, i) => i)
    .filter(i => !orderedBasis.includes(i));
  const { B, N } = extractBasisMatrices(A, orderedBasis, nonBasicIndices);
  
  // Check if we have a valid basis (square matrix)
  const hasValidBasis = B.length > 0 && B.length === B[0].length && B.length === A.length;
  
  // Calculate basis inverse only if basis is valid
  const B_inv = hasValidBasis ? invertMatrix(B) : null;
  
  // Check feasibility
  const { feasible, solution } = B_inv 
    ? checkBasicFeasibility(B, b)
    : { feasible: false, solution: null };

  // Helper to get color based on hover state
  const getCellColor = (row: number, col: number) => {
    if (hoveredCell && hoveredCell.row === row && hoveredCell.col === col) {
      return 'bg-blue-200';
    }
    if (hoveredCell) {
      // Check if this cell is in a basic column
      if (row > 0 && orderedBasis.includes(col)) {
        if (hoveredCell.col === col || 
            (hoveredCell.row === 0 && col < tableau.matrix[0].length - 1)) {
          return 'bg-blue-100';
        }
      }
    }
    return '';
  };

  // Helper to check if a column is basic
  const isBasicColumn = (col: number) => orderedBasis.includes(col);
  
  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null) return;
    
    const newBasis = [...orderedBasis];
    const [removed] = newBasis.splice(draggedIndex, 1);
    newBasis.splice(dropIndex, 0, removed);
    setOrderedBasis(newBasis);
    setDraggedIndex(null);
  };
  
  const addToBasis = (varIndex: number) => {
    if (orderedBasis.length < A.length) {
      setOrderedBasis([...orderedBasis, varIndex]);
    }
  };
  
  const removeFromBasis = (index: number) => {
    setOrderedBasis(orderedBasis.filter((_, i) => i !== index));
  };
  
  // Step navigation handlers
  const handleStepChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < steps.length) {
      setCurrentStepIndex(newIndex);
      // Update basis to match the current step
      if (steps[newIndex].tableau) {
        setOrderedBasis(steps[newIndex].tableau.basicVariables);
      }
    }
  };
  
  const handlePreviousStep = () => handleStepChange(currentStepIndex - 1);
  const handleNextStep = () => handleStepChange(currentStepIndex + 1);
  const handleFirstStep = () => handleStepChange(0);
  const handleLastStep = () => handleStepChange(steps.length - 1);

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Operações Matriciais no Simplex</h2>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-gray-600">Resolvendo o problema...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Operações Matriciais no Simplex</h2>
        <Card className="border-red-200">
          <CardContent className="p-8">
            <div className="text-center text-red-600">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Operações Matriciais no Simplex</h2>
      
      {/* Generic Tableau Display */}
      {showGenericTableau && <GenericTableauDisplay />}
      
      {/* Matrix Form Converter */}
      {showMatrixForm && (
        <div className="mb-6">
          <MatrixFormConverter problem={problem} />
        </div>
      )}
      
      {/* Step Controller */}
      {steps.length > 0 && (
        <>
          <StepController
            currentStep={currentStepIndex}
            totalSteps={steps.length}
            onStepChange={handleStepChange}
          />
          
          {/* Step Information */}
          <Card className="mb-4">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {steps[currentStepIndex]?.phase === 1 ? 'Fase I' : 'Fase II'} - 
                    {' '}{steps[currentStepIndex]?.status === 'initial' && 'Tableau Inicial'}
                    {steps[currentStepIndex]?.status === 'iteration' && `Iteração ${steps[currentStepIndex]?.iterationCount || ''}`}
                    {steps[currentStepIndex]?.status === 'optimal' && 'Solução Ótima'}
                    {steps[currentStepIndex]?.status === 'unbounded' && 'Problema Ilimitado'}
                    {steps[currentStepIndex]?.status === 'phase_one_complete' && 'Fase I Completa'}
                  </p>
                  {steps[currentStepIndex]?.enteringVariable !== undefined && (
                    <p className="text-xs text-gray-600 mt-1">
                      Variável entrante: {currentTableau.variableNames[steps[currentStepIndex].enteringVariable!]} | 
                      Variável sainte: {steps[currentStepIndex].leavingVariable !== undefined ? 
                        currentTableau.variableNames[currentTableau.basicVariables[steps[currentStepIndex].leavingVariable! - 1]] : 
                        'N/A'}
                    </p>
                  )}
                </div>
                <Badge variant={steps[currentStepIndex]?.status === 'optimal' ? 'default' : 'secondary'}>
                  Passo {currentStepIndex + 1} de {steps.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </>
      )}
      
      {/* Basis Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Seleção de Base</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Step navigation info */}
            {steps.length > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>Modo de Navegação:</strong> A base é atualizada automaticamente conforme você navega pelos passos do Simplex.
                  A edição manual está desabilitada durante a navegação.
                </p>
              </div>
            )}
            
            {/* Current Basis */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Base Atual:</h4>
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg min-h-[60px]">
                {orderedBasis.length === 0 ? (
                  <p className="text-sm text-gray-500">Arraste variáveis aqui para formar a base</p>
                ) : (
                  orderedBasis.map((varIdx, index) => (
                    <div
                      key={varIdx}
                      draggable={steps.length === 0}
                      onDragStart={() => steps.length === 0 && handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => steps.length === 0 && handleDrop(index)}
                      className={`flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded transition-colors ${
                        steps.length === 0 ? 'cursor-move hover:bg-blue-700' : 'cursor-default'
                      }`}
                    >
                      {steps.length === 0 && <GripVertical className="h-3 w-3" />}
                      <span className="font-mono text-sm">{currentTableau.variableNames[varIdx]}</span>
                      {steps.length === 0 && (
                        <button
                          onClick={() => removeFromBasis(index)}
                          className="ml-1 hover:text-red-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
              {orderedBasis.length > 0 && orderedBasis.length !== A.length && (
                <p className="text-xs text-yellow-600 mt-1">
                  Selecione {A.length - orderedBasis.length} variável(eis) adicional(is) para completar a base
                </p>
              )}
            </div>
            
            {/* Available Variables */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Variáveis Disponíveis:</h4>
              <div className="flex flex-wrap gap-2">
                {availableVariables.map(varIdx => (
                  <button
                    key={varIdx}
                    onClick={() => steps.length === 0 && addToBasis(varIdx)}
                    className={`px-3 py-1 rounded font-mono text-sm transition-colors ${
                      steps.length > 0 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    disabled={orderedBasis.length >= A.length || steps.length > 0}
                  >
                    {currentTableau.variableNames[varIdx]}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Instructions */}
            <div className="text-xs text-gray-600 space-y-1 border-t pt-3">
              <p>• Clique nas variáveis disponíveis para adicioná-las à base</p>
              <p>• Arraste as variáveis na base para reordenar (a ordem define as colunas de B)</p>
              <p>• Clique no × para remover uma variável da base</p>
              <p>• A matriz B será formada pelas colunas na ordem mostrada</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tableau View */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Visão Tableau
              <Badge variant="secondary">Passe o mouse para destacar</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="px-3 py-2 text-left font-semibold">VB</th>
                    {currentTableau.variableNames.map((name, idx) => (
                      <th 
                        key={idx} 
                        className={`px-3 py-2 text-center font-semibold
                          ${isBasicColumn(idx) ? 'text-blue-600' : ''}`}
                      >
                        {name}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center font-semibold">RHS</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTableau.matrix.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-gray-200">
                      <td className="px-3 py-2 font-semibold">
                        {rowIdx === 0 ? 'z' : currentTableau.variableNames[currentTableau.basicVariables[rowIdx - 1]]}
                      </td>
                      {row.slice(0, -1).map((val, colIdx) => (
                        <td 
                          key={colIdx}
                          className={`px-3 py-2 text-center cursor-pointer transition-colors
                            ${getCellColor(rowIdx, colIdx)}`}
                          onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {val.toFixed(2)}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-center font-semibold">
                        {row[row.length - 1].toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Matrix View */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Visão Matricial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Original matrices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm mb-2">Matriz A (Original)</h4>
                <div className="font-mono text-xs bg-gray-50 p-2 rounded">
                  <div className="inline-block border-l-2 border-r-2 border-gray-400 px-2">
                    {formatMatrix(A).map((row, i) => (
                      <div key={i} className="flex gap-2">
                        {row.map((val, j) => (
                          <span 
                            key={j} 
                            className={`w-8 text-right ${
                              isBasicColumn(j) ? 'text-blue-600 font-semibold' : ''
                            }`}
                          >
                            {val}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Vetores</h4>
                  <div className="font-mono text-xs space-y-1">
                    <div>
                      b = [{b.map(val => val.toFixed(1)).join(', ')}]<sup>T</sup>
                    </div>
                    <div>
                      c = [{c.map(val => val.toFixed(1)).join(', ')}]<sup>T</sup>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basis decomposition */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-sm mb-2">Decomposição da Base</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-medium mb-1 text-blue-600">
                    B = Colunas Básicas ({orderedBasis.map(i => currentTableau.variableNames[i]).join(', ')})
                  </h5>
                  <div className="font-mono text-xs bg-blue-50 p-2 rounded">
                    <div className="inline-block border-l-2 border-r-2 border-blue-400 px-2">
                      {formatMatrix(B).map((row, i) => (
                        <div key={i} className="flex gap-2">
                          {row.map((val, j) => (
                            <span key={j} className="w-8 text-right">{val}</span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium mb-1 text-gray-600">
                    N = Colunas Não-Básicas
                  </h5>
                  <div className="font-mono text-xs bg-gray-50 p-2 rounded">
                    <div className="inline-block border-l-2 border-r-2 border-gray-400 px-2">
                      {formatMatrix(N).map((row, i) => (
                        <div key={i} className="flex gap-2">
                          {row.map((val, j) => (
                            <span key={j} className="w-8 text-right">{val}</span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basis inverse and solution */}
            {!hasValidBasis && orderedBasis.length > 0 && (
              <div className="border-t pt-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Atenção:</strong> Selecione exatamente {A.length} variáveis para formar uma base válida. 
                    Atualmente {orderedBasis.length} variável(eis) selecionada(s).
                  </p>
                </div>
              </div>
            )}
            {B_inv && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Inversa da Base e Solução</h4>
                  <Button
                    onClick={() => setShowCalculationSteps(!showCalculationSteps)}
                    variant="outline"
                    size="sm"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    {showCalculationSteps ? 'Ocultar Cálculos' : 'Ver Cálculos Detalhados'}
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs font-medium mb-1">B<sup>-1</sup></h5>
                    <div className="font-mono text-xs bg-gray-50 p-2 rounded">
                      <div className="inline-block border-l-2 border-r-2 border-gray-400 px-2">
                        {formatMatrix(B_inv).map((row, i) => (
                          <div key={i} className="flex gap-2">
                            {row.map((val, j) => (
                              <span key={j} className="w-8 text-right">{val}</span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium mb-1">
                      x<sub>B</sub> = B<sup>-1</sup>b
                    </h5>
                    {solution && (
                      <div className="font-mono text-xs space-y-1">
                        {orderedBasis.map((varIdx, i) => (
                          <div key={i} className={solution[i] < 0 ? 'text-red-600' : ''}>
                            {currentTableau.variableNames[varIdx]} = {solution[i].toFixed(2)}
                          </div>
                        ))}
                        <div className="mt-2">
                          <Badge variant={feasible ? "default" : "destructive"}>
                            {feasible ? "Solução Factível" : "Solução Infactível"}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>Interatividade:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Use o seletor de base acima para escolher e ordenar as variáveis básicas</li>
              <li>A ordem das variáveis no seletor define a ordem das colunas na matriz B</li>
              <li>Arraste as variáveis para reordenar a base - isso afeta os cálculos!</li>
              <li>Passe o mouse sobre as células do tableau para destacar as variáveis básicas</li>
              <li>Observe como B<sup>-1</sup> e a solução mudam com diferentes bases e ordens</li>
              <li>Veja se a solução básica atual é factível (todos os valores ≥ 0)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Matrix Calculation Steps */}
      {showCalculationSteps && B_inv && hasValidBasis && (
        <MatrixCalculationSteps
          B={B}
          N={N}
          B_inv={B_inv}
          b={b}
          c_B={orderedBasis.map(idx => c[idx])}
          c_N={nonBasicIndices.map(idx => c[idx])}
          basicIndices={orderedBasis}
          nonBasicIndices={nonBasicIndices}
          variableNames={currentTableau.variableNames}
          basisMatrix={B}
          basisVariableNames={orderedBasis.map(idx => currentTableau.variableNames[idx])}
        />
      )}
    </div>
  );
};

export default MatrixTableauSync;
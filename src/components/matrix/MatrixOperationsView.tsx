import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, ChevronDown, ChevronUp, X, GripVertical } from 'lucide-react';
import type { SimplexTableau, LinearProgram } from '@/components/types';
import { 
  extractMatrixForm, 
  extractBasisMatrices,
  formatMatrix,
  invertMatrix,
  checkBasicFeasibility
} from '@/lib/matrix-operations';
import GenericTableauDisplay from './GenericTableauDisplay';
import MatrixCalculationSteps from './MatrixCalculationSteps';

interface MatrixOperationsViewProps {
  tableau: SimplexTableau;
  problem: LinearProgram;
}

const MatrixOperationsView: React.FC<MatrixOperationsViewProps> = ({ tableau, problem }) => {
  const [showCalculationSteps, setShowCalculationSteps] = useState(false);
  const [orderedBasis, setOrderedBasis] = useState<number[]>(tableau.basicVariables);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [manualBasisMode, setManualBasisMode] = useState(false);
  
  // Update basis when tableau changes (when navigating steps)
  useEffect(() => {
    if (!manualBasisMode) {
      setOrderedBasis(tableau.basicVariables);
    }
  }, [tableau.basicVariables, manualBasisMode]);
  
  // Extract matrix form from the original problem
  const { A, b, c } = extractMatrixForm(problem);
  
  // Get available variables (not in basis)
  const availableVariables = Array.from({ length: A[0].length }, (_, i) => i)
    .filter(i => !orderedBasis.includes(i));
  
  // Get non-basic indices
  const nonBasicIndices = Array.from({ length: A[0].length }, (_, i) => i)
    .filter(i => !orderedBasis.includes(i));
  
  // Extract basis matrices
  const { B, N } = extractBasisMatrices(A, orderedBasis, nonBasicIndices);
  
  // Check if we have a valid basis (square matrix)
  const hasValidBasis = B.length > 0 && B.length === B[0].length && B.length === A.length;
  
  // Calculate basis inverse only if basis is valid
  const B_inv = hasValidBasis ? invertMatrix(B) : null;
  
  // Check feasibility
  const { feasible, solution } = B_inv 
    ? checkBasicFeasibility(B, b)
    : { feasible: false, solution: null };
  
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
      setManualBasisMode(true);
    }
  };
  
  const removeFromBasis = (index: number) => {
    setOrderedBasis(orderedBasis.filter((_, i) => i !== index));
    setManualBasisMode(true);
  };

  return (
    <div className="space-y-4">
      {/* Introduction */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">O que são as Operações Matriciais?</h3>
        <p className="text-xs text-gray-700 space-y-1">
          O método Simplex pode ser visto como uma sequência de operações matriciais. 
          Em cada iteração, trabalhamos com:
        </p>
        <ul className="text-xs text-gray-700 mt-2 ml-4 list-disc space-y-1">
          <li><strong>Matriz Base (B)</strong>: Colunas correspondentes às variáveis básicas</li>
          <li><strong>Matriz Não-Base (N)</strong>: Colunas das variáveis não-básicas</li>
          <li><strong>Inversa da Base (B⁻¹)</strong>: Usada para calcular a solução e custos reduzidos</li>
          <li><strong>Solução Básica</strong>: x<sub>B</sub> = B⁻¹b</li>
        </ul>
        <p className="text-xs text-gray-700 mt-2">
          Compreender essas operações ajuda a entender a matemática por trás do algoritmo Simplex.
        </p>
      </div>
      
      {/* Basis Selector */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Seletor de Base</CardTitle>
            {manualBasisMode && (
              <Button
                onClick={() => {
                  setManualBasisMode(false);
                  setOrderedBasis(tableau.basicVariables);
                }}
                variant="outline"
                size="sm"
              >
                Resetar para Base Atual
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Current Basis */}
            <div>
              <h4 className="text-xs font-semibold mb-2">Base Atual (Ordem Importa!):</h4>
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded min-h-[40px]">
                {orderedBasis.length === 0 ? (
                  <p className="text-xs text-gray-500">Selecione variáveis para formar a base</p>
                ) : (
                  orderedBasis.map((varIdx, index) => (
                    <div
                      key={varIdx}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs cursor-move hover:bg-blue-700 transition-colors"
                    >
                      <GripVertical className="h-3 w-3" />
                      <span className="font-mono">{tableau.variableNames[varIdx]}</span>
                      <button
                        onClick={() => removeFromBasis(index)}
                        className="ml-1 hover:text-red-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
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
              <h4 className="text-xs font-semibold mb-2">Variáveis Disponíveis:</h4>
              <div className="flex flex-wrap gap-1">
                {availableVariables.map(varIdx => (
                  <button
                    key={varIdx}
                    onClick={() => addToBasis(varIdx)}
                    className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded font-mono text-xs transition-colors"
                    disabled={orderedBasis.length >= A.length}
                  >
                    {tableau.variableNames[varIdx]}
                  </button>
                ))}
              </div>
            </div>
            
            {!hasValidBasis && orderedBasis.length > 0 && (
              <div className="p-2 bg-yellow-100 rounded">
                <p className="text-xs text-yellow-800">
                  <strong>Atenção:</strong> Selecione exatamente {A.length} variáveis para formar uma base válida.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Generic Tableau Display */}
      <GenericTableauDisplay />
      
      {/* Matrix Decomposition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Matrix B */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Matriz Base B = [{orderedBasis.map(i => tableau.variableNames[i]).join(', ')}]
            </CardTitle>
          </CardHeader>
          <CardContent>
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
            {B_inv && (
              <div className="mt-3">
                <p className="text-xs font-semibold mb-1">B<sup>-1</sup> (Inversa):</p>
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
            )}
          </CardContent>
        </Card>
        
        {/* Non-Basic Matrix N */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Matriz Não-Base N = [{nonBasicIndices.map(i => tableau.variableNames[i]).join(', ')}]
            </CardTitle>
          </CardHeader>
          <CardContent>
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
            {solution && (
              <div className="mt-3">
                <p className="text-xs font-semibold mb-1">Solução Básica:</p>
                <div className="font-mono text-xs space-y-1">
                  {orderedBasis.map((varIdx, i) => (
                    <div key={i} className={solution[i] < 0 ? 'text-red-600' : ''}>
                      {tableau.variableNames[varIdx]} = {solution[i].toFixed(2)}
                    </div>
                  ))}
                  <Badge variant={feasible ? "default" : "destructive"} className="mt-2">
                    {feasible ? "Factível" : "Infactível"}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Calculation Steps Button */}
      {B_inv && (
        <div className="flex justify-center">
          <Button
            onClick={() => setShowCalculationSteps(!showCalculationSteps)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Calculator className="w-4 h-4" />
            {showCalculationSteps ? 'Ocultar' : 'Ver'} Cálculos Detalhados
            {showCalculationSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      )}
      
      {/* Detailed Calculations */}
      {showCalculationSteps && B_inv && (
        <MatrixCalculationSteps
          B={B}
          N={N}
          B_inv={B_inv}
          b={b}
          c_B={orderedBasis.map(idx => c[idx])}
          c_N={nonBasicIndices.map(idx => c[idx])}
          basicIndices={orderedBasis}
          nonBasicIndices={nonBasicIndices}
          variableNames={tableau.variableNames}
          basisMatrix={B}
          basisVariableNames={orderedBasis.map(idx => tableau.variableNames[idx])}
        />
      )}
    </div>
  );
};

export default MatrixOperationsView;
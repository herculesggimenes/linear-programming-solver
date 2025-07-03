import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import type { SimplexTableau, LinearProgram } from '@/components/types';
import { 
  extractMatrixForm, 
  extractBasisMatrices,
  formatMatrix,
  invertMatrix,
  checkBasicFeasibility
} from '@/lib/matrix-operations';
import BasisInverseCalculator from './BasisInverseCalculator';

interface MatrixTableauSyncProps {
  tableau: SimplexTableau;
  problem: LinearProgram;
}

const MatrixTableauSync: React.FC<MatrixTableauSyncProps> = ({ tableau, problem }) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedBasis, setSelectedBasis] = useState<number[]>(tableau.basicVariables);
  const [showInverseCalculator, setShowInverseCalculator] = useState(false);
  
  // Extract matrix form from the original problem
  const { A, b, c } = extractMatrixForm(problem);
  
  // Extract basis matrices
  const nonBasicIndices = Array.from({ length: A[0].length }, (_, i) => i)
    .filter(i => !selectedBasis.includes(i));
  const { B, N } = extractBasisMatrices(A, selectedBasis, nonBasicIndices);
  
  // Calculate basis inverse
  const B_inv = invertMatrix(B);
  
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
      if (row > 0 && selectedBasis.includes(col)) {
        if (hoveredCell.col === col || 
            (hoveredCell.row === 0 && col < tableau.matrix[0].length - 1)) {
          return 'bg-blue-100';
        }
      }
    }
    return '';
  };

  // Helper to check if a column is basic
  const isBasicColumn = (col: number) => selectedBasis.includes(col);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Visualização Tableau ↔ Matriz</h2>
      
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
                    {tableau.variableNames.map((name, idx) => (
                      <th 
                        key={idx} 
                        className={`px-3 py-2 text-center font-semibold cursor-pointer
                          ${isBasicColumn(idx) ? 'text-blue-600' : ''}`}
                        onClick={() => {
                          if (selectedBasis.includes(idx)) {
                            setSelectedBasis(selectedBasis.filter(i => i !== idx));
                          } else if (selectedBasis.length < A.length) {
                            setSelectedBasis([...selectedBasis, idx]);
                          }
                        }}
                      >
                        {name}
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center font-semibold">RHS</th>
                  </tr>
                </thead>
                <tbody>
                  {tableau.matrix.map((row, rowIdx) => (
                    <tr key={rowIdx} className="border-b border-gray-200">
                      <td className="px-3 py-2 font-semibold">
                        {rowIdx === 0 ? 'z' : tableau.variableNames[tableau.basicVariables[rowIdx - 1]]}
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
                    B = Colunas Básicas ({selectedBasis.map(i => tableau.variableNames[i]).join(', ')})
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
            {B_inv && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm">Inversa da Base e Solução</h4>
                  <Button
                    onClick={() => setShowInverseCalculator(!showInverseCalculator)}
                    variant="outline"
                    size="sm"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    {showInverseCalculator ? 'Ocultar Cálculo' : 'Ver Cálculo Passo a Passo'}
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
                        {selectedBasis.map((varIdx, i) => (
                          <div key={i} className={solution[i] < 0 ? 'text-red-600' : ''}>
                            {tableau.variableNames[varIdx]} = {solution[i].toFixed(2)}
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
              <li>Passe o mouse sobre as células do tableau para destacar correspondências</li>
              <li>Clique nos nomes das variáveis para adicionar/remover da base</li>
              <li>Observe como a inversa da base (B<sup>-1</sup>) é usada para calcular a solução</li>
              <li>Veja se a solução básica atual é factível (todos os valores ≥ 0)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Basis Inverse Calculator */}
      {showInverseCalculator && B_inv && (
        <BasisInverseCalculator 
          basisMatrix={B}
          variableNames={selectedBasis.map(idx => tableau.variableNames[idx])}
        />
      )}
    </div>
  );
};

export default MatrixTableauSync;
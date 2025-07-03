import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { identityMatrix } from '@/lib/matrix-operations';

interface BasisInverseCalculatorProps {
  basisMatrix: number[][];
  variableNames?: string[];
}

interface InversionStep {
  description: string;
  matrix: number[][];
  augmented: number[][];
  pivotRow?: number;
  pivotCol?: number;
  operation?: string;
}

const BasisInverseCalculator: React.FC<BasisInverseCalculatorProps> = ({ 
  basisMatrix, 
  variableNames 
}) => {
  const [steps, setSteps] = useState<InversionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);

  // Calculate inversion steps using Gauss-Jordan elimination
  useEffect(() => {
    const calculateSteps = () => {
      const n = basisMatrix.length;
      const inversionSteps: InversionStep[] = [];
      
      // Create augmented matrix [B | I]
      const identity = identityMatrix(n);
      const augmented = basisMatrix.map((row, i) => [...row, ...identity[i]]);
      
      // Initial step
      inversionSteps.push({
        description: "Matriz aumentada inicial [B | I]",
        matrix: basisMatrix.map(row => [...row]),
        augmented: augmented.map(row => [...row])
      });
      
      // Forward elimination to create upper triangular matrix
      for (let i = 0; i < n; i++) {
        // Find pivot
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
          if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
            maxRow = k;
          }
        }
        
        // Swap rows if needed
        if (maxRow !== i) {
          [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
          inversionSteps.push({
            description: `Trocar linha ${i + 1} com linha ${maxRow + 1} (pivoteamento)`,
            matrix: augmented.slice(0, n).map(row => row.slice(0, n)),
            augmented: augmented.map(row => [...row]),
            operation: `L${i + 1} ↔ L${maxRow + 1}`
          });
        }
        
        // Scale pivot row
        const pivot = augmented[i][i];
        if (Math.abs(pivot) > 1e-10) {
          for (let j = 0; j < 2 * n; j++) {
            augmented[i][j] /= pivot;
          }
          inversionSteps.push({
            description: `Dividir linha ${i + 1} por ${pivot.toFixed(2)}`,
            matrix: augmented.slice(0, n).map(row => row.slice(0, n)),
            augmented: augmented.map(row => [...row]),
            pivotRow: i,
            pivotCol: i,
            operation: `L${i + 1} ← L${i + 1} / ${pivot.toFixed(2)}`
          });
        }
        
        // Eliminate column below pivot
        for (let k = i + 1; k < n; k++) {
          const factor = augmented[k][i];
          if (Math.abs(factor) > 1e-10) {
            for (let j = 0; j < 2 * n; j++) {
              augmented[k][j] -= factor * augmented[i][j];
            }
            inversionSteps.push({
              description: `Eliminar elemento na linha ${k + 1}, coluna ${i + 1}`,
              matrix: augmented.slice(0, n).map(row => row.slice(0, n)),
              augmented: augmented.map(row => [...row]),
              pivotRow: k,
              pivotCol: i,
              operation: `L${k + 1} ← L${k + 1} - ${factor.toFixed(2)} × L${i + 1}`
            });
          }
        }
      }
      
      // Backward elimination to create identity matrix
      for (let i = n - 1; i >= 0; i--) {
        for (let k = i - 1; k >= 0; k--) {
          const factor = augmented[k][i];
          if (Math.abs(factor) > 1e-10) {
            for (let j = 0; j < 2 * n; j++) {
              augmented[k][j] -= factor * augmented[i][j];
            }
            inversionSteps.push({
              description: `Eliminar elemento na linha ${k + 1}, coluna ${i + 1}`,
              matrix: augmented.slice(0, n).map(row => row.slice(0, n)),
              augmented: augmented.map(row => [...row]),
              pivotRow: k,
              pivotCol: i,
              operation: `L${k + 1} ← L${k + 1} - ${factor.toFixed(2)} × L${i + 1}`
            });
          }
        }
      }
      
      // Final step - show the result
      inversionSteps.push({
        description: "Inversão completa! A matriz identidade está à esquerda e B⁻¹ à direita",
        matrix: augmented.slice(0, n).map(row => row.slice(0, n)),
        augmented: augmented.map(row => [...row])
      });
      
      setSteps(inversionSteps);
      setCurrentStep(0);
    };
    
    calculateSteps();
  }, [basisMatrix]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, playbackSpeed);
      return () => clearTimeout(timer);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length, playbackSpeed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const getCellClass = (rowIdx: number, colIdx: number, step: InversionStep) => {
    const n = basisMatrix.length;
    const isInIdentity = colIdx >= n;
    
    let classes = 'w-12 h-10 text-center border border-gray-200 ';
    
    // Highlight pivot element
    if (step.pivotRow === rowIdx && step.pivotCol === colIdx) {
      classes += 'bg-red-200 font-bold ';
    }
    // Highlight pivot row
    else if (step.pivotRow === rowIdx) {
      classes += 'bg-red-100 ';
    }
    // Highlight pivot column
    else if (step.pivotCol === colIdx && rowIdx !== step.pivotRow) {
      classes += 'bg-blue-100 ';
    }
    
    // Separate original matrix from identity/inverse
    if (colIdx === n - 1) {
      classes += 'border-r-4 border-gray-400 ';
    }
    
    // Highlight the identity part differently
    if (isInIdentity) {
      classes += 'bg-gray-50 ';
    }
    
    return classes;
  };

  if (steps.length === 0) return null;
  
  const currentStepData = steps[currentStep];
  const n = basisMatrix.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            Cálculo da Inversa da Base (B⁻¹)
            {variableNames && (
              <Badge variant="secondary">
                Base: {variableNames.join(', ')}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Step Description */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              Passo {currentStep + 1} de {steps.length}
            </h4>
            <p className="text-blue-800">{currentStepData.description}</p>
            {currentStepData.operation && (
              <p className="font-mono text-sm mt-2 text-blue-700">
                Operação: {currentStepData.operation}
              </p>
            )}
          </div>

          {/* Augmented Matrix Visualization */}
          <div className="overflow-x-auto">
            <div className="inline-block">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm">[ B | I ] →</span>
              </div>
              <table className="border-collapse">
                <tbody>
                  {currentStepData.augmented.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {row.map((val, colIdx) => (
                        <td
                          key={colIdx}
                          className={getCellClass(rowIdx, colIdx, currentStepData)}
                        >
                          {val.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                disabled={currentStep === 0}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                onClick={handlePlayPause}
                variant="outline"
                size="sm"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={handleNext}
                variant="outline"
                size="sm"
                disabled={currentStep >= steps.length - 1}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Velocidade:</span>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="text-sm border rounded px-2 py-1"
              >
                <option value={2000}>Lento</option>
                <option value={1000}>Normal</option>
                <option value={500}>Rápido</option>
              </select>
            </div>
          </div>

          {/* Result Display */}
          {currentStep === steps.length - 1 && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Resultado Final</h4>
              <div className="font-mono text-sm">
                <span className="font-semibold">B⁻¹ = </span>
                <div className="inline-block border-l-2 border-r-2 border-green-600 px-2">
                  {currentStepData.augmented.map((row, i) => (
                    <div key={i} className="flex gap-2">
                      {row.slice(n).map((val, j) => (
                        <span key={j} className="w-12 text-right">
                          {val.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-200 border border-gray-400"></div>
              <span>Elemento pivô</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border border-gray-400"></div>
              <span>Linha pivô</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-gray-400"></div>
              <span>Coluna pivô</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BasisInverseCalculator;
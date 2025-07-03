import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, RotateCcw } from 'lucide-react';
import type { LinearProgram } from '@/components/types';
import { extractMatrixForm, formatMatrix } from '@/lib/matrix-operations';
import { convertToStandardFormWithExplanation } from '@/lib/standard-form-conversion';

interface MatrixFormConverterProps {
  problem: LinearProgram;
}

type ConversionStep = 'original' | 'standard' | 'matrix';

const MatrixFormConverter: React.FC<MatrixFormConverterProps> = ({ problem }) => {
  const [currentStep, setCurrentStep] = useState<ConversionStep>('original');
  const [standardForm, setStandardForm] = useState<LinearProgram | null>(null);
  const [matrixForm, setMatrixForm] = useState<{ A: number[][], b: number[], c: number[] } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Calculate standard form when component mounts or problem changes
    const { standardLP } = convertToStandardFormWithExplanation(problem);
    setStandardForm(standardLP);
    
    // Extract matrix form
    const matrices = extractMatrixForm(standardLP);
    setMatrixForm(matrices);
  }, [problem]);

  const nextStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (currentStep === 'original') {
        setCurrentStep('standard');
      } else if (currentStep === 'standard') {
        setCurrentStep('matrix');
      }
      setIsAnimating(false);
    }, 300);
  };

  const reset = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep('original');
      setIsAnimating(false);
    }, 300);
  };

  const formatConstraint = (coefficients: number[], rhs: number, operator: string, variables: string[]) => {
    const terms = coefficients.map((coef, idx) => {
      if (coef === 0) return null;
      const sign = coef > 0 && idx > 0 ? '+' : '';
      const absCoef = Math.abs(coef);
      const coefStr = absCoef === 1 ? '' : absCoef.toString();
      return `${sign}${coef < 0 ? '-' : ''}${coefStr}${variables[idx]}`;
    }).filter(term => term !== null);
    
    return `${terms.join(' ')} ${operator} ${rhs}`;
  };

  const formatObjective = (coefficients: number[], variables: string[], isMax: boolean) => {
    const terms = coefficients.map((coef, idx) => {
      if (coef === 0) return null;
      const sign = coef > 0 && idx > 0 ? '+' : '';
      const absCoef = Math.abs(coef);
      const coefStr = absCoef === 1 ? '' : absCoef.toString();
      return `${sign}${coef < 0 ? '-' : ''}${coefStr}${variables[idx]}`;
    }).filter(term => term !== null);
    
    return `${isMax ? 'max' : 'min'} z = ${terms.join(' ')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Conversão para Forma Matricial</h2>
        <Button
          onClick={reset}
          disabled={currentStep === 'original'}
          variant="outline"
          size="sm"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reiniciar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Original Problem */}
        <Card className={`transition-all duration-300 ${
          currentStep === 'original' ? 'ring-2 ring-blue-500 shadow-lg' : 
          currentStep !== 'original' ? 'opacity-50' : ''
        } ${isAnimating ? 'scale-95' : ''}`}>
          <CardHeader>
            <CardTitle className="text-lg">Problema Original</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 font-mono text-sm">
              <div className="text-blue-600 font-semibold">
                {formatObjective(problem.objective, problem.variables, problem.isMaximization)}
              </div>
              <div className="space-y-1">
                <div className="font-semibold text-gray-600">Sujeito a:</div>
                {problem.constraints.map((constraint, idx) => (
                  <div key={idx} className="ml-4">
                    {formatConstraint(
                      constraint.coefficients,
                      constraint.rhs,
                      constraint.operator,
                      problem.variables
                    )}
                  </div>
                ))}
                <div className="ml-4">
                  {problem.variables.join(', ')} ≥ 0
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <ChevronRight 
            className={`w-8 h-8 text-gray-400 transition-all duration-300 ${
              currentStep === 'original' && !isAnimating ? 'animate-pulse text-blue-500' : ''
            }`} 
          />
        </div>

        {/* Standard Form */}
        <Card className={`transition-all duration-300 ${
          currentStep === 'standard' ? 'ring-2 ring-blue-500 shadow-lg' : 
          currentStep === 'original' ? 'opacity-30' : 'opacity-50'
        } ${isAnimating && currentStep === 'original' ? 'scale-105' : ''}`}>
          <CardHeader>
            <CardTitle className="text-lg">Forma Padrão</CardTitle>
          </CardHeader>
          <CardContent>
            {standardForm && (
              <div className="space-y-3 font-mono text-sm">
                <div className="text-blue-600 font-semibold">
                  {formatObjective(
                    standardForm.objective,
                    standardForm.variables,
                    standardForm.isMaximization
                  )}
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-gray-600">Sujeito a:</div>
                  {standardForm.constraints.map((constraint, idx) => (
                    <div key={idx} className="ml-4">
                      {formatConstraint(
                        constraint.coefficients,
                        constraint.rhs,
                        '=',
                        standardForm.variables
                      )}
                    </div>
                  ))}
                  <div className="ml-4">
                    {standardForm.variables.join(', ')} ≥ 0
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <ChevronRight 
            className={`w-8 h-8 text-gray-400 transition-all duration-300 ${
              currentStep === 'standard' && !isAnimating ? 'animate-pulse text-blue-500' : ''
            }`} 
          />
        </div>

        {/* Matrix Form */}
        <Card className={`transition-all duration-300 ${
          currentStep === 'matrix' ? 'ring-2 ring-blue-500 shadow-lg' : 
          currentStep !== 'matrix' ? 'opacity-30' : ''
        } ${isAnimating && currentStep === 'standard' ? 'scale-105' : ''}`}>
          <CardHeader>
            <CardTitle className="text-lg">Forma Matricial</CardTitle>
          </CardHeader>
          <CardContent>
            {matrixForm && (
              <div className="space-y-4 font-mono text-sm">
                <div className="text-blue-600 font-semibold">
                  min c<sup>T</sup>x
                </div>
                <div className="space-y-2">
                  <div className="font-semibold text-gray-600">Ax = b</div>
                  <div className="font-semibold text-gray-600">x ≥ 0</div>
                </div>
                
                <div className="space-y-3 mt-4 text-xs">
                  {/* Matrix A */}
                  <div>
                    <span className="font-semibold">A = </span>
                    <div className="inline-block border-l-2 border-r-2 border-gray-400 px-2">
                      {formatMatrix(matrixForm.A).map((row, i) => (
                        <div key={i} className="flex gap-2">
                          {row.map((val, j) => (
                            <span key={j} className="w-8 text-right">{val}</span>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Vector b */}
                  <div>
                    <span className="font-semibold">b = </span>
                    <div className="inline-block border-l-2 border-r-2 border-gray-400 px-2">
                      {matrixForm.b.map((val, i) => (
                        <div key={i}>{val.toFixed(1)}</div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Vector c */}
                  <div>
                    <span className="font-semibold">c = </span>
                    <span className="border-l-2 border-r-2 border-gray-400 px-2">
                      [{matrixForm.c.map(val => val.toFixed(1)).join(', ')}]
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Control Button */}
      <div className="flex justify-center">
        <Button
          onClick={nextStep}
          disabled={currentStep === 'matrix' || isAnimating}
          className="px-6"
        >
          {currentStep === 'original' ? 'Converter para Forma Padrão' : 
           currentStep === 'standard' ? 'Converter para Forma Matricial' : 
           'Conversão Completa'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Explanation */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-sm text-gray-700">
            {currentStep === 'original' && (
              <>
                <strong>Problema Original:</strong> Esta é a formulação do problema como foi definido,
                com função objetivo, restrições e variáveis de decisão.
              </>
            )}
            {currentStep === 'standard' && (
              <>
                <strong>Forma Padrão:</strong> Todas as restrições são convertidas para igualdades
                adicionando variáveis de folga/excesso. A função objetivo é convertida para minimização
                se necessário.
              </>
            )}
            {currentStep === 'matrix' && (
              <>
                <strong>Forma Matricial:</strong> O problema é representado usando matrizes e vetores.
                Esta forma é fundamental para entender as operações do Simplex e trabalhar com a base.
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatrixFormConverter;
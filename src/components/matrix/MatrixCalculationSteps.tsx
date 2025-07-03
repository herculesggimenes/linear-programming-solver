import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Calculator } from 'lucide-react';
import { formatMatrix, multiplyMatrices, multiplyMatrixVector } from '@/lib/matrix-operations';
import BasisInverseCalculator from './BasisInverseCalculator';

interface MatrixCalculationStepsProps {
  B: number[][];
  N: number[][];
  B_inv: number[][];
  b: number[];
  c_B: number[];
  c_N: number[];
  basicIndices: number[];
  nonBasicIndices: number[];
  variableNames: string[];
  basisMatrix: number[][];
  basisVariableNames: string[];
}

const MatrixCalculationSteps: React.FC<MatrixCalculationStepsProps> = ({
  B, N, B_inv, b, c_B, c_N, basicIndices, nonBasicIndices, variableNames,
  basisMatrix, basisVariableNames
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['step1']));
  const [showGaussJordan, setShowGaussJordan] = useState(false);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Calculate all the values
  const B_inv_N = multiplyMatrices(B_inv, N);
  const B_inv_b = multiplyMatrixVector(B_inv, b);
  
  // Calculate c_B * B^-1 (this is a row vector)
  const c_B_B_inv = B_inv[0].map((_, j) => 
    c_B.reduce((sum, c_val, k) => sum + c_val * B_inv[k][j], 0)
  );
  
  // Calculate c_B * B^-1 * N
  const c_B_B_inv_N = N[0].map((_, j) => 
    B_inv_N.reduce((sum, row, i) => sum + c_B[i] * row[j], 0)
  );
  
  const reducedCosts = c_N.map((c_val, i) => c_val - (c_B_B_inv_N[i] || 0));
  const objectiveValue = c_B.reduce((sum, c_val, i) => sum + c_val * B_inv_b[i], 0);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Cálculos Passo a Passo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1: B^-1 calculation */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => toggleSection('step1')}
          >
            {expandedSections.has('step1') ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
            Passo 1: Calcular B<sup>-1</sup> (Inversa da Base)
          </Button>
          {expandedSections.has('step1') && (
            <div className="ml-6 mt-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm">
                  A inversa da base é calculada usando eliminação de Gauss-Jordan.
                </p>
                <Button
                  onClick={() => setShowGaussJordan(!showGaussJordan)}
                  variant="outline"
                  size="sm"
                  className="ml-4"
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  {showGaussJordan ? 'Ocultar Gauss-Jordan' : 'Ver Gauss-Jordan'}
                </Button>
              </div>
              <div className="font-mono text-xs">
                B<sup>-1</sup> = 
                <div className="inline-block ml-2 border-l-2 border-r-2 border-gray-400 px-2">
                  {formatMatrix(B_inv).map((row, i) => (
                    <div key={i} className="flex gap-2">
                      {row.map((val, j) => (
                        <span key={j} className="w-10 text-right">{val}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              {showGaussJordan && (
                <div className="mt-4">
                  <BasisInverseCalculator 
                    basisMatrix={basisMatrix}
                    variableNames={basisVariableNames}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 2: B^-1 * N */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => toggleSection('step2')}
          >
            {expandedSections.has('step2') ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
            Passo 2: Calcular B<sup>-1</sup>N (Colunas Não-Básicas Transformadas)
          </Button>
          {expandedSections.has('step2') && (
            <div className="ml-6 mt-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm mb-2">
                Multiplicar a inversa da base pelas colunas não-básicas:
              </p>
              <div className="font-mono text-xs space-y-2">
                <div>
                  B<sup>-1</sup>N = B<sup>-1</sup> × N
                </div>
                <div className="flex items-center gap-2">
                  <div className="inline-block border-l-2 border-r-2 border-gray-400 px-2">
                    {formatMatrix(B_inv).map((row, i) => (
                      <div key={i} className="flex gap-2">
                        {row.map((val, j) => (
                          <span key={j} className="w-10 text-right">{val}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                  <span>×</span>
                  <div className="inline-block border-l-2 border-r-2 border-gray-400 px-2">
                    {formatMatrix(N).map((row, i) => (
                      <div key={i} className="flex gap-2">
                        {row.map((val, j) => (
                          <span key={j} className="w-10 text-right">{val}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                  <span>=</span>
                  <div className="inline-block border-l-2 border-r-2 border-gray-400 px-2">
                    {formatMatrix(B_inv_N).map((row, i) => (
                      <div key={i} className="flex gap-2">
                        {row.map((val, j) => (
                          <span key={j} className="w-10 text-right">{typeof val === 'number' ? val.toFixed(2) : val}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 3: B^-1 * b */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => toggleSection('step3')}
          >
            {expandedSections.has('step3') ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
            Passo 3: Calcular B<sup>-1</sup>b (Solução Básica)
          </Button>
          {expandedSections.has('step3') && (
            <div className="ml-6 mt-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm mb-2">
                Multiplicar a inversa da base pelo vetor RHS:
              </p>
              <div className="font-mono text-xs space-y-2">
                <div>x<sub>B</sub> = B<sup>-1</sup>b</div>
                <div className="flex items-center gap-2">
                  <div className="inline-block border-l-2 border-r-2 border-gray-400 px-2">
                    {formatMatrix(B_inv).map((row, i) => (
                      <div key={i} className="flex gap-2">
                        {row.map((val, j) => (
                          <span key={j} className="w-10 text-right">{val}</span>
                        ))}
                      </div>
                    ))}
                  </div>
                  <span>×</span>
                  <div className="inline-block border-l border-r border-gray-400 px-2">
                    {b.map((val, i) => (
                      <div key={i}>{val.toFixed(1)}</div>
                    ))}
                  </div>
                  <span>=</span>
                  <div className="inline-block border-l border-r border-gray-400 px-2">
                    {B_inv_b.map((val, i) => (
                      <div key={i}>{val.toFixed(2)}</div>
                    ))}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm">Valores das variáveis básicas:</p>
                  {basicIndices.map((idx, i) => (
                    <div key={i} className={B_inv_b[i] < 0 ? 'text-red-600' : ''}>
                      {variableNames[idx]} = {B_inv_b[i].toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Reduced costs */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => toggleSection('step4')}
          >
            {expandedSections.has('step4') ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
            Passo 4: Calcular Custos Reduzidos (c'<sub>N</sub> - c'<sub>B</sub>B<sup>-1</sup>N)
          </Button>
          {expandedSections.has('step4') && (
            <div className="ml-6 mt-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm mb-2">
                Calcular os custos reduzidos das variáveis não-básicas:
              </p>
              <div className="font-mono text-xs space-y-2">
                <div>Primeiro, calcular c'<sub>B</sub>B<sup>-1</sup>:</div>
                <div>c'<sub>B</sub>B<sup>-1</sup> = [{c_B.map(v => v.toFixed(1)).join(', ')}] × B<sup>-1</sup> = [{c_B_B_inv.map(v => v.toFixed(2)).join(', ')}]</div>
                <div className="mt-3">Agora calcular os custos reduzidos para cada variável não-básica:</div>
                <div className="mt-2">
                  {nonBasicIndices.map((idx, i) => (
                    <div key={i} className={reducedCosts[i] < 0 ? 'text-green-600' : ''}>
                      {variableNames[idx]}: c<sub>{idx+1}</sub> - (c'<sub>B</sub>B<sup>-1</sup>)a<sub>{idx+1}</sub> = {c_N[i].toFixed(1)} - {(c_B_B_inv_N[i] || 0).toFixed(2)} = {reducedCosts[i].toFixed(2)}
                      {reducedCosts[i] < 0 && <span className="ml-2 text-xs">(pode entrar na base)</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 5: Objective value */}
        <div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => toggleSection('step5')}
          >
            {expandedSections.has('step5') ? <ChevronDown className="mr-2 h-4 w-4" /> : <ChevronRight className="mr-2 h-4 w-4" />}
            Passo 5: Calcular Valor da Função Objetivo (-c'<sub>B</sub>B<sup>-1</sup>b)
          </Button>
          {expandedSections.has('step5') && (
            <div className="ml-6 mt-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm mb-2">
                Calcular o valor atual da função objetivo:
              </p>
              <div className="font-mono text-xs space-y-2">
                <div>z = c'<sub>B</sub>x<sub>B</sub> = c'<sub>B</sub>B<sup>-1</sup>b</div>
                <div>z = [{c_B.map(v => v.toFixed(1)).join(', ')}] × [{B_inv_b.map(v => v.toFixed(2)).join(', ')}]<sup>T</sup></div>
                <div>z = {c_B.map((c, i) => `(${c.toFixed(1)} × ${B_inv_b[i].toFixed(2)})`).join(' + ')}</div>
                <div className="mt-2 font-semibold">z = {objectiveValue.toFixed(2)}</div>
                {c_B.every(c => c === 0) && (
                  <div className="mt-3 p-2 bg-yellow-100 rounded text-yellow-800">
                    <p className="text-xs">
                      <strong>Nota:</strong> O valor da função objetivo é zero porque as variáveis básicas atuais 
                      ({basicIndices.map(idx => variableNames[idx]).join(', ')}) são variáveis de folga/excesso 
                      com coeficientes zero na função objetivo.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MatrixCalculationSteps;
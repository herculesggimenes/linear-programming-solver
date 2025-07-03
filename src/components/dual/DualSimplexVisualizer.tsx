import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import TableauVisualizer from '@/components/TableauVisualizer';
import StepController from '@/components/StepController';
import DualSimplexDetector from './DualSimplexDetector';
import type { LinearProgram, SimplexTableau } from '@/components/types';
import { solveWithSteps } from '@/lib/simplex-solver';
import { 
  solveDualSimplex,
  type DualSimplexStep 
} from '@/lib/dual-simplex-solver';

interface DualSimplexVisualizerProps {
  problem: LinearProgram;
}

const DualSimplexVisualizer: React.FC<DualSimplexVisualizerProps> = ({ problem }) => {
  const [primalSteps, setPrimalSteps] = useState<DualSimplexStep[]>([]);
  const [dualSteps, setDualSteps] = useState<DualSimplexStep[]>([]);
  const [currentPrimalStep, setCurrentPrimalStep] = useState(0);
  const [currentDualStep, setCurrentDualStep] = useState(0);
  const [modifiedTableau, setModifiedTableau] = useState<SimplexTableau | null>(null);
  const [activeTab, setActiveTab] = useState<'primal' | 'dual' | 'comparison'>('primal');
  
  // Solve primal problem first
  useEffect(() => {
    const steps = solveWithSteps(problem, false);
    setPrimalSteps(steps.map(step => ({ ...step, isDualStep: false })));
    setCurrentPrimalStep(steps.length - 1); // Show optimal solution
  }, [problem]);
  
  // Handle re-optimization request
  const handleReoptimize = (newTableau: SimplexTableau) => {
    setModifiedTableau(newTableau);
    const dualSolution = solveDualSimplex(newTableau);
    setDualSteps(dualSolution);
    setCurrentDualStep(0);
    setActiveTab('dual');
  };
  
  const currentPrimalTableau = primalSteps[currentPrimalStep]?.tableau;
  const currentDualTableau = dualSteps[currentDualStep]?.tableau;
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Visualização do Dual Simplex</h2>
      
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'primal' | 'dual' | 'comparison')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="primal">Solução Primal</TabsTrigger>
          <TabsTrigger value="dual" disabled={!modifiedTableau}>
            Dual Simplex
            {dualSteps.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {dualSteps.length} passos
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="comparison" disabled={!modifiedTableau}>
            Comparação
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="primal" className="mt-4 space-y-4">
          {/* Primal Solution */}
          {currentPrimalTableau && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tableau Primal Ótimo</CardTitle>
                </CardHeader>
                <CardContent>
                  <TableauVisualizer step={primalSteps[currentPrimalStep]} />
                </CardContent>
              </Card>
              
              <StepController
                currentStep={currentPrimalStep}
                totalSteps={primalSteps.length}
                onStepChange={setCurrentPrimalStep}
              />
              
              <DualSimplexDetector 
                tableau={currentPrimalTableau}
                onReoptimize={handleReoptimize}
              />
            </>
          )}
        </TabsContent>
        
        <TabsContent value="dual" className="mt-4 space-y-4">
          {/* Dual Simplex Solution */}
          {currentDualTableau && (
            <>
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription>
                  <strong>Dual Simplex em Ação!</strong><br />
                  Observe como o algoritmo mantém a otimalidade (custos reduzidos ≥ 0) 
                  enquanto restaura a factibilidade (RHS ≥ 0).
                </AlertDescription>
              </Alert>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Tableau Dual Simplex
                    {dualSteps[currentDualStep].status === 'dual_start' && (
                      <Badge variant="secondary">Início</Badge>
                    )}
                    {dualSteps[currentDualStep].status === 'dual_iteration' && (
                      <Badge variant="default">Iteração</Badge>
                    )}
                    {dualSteps[currentDualStep].status === 'optimal' && (
                      <Badge variant="success" className="bg-green-600">Ótimo</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TableauVisualizer step={dualSteps[currentDualStep]} />
                  
                  {dualSteps[currentDualStep].dualPivotReason && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Razão do Pivô:</strong> {dualSteps[currentDualStep].dualPivotReason}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <StepController
                currentStep={currentDualStep}
                totalSteps={dualSteps.length}
                onStepChange={setCurrentDualStep}
              />
              
              {/* Step Explanation */}
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">Explicação do Passo</CardTitle>
                </CardHeader>
                <CardContent>
                  <DualSimplexStepExplanation step={dualSteps[currentDualStep]} />
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="comparison" className="mt-4">
          {/* Side-by-side Comparison */}
          {currentPrimalTableau && currentDualTableau && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Antes (Primal Ótimo)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p><strong>Valor Objetivo:</strong> {currentPrimalTableau.objectiveValue.toFixed(2)}</p>
                    <p><strong>Status:</strong> Ótimo e Factível</p>
                    <div className="mt-2">
                      <strong>Solução:</strong>
                      <div className="font-mono text-xs mt-1">
                        {currentPrimalTableau.basicVariables.map((varIdx, i) => (
                          <div key={i}>
                            {currentPrimalTableau.variableNames[varIdx]} = {
                              currentPrimalTableau.matrix[i + 1][currentPrimalTableau.matrix[0].length - 1].toFixed(2)
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Depois (Dual Simplex)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p><strong>Valor Objetivo:</strong> {currentDualTableau.objectiveValue.toFixed(2)}</p>
                    <p><strong>Status:</strong> {
                      dualSteps[dualSteps.length - 1].status === 'optimal' 
                        ? 'Ótimo e Factível' 
                        : 'Em processo...'
                    }</p>
                    <div className="mt-2">
                      <strong>Solução:</strong>
                      <div className="font-mono text-xs mt-1">
                        {currentDualTableau.basicVariables.map((varIdx, i) => {
                          const value = currentDualTableau.matrix[i + 1][currentDualTableau.matrix[0].length - 1];
                          return (
                            <div key={i} className={value < -1e-10 ? 'text-red-600' : ''}>
                              {currentDualTableau.variableNames[varIdx]} = {value.toFixed(2)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Component for explaining dual simplex steps
const DualSimplexStepExplanation: React.FC<{ step: DualSimplexStep }> = ({ step }) => {
  if (step.status === 'dual_start') {
    return (
      <div className="space-y-3 text-sm">
        <p>
          <strong>Iniciando o Dual Simplex</strong>
        </p>
        <p>
          O tableau atual tem solução ótima (todos os custos reduzidos são não-negativos), 
          mas é infactível (alguns valores RHS são negativos).
        </p>
        <p>
          O Dual Simplex mantém a otimalidade enquanto trabalha para restaurar a factibilidade.
        </p>
      </div>
    );
  }
  
  if (step.status === 'dual_iteration') {
    return (
      <div className="space-y-3 text-sm">
        <p>
          <strong>Iteração do Dual Simplex</strong>
        </p>
        {step.leavingVariable !== null && (
          <p>
            Variável de saída: <span className="font-mono font-bold">
              {step.tableau.variableNames[step.leavingVariable]}
            </span> (escolhida por ter o RHS mais negativo)
          </p>
        )}
        {step.enteringVariable !== null && (
          <p>
            Variável de entrada: <span className="font-mono font-bold">
              {step.tableau.variableNames[step.enteringVariable]}
            </span> (escolhida pelo teste da razão mínima nos custos reduzidos)
          </p>
        )}
        {step.pivotElement && (
          <p>
            Elemento pivô: <span className="font-mono font-bold">{step.pivotElement.toFixed(2)}</span>
          </p>
        )}
      </div>
    );
  }
  
  if (step.status === 'optimal') {
    return (
      <div className="space-y-3 text-sm">
        <p className="text-green-600 font-semibold">
          Solução Ótima Encontrada!
        </p>
        <p>
          O Dual Simplex restaurou a factibilidade mantendo a otimalidade.
          Todos os valores RHS são agora não-negativos.
        </p>
        <p>
          Valor da função objetivo: <span className="font-mono font-bold">
            {step.tableau.objectiveValue.toFixed(2)}
          </span>
        </p>
      </div>
    );
  }
  
  if (step.status === 'infeasible') {
    return (
      <div className="text-red-600 text-sm">
        <p className="font-semibold">Problema Inviável!</p>
        <p>
          O Dual Simplex detectou que não existe solução factível para o problema modificado.
        </p>
      </div>
    );
  }
  
  return null;
};

export default DualSimplexVisualizer;
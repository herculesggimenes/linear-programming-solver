import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import SimpleBranchAndBoundTree from './SimpleBranchAndBoundTree';
import StepController from '../StepController';
import type { IntegerProgram, BranchAndBoundStep } from '@/lib/integer-programming';
import { solveBranchAndBound } from '@/lib/integer-programming';
import BranchAndBoundExplanation from './BranchAndBoundExplanation';

interface IntegerProgrammingVisualizerProps {
  problem: IntegerProgram;
}

const IntegerProgrammingVisualizer: React.FC<IntegerProgrammingVisualizerProps> = ({ problem }) => {
  const [steps, setSteps] = useState<BranchAndBoundStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Solve the problem when component mounts
  useEffect(() => {
    const solution = solveBranchAndBound(problem);
    setSteps(solution);
    setCurrentStep(0);
  }, [problem]);
  
  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };
  
  if (steps.length === 0) {
    return <div>Calculando solução...</div>;
  }
  
  const step = steps[currentStep];
  const currentNode = step.currentNode;
  
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Programação Inteira - Branch and Bound</h2>
        {steps.length > 0 && (
          <Badge variant="outline" className="text-lg px-3 py-1">
            Passo {currentStep + 1} de {steps.length}
          </Badge>
        )}
      </div>
      
      {/* Introduction alert only on first step */}
      {currentStep === 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-800">Como funciona o Branch and Bound?</AlertTitle>
          <AlertDescription className="text-blue-700 mt-2">
            O algoritmo resolve problemas de programação inteira criando uma árvore de subproblemas. 
            Começamos resolvendo a relaxação linear (ignorando restrições de integralidade) e depois 
            ramificamos em variáveis fracionárias, criando novos subproblemas até encontrar a solução ótima inteira.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Main tree visualization */}
      <SimpleBranchAndBoundTree 
        nodes={step.tree}
        currentNodeId={currentNode.id}
      />
      
      {/* Detailed explanation for current step */}
      <BranchAndBoundExplanation 
        step={step}
        problem={problem}
        stepIndex={currentStep}
      />
      
      {/* Step Controller */}
      <StepController
        currentStep={currentStep}
        totalSteps={steps.length}
        onStepChange={handleStepChange}
      />
    </div>
  );
};

export default IntegerProgrammingVisualizer;
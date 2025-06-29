import React, { useState, useEffect } from 'react';
import type { LinearProgram, SimplexStep } from '@/components/types';
import { solveWithSteps } from '@/lib/simplex-solver';
import { convertToStandardFormWithExplanation } from '@/lib/standard-form-conversion';
import TableauVisualizer from './TableauVisualizer';
import GeometricVisualizerVisx from './GeometricVisualizerVisx';
import StepController from './StepController';
import StepExplanation from './StepExplanation';
import StandardFormExplanationDetailed from './StandardFormExplanation';
import BasisExplanation from './BasisExplanation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
// Tabs removed

interface SimplexVisualizerProps {
  lp: LinearProgram;
  initialStep?: number;
  showGeometric?: boolean;
  width?: number;
  height?: number;
}

const SimplexVisualizer: React.FC<SimplexVisualizerProps> = ({
  lp,
  initialStep = 0,
  showGeometric = true,
  width = 800,
  height = 400
}) => {
  const [steps, setSteps] = useState<SimplexStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(true);
  const [standardFormData, setStandardFormData] = useState<{originalLP: LinearProgram, standardLP: LinearProgram} | null>(null);
  
  // Solve LP on component mount
  useEffect(() => {
    setIsLoading(true);
    
    // Use timeout to allow UI to update
    const timer = setTimeout(() => {
      try {
        // First get standard form data - this properly handles unbounded variables
        const { originalLP, standardLP, explanation } = convertToStandardFormWithExplanation(lp);
        setStandardFormData({ originalLP, standardLP });
        
        // Get simplex steps - use the standardLP which has unrestricted variables properly handled
        // Pass true as the second parameter to indicate it's already in standard form
        const calculatedSteps = solveWithSteps(standardLP, true);
        
        // Fix any phase issues for the first 12 examples (which don't need Phase I)
        // If the problem doesn't have equality or >= constraints, it should be Phase II directly
        const hasEqualityOrGEConstraints = standardLP.constraints.some(c => c.operator === '=' || c.operator === '>=');
        
        if (!hasEqualityOrGEConstraints) {
          calculatedSteps.forEach(step => {
            if (step.tableau.phase === 'phase1') {
              // Fix the phase labeling
              step.tableau.phase = 'phase2';
            }
          });
        }
        
        // Add standard form as the first step if it doesn't already exist
        if (calculatedSteps.length > 0 && calculatedSteps[0].status === 'initial') {
          // Create a standard form step
          const standardFormStep: SimplexStep = {
            tableau: calculatedSteps[0].tableau,
            enteringVariable: null,
            leavingVariable: null,
            pivotElement: null,
            status: 'standard_form' as SimplexStatus,
            explanation: explanation
          };
          
          // Insert at the beginning
          setSteps([standardFormStep, ...calculatedSteps]);
          setCurrentStepIndex(initialStep > 0 ? initialStep + 1 : initialStep);
        } else {
          setSteps(calculatedSteps);
          setCurrentStepIndex(initialStep);
        }
      } catch (error) {
        console.error('Error solving LP:', error);
      } finally {
        setIsLoading(false);
      }
    }, 10);
    
    return () => clearTimeout(timer);
  }, [lp, initialStep]);
  
  
  const handleStepChange = (step: number) => {
    setCurrentStepIndex(step);
  };
  
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-10 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  if (steps.length === 0) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-2xl">
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>Falha ao resolver o programa linear. Por favor, verifique suas entradas e tente novamente.</AlertDescription>
      </Alert>
    );
  }
  
  const currentStep = steps[currentStepIndex];
  
  return (
    <div className="w-full max-w-[1000px] mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Visualização do Método Simplex</h2>
      
      <div className="flex flex-col gap-6 mt-4">
        {showGeometric && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Visão Geométrica</CardTitle>
            </CardHeader>
            <CardContent>
              <GeometricVisualizerVisx
                lp={lp}
                currentStep={currentStep}
                width={width}
                height={height}
              />
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Tableau Simplex</CardTitle>
            
            {/* Debug info - remove after debugging */}
            <div className="text-xs text-gray-500">
              Passo {currentStepIndex+1} de {steps.length}, 
              Status: {currentStep.status}, 
              Fase: {currentStep.tableau.phase || 'não definida'}
            </div>
          </CardHeader>
          <CardContent>
            <TableauVisualizer step={currentStep} />
          </CardContent>
        </Card>
        
        <div className="my-6">
          <StepController
            currentStep={currentStepIndex}
            totalSteps={steps.length}
            onStepChange={handleStepChange}
          />
        </div>
        
        <Card className="mt-2">
          <CardHeader>
            <CardTitle>
              {currentStep.status === 'standard_form' ? 'Conversão para Forma Padrão' : 
               currentStep.status === 'initial' && currentStepIndex === 1 ? 'Explicação da Base' :
               currentStep.status === 'phase1_start' ? 'Introdução à Fase I' :
               currentStep.status === 'phase2_start' ? 'Transição da Fase I para Fase II' :
               'Explicação do Passo'}
              
              {/* If we're in Phase I, show a badge (but not for standard_form step) */}
              {currentStep.status !== 'standard_form' && currentStep.tableau.phase === 'phase1' && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Fase I
                </span>
              )}
              
              {/* If we're in Phase II after Phase I, show a badge (but not for standard_form step) */}
              {currentStep.status !== 'standard_form' && currentStep.tableau.phase === 'phase2' && steps.some(s => s.status === 'phase1_start') && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Fase II
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentStep.status === 'standard_form' ? (
              <StandardFormExplanationDetailed 
                originalLP={standardFormData.originalLP}
                standardLP={standardFormData.standardLP}
              />
            ) : currentStep.status === 'initial' && currentStepIndex === 1 ? (
              <>
                <BasisExplanation />
                <div className="mt-6 border-t pt-6 border-gray-200">
                  <StepExplanation step={currentStep} />
                </div>
              </>
            ) : (
              <StepExplanation step={currentStep} />
            )}
            
            {currentStep.status === 'optimal' && (
              <Alert className="bg-green-50 border-green-200 mt-4">
                <AlertTitle className="text-green-700">Solução Ótima Encontrada!</AlertTitle>
                <AlertDescription className="text-green-600">
                  O valor da função objetivo é {currentStep.tableau.objectiveValue.toFixed(2)}
                </AlertDescription>
              </Alert>
            )}
            
            {currentStep.status === 'unbounded' && (
              <Alert className="bg-red-50 border-red-200 mt-4">
                <AlertTitle className="text-red-700">Problema é Ilimitado</AlertTitle>
                <AlertDescription className="text-red-600">
                  O valor da função objetivo pode aumentar indefinidamente.
                </AlertDescription>
              </Alert>
            )}
            
            {currentStep.status === 'infeasible' && (
              <Alert className="bg-red-50 border-red-200 mt-4">
                <AlertTitle className="text-red-700">Problema é Inviável</AlertTitle>
                <AlertDescription className="text-red-600">
                  Não existe solução que satisfaça todas as restrições.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
      
      
    </div>
  );
};

export default SimplexVisualizer;
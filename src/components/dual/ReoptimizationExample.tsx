import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, RefreshCw } from 'lucide-react';
import type { LinearProgram } from '@/components/types';

interface ReoptimizationExampleProps {
  onSelectExample: (problem: LinearProgram) => void;
}

const ReoptimizationExample: React.FC<ReoptimizationExampleProps> = ({ onSelectExample }) => {
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  
  const scenarios = [
    {
      title: "Fábrica de Móveis - Mudança de Demanda",
      description: "Uma fábrica produz mesas e cadeiras. Após encontrar a solução ótima, a demanda mínima por mesas aumenta.",
      original: {
        objective: [40, 30],
        isMaximization: true,
        constraints: [
          { coefficients: [2, 1], rhs: 40, operator: '<=' },  // Horas de carpintaria
          { coefficients: [1, 2], rhs: 50, operator: '<=' },  // Horas de acabamento
        ],
        variables: ['x', 'y'],
        variableRestrictions: [true, true]
      },
      modified: {
        objective: [40, 30],
        isMaximization: true,
        constraints: [
          { coefficients: [2, 1], rhs: 40, operator: '<=' },
          { coefficients: [1, 2], rhs: 50, operator: '<=' },
          { coefficients: [1, 0], rhs: 10, operator: '>=' }  // Nova demanda mínima de mesas
        ],
        variables: ['x', 'y'],
        variableRestrictions: [true, true]
      },
      explanation: "Adicionamos uma restrição de demanda mínima que pode tornar a solução atual infactível."
    },
    {
      title: "Produção com Recursos Reduzidos",
      description: "Uma empresa tem sua produção otimizada, mas enfrenta redução na disponibilidade de matéria-prima.",
      original: {
        objective: [5, 4],
        isMaximization: true,
        constraints: [
          { coefficients: [2, 3], rhs: 120, operator: '<=' },  // Matéria-prima A
          { coefficients: [4, 2], rhs: 140, operator: '<=' },  // Matéria-prima B
        ],
        variables: ['x1', 'x2'],
        variableRestrictions: [true, true]
      },
      modified: {
        objective: [5, 4],
        isMaximization: true,
        constraints: [
          { coefficients: [2, 3], rhs: 80, operator: '<=' },   // Redução em A
          { coefficients: [4, 2], rhs: 100, operator: '<=' },  // Redução em B
        ],
        variables: ['x1', 'x2'],
        variableRestrictions: [true, true]
      },
      explanation: "A redução dos recursos disponíveis pode requerer o Dual Simplex para re-otimização."
    },
    {
      title: "Problema de Dieta com Nova Restrição",
      description: "Um nutricionista adiciona um limite máximo de calorias após encontrar a dieta de custo mínimo.",
      original: {
        objective: [2, 3, 1],
        isMaximization: false,
        constraints: [
          { coefficients: [10, 5, 7], rhs: 30, operator: '>=' },   // Proteína mínima
          { coefficients: [5, 8, 3], rhs: 25, operator: '>=' },    // Vitaminas mínimas
        ],
        variables: ['x1', 'x2', 'x3'],
        variableRestrictions: [true, true, true]
      },
      modified: {
        objective: [2, 3, 1],
        isMaximization: false,
        constraints: [
          { coefficients: [10, 5, 7], rhs: 30, operator: '>=' },
          { coefficients: [5, 8, 3], rhs: 25, operator: '>=' },
          { coefficients: [200, 150, 100], rhs: 800, operator: '<=' }  // Limite de calorias
        ],
        variables: ['x1', 'x2', 'x3'],
        variableRestrictions: [true, true, true]
      },
      explanation: "A nova restrição de calorias pode tornar a solução atual inviável, requerendo dual simplex."
    }
  ];
  
  const handleSelectScenario = (index: number, useModified: boolean) => {
    const scenario = scenarios[index];
    onSelectExample(useModified ? scenario.modified : scenario.original);
    setSelectedScenario(index);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Exemplos de Re-otimização</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              Estes exemplos demonstram situações onde o Dual Simplex é útil para re-otimizar 
              após mudanças no problema, mantendo a base ótima quando possível.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            {scenarios.map((scenario, idx) => (
              <Card key={idx} className={`${selectedScenario === idx ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{scenario.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{scenario.description}</p>
                  <p className="text-sm text-blue-600">{scenario.explanation}</p>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectScenario(idx, false)}
                    >
                      Problema Original
                    </Button>
                    <ArrowRight className="w-4 h-4 self-center text-gray-400" />
                    <Button
                      size="sm"
                      onClick={() => handleSelectScenario(idx, true)}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Problema Modificado
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReoptimizationExample;
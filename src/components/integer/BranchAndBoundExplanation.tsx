import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, GitBranch, Scissors, CheckCircle, AlertCircle } from 'lucide-react';
import type { BranchAndBoundStep, IntegerProgram } from '@/lib/integer-programming';

interface BranchAndBoundExplanationProps {
  step: BranchAndBoundStep;
  problem: IntegerProgram;
  stepIndex: number;
}

const BranchAndBoundExplanation: React.FC<BranchAndBoundExplanationProps> = ({ 
  step, 
  problem,
  stepIndex 
}) => {
  const currentNode = step.currentNode;
  
  // Get a more intuitive explanation based on the action
  const getDetailedExplanation = () => {
    switch (step.action) {
      case 'select':
        if (stepIndex === 0) {
          return {
            title: "Iniciando o Branch and Bound",
            icon: <Info className="w-5 h-5" />,
            color: "blue",
            content: (
              <div className="space-y-3">
                <p>
                  <strong>Nó Raiz ({currentNode.id}):</strong> Começamos resolvendo a relaxação linear do problema original.
                  Isso significa que ignoramos temporariamente as restrições de integralidade.
                </p>
                <p>
                  Este nó tem bound infinito porque ainda não conhecemos nenhum limite para o valor ótimo.
                </p>
              </div>
            )
          };
        }
        
        const activeNodes = step.tree.filter(n => n.status === 'active').length;
        return {
          title: "Selecionando Próximo Nó",
          icon: <Info className="w-5 h-5" />,
          color: "blue",
          content: (
            <div className="space-y-3">
              <p>
                <strong>Nó selecionado:</strong> {currentNode.id} com bound = {currentNode.bound.toFixed(2)}
              </p>
              <p>
                Existem {activeNodes} nós ativos na árvore. Escolhemos o nó com o melhor bound 
                (maior valor para maximização) porque ele tem maior potencial de conter a solução ótima.
              </p>
              {currentNode.parentId && currentNode.branchVariable !== undefined && (
                <p className="text-sm bg-gray-50 p-2 rounded">
                  Este nó foi criado do nó {currentNode.parentId} adicionando a restrição: {' '}
                  <span className="font-mono">
                    {problem.variables[currentNode.branchVariable]} {currentNode.branchDirection === 'up' ? '≥' : '≤'} {
                      currentNode.branchDirection === 'up' 
                        ? Math.ceil(currentNode.solution?.values[currentNode.branchVariable] || 0)
                        : Math.floor(currentNode.solution?.values[currentNode.branchVariable] || 0)
                    }
                  </span>
                </p>
              )}
            </div>
          )
        };
        
      case 'solve':
        return {
          title: "Resolvendo Relaxação Linear",
          icon: <Info className="w-5 h-5" />,
          color: "blue",
          content: (
            <div className="space-y-3">
              <p>
                Resolvemos o subproblema do nó {currentNode.id} usando o método Simplex, 
                ignorando as restrições de integralidade.
              </p>
              {currentNode.solution && currentNode.solution.feasible && (
                <>
                  <p>
                    <strong>Solução encontrada:</strong> Valor objetivo = {currentNode.solution.objectiveValue.toFixed(2)}
                  </p>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <p className="font-semibold mb-1">Valores das variáveis:</p>
                    {problem.variables.map((varName, idx) => {
                      const value = currentNode.solution!.values[idx];
                      const isInteger = Math.abs(value - Math.round(value)) < 1e-6;
                      const mustBeInteger = problem.integerConstraints.some(
                        c => c.variableIndex === idx
                      );
                      return (
                        <div key={idx} className={mustBeInteger && !isInteger ? 'text-amber-600 font-semibold' : ''}>
                          {varName} = {value.toFixed(3)}
                          {mustBeInteger && !isInteger && ' ← não é inteiro!'}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )
        };
        
      case 'branch':
        const branchVar = currentNode.branchVariable;
        const varName = branchVar !== undefined ? problem.variables[branchVar] : '';
        const currentValue = branchVar !== undefined && currentNode.solution 
          ? currentNode.solution.values[branchVar] : 0;
          
        return {
          title: "Ramificando em Variável Fracionária",
          icon: <GitBranch className="w-5 h-5" />,
          color: "amber",
          content: (
            <div className="space-y-3">
              <p>
                A solução do nó {currentNode.id} tem variáveis fracionárias que devem ser inteiras.
              </p>
              {branchVar !== undefined && (
                <>
                  <p>
                    <strong>Variável escolhida para ramificação:</strong> {varName} = {currentValue.toFixed(3)}
                  </p>
                  <div className="bg-amber-50 p-3 rounded">
                    <p className="font-semibold mb-2">Criando dois novos subproblemas:</p>
                    <ul className="space-y-1 ml-4">
                      <li>• <strong>Ramo esquerdo:</strong> {varName} ≤ {Math.floor(currentValue)} (arredonda para baixo)</li>
                      <li>• <strong>Ramo direito:</strong> {varName} ≥ {Math.ceil(currentValue)} (arredonda para cima)</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-600">
                    Isso garante que exploraremos todas as possíveis soluções inteiras.
                  </p>
                </>
              )}
            </div>
          )
        };
        
      case 'fathom':
        return {
          title: "Podando Nó",
          icon: <Scissors className="w-5 h-5" />,
          color: "red",
          content: (
            <div className="space-y-3">
              <p>
                O nó {currentNode.id} foi podado e não será mais explorado.
              </p>
              {currentNode.reason && (
                <div className="bg-red-50 p-3 rounded">
                  <p className="font-semibold">Motivo da poda:</p>
                  <p className="mt-1">
                    {currentNode.reason === 'Infactível' 
                      ? 'O subproblema não tem solução viável (as restrições são contraditórias).'
                      : currentNode.reason === 'Limitado por melhor solução'
                      ? `O bound deste nó (${currentNode.bound.toFixed(2)}) não é melhor que a melhor solução inteira já encontrada (${step.incumbentSolution?.objectiveValue.toFixed(2)}). Portanto, este ramo não pode conter a solução ótima.`
                      : currentNode.reason}
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-600">
                A poda é fundamental para a eficiência do algoritmo, evitando explorar ramos desnecessários.
              </p>
            </div>
          )
        };
        
      case 'update_incumbent':
        return {
          title: "Nova Melhor Solução Inteira!",
          icon: <CheckCircle className="w-5 h-5" />,
          color: "green",
          content: (
            <div className="space-y-3">
              <p>
                Encontramos uma solução onde todas as variáveis são inteiras!
              </p>
              {step.incumbentSolution && (
                <>
                  <div className="bg-green-50 p-3 rounded">
                    <p className="font-semibold">Nova melhor solução:</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      Valor objetivo = {step.incumbentSolution.objectiveValue.toFixed(2)}
                    </p>
                    <div className="mt-2 text-sm">
                      {problem.variables.map((varName, idx) => (
                        <div key={idx}>
                          {varName} = {Math.round(step.incumbentSolution!.values[idx])}
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Esta se torna nossa melhor solução conhecida. Qualquer nó com bound pior que este valor será podado.
                  </p>
                </>
              )}
            </div>
          )
        };
        
      case 'optimal':
        return {
          title: "Solução Ótima Encontrada!",
          icon: <CheckCircle className="w-5 h-5" />,
          color: "green",
          content: (
            <div className="space-y-3">
              <p>
                O algoritmo terminou! Todos os nós foram explorados ou podados.
              </p>
              {step.incumbentSolution && (
                <div className="bg-green-50 p-4 rounded">
                  <p className="font-semibold text-lg mb-2">Solução ótima inteira:</p>
                  <p className="text-3xl font-bold text-green-600">
                    Valor objetivo = {step.incumbentSolution.objectiveValue.toFixed(2)}
                  </p>
                  <div className="mt-3 space-y-1">
                    {problem.variables.map((varName, idx) => (
                      <div key={idx} className="text-lg">
                        {varName} = {Math.round(step.incumbentSolution!.values[idx])}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-semibold">Estatísticas finais:</p>
                <ul className="mt-1 space-y-1">
                  <li>• Nós criados: {step.tree.length}</li>
                  <li>• Nós podados: {step.tree.filter(n => n.status === 'fathomed').length}</li>
                  <li>• Nós com solução inteira: {step.tree.filter(n => n.status === 'integer').length}</li>
                </ul>
              </div>
            </div>
          )
        };
        
      default:
        return {
          title: "Processando",
          icon: <Info className="w-5 h-5" />,
          color: "gray",
          content: <p>{step.explanation}</p>
        };
    }
  };
  
  const explanation = getDetailedExplanation();
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    amber: "bg-amber-50 border-amber-200 text-amber-800",
    red: "bg-red-50 border-red-200 text-red-800",
    green: "bg-green-50 border-green-200 text-green-800",
    gray: "bg-gray-50 border-gray-200 text-gray-800"
  };
  
  return (
    <Card className={colorClasses[explanation.color as keyof typeof colorClasses]}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {explanation.icon}
          {explanation.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {explanation.content}
        
        {/* Current tree statistics */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span>Ativos: {step.tree.filter(n => n.status === 'active').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <span>Ramificados: {step.tree.filter(n => n.status === 'branched').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span>Inteiros: {step.tree.filter(n => n.status === 'integer').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span>Podados: {step.tree.filter(n => n.status === 'fathomed').length}</span>
            </div>
            {step.incumbentSolution && (
              <div className="flex items-center gap-2 ml-auto">
                <Badge variant="default" className="bg-green-600">
                  Melhor solução: {step.incumbentSolution.objectiveValue.toFixed(2)}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BranchAndBoundExplanation;
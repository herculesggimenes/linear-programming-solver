import React, { useState } from 'react';
import type { LinearProgram } from '@/components/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Info, ArrowRight, ArrowUpDown, DollarSign, TrendingUp, BarChart3, AlertCircle } from 'lucide-react';
import { DualityTheoremsVisualization } from './DualityTheoremsVisualization';

interface VisualizationProps {
  primal: LinearProgram;
  dual: LinearProgram;
}

// Main component that organizes all visualizations
export const DualityGraphicalVisualizations: React.FC<VisualizationProps> = ({ primal, dual }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Visualizações Gráficas da Dualidade</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="strong-duality">
            <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <TabsTrigger value="strong-duality">Dualidade Forte</TabsTrigger>
              <TabsTrigger value="shadow-prices">Preços Sombra</TabsTrigger>
              <TabsTrigger value="complementary">Folga Complementar</TabsTrigger>
              <TabsTrigger value="economic">Equilíbrio Econômico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="strong-duality">
              <StrongDualityVisualization />
            </TabsContent>
            
            <TabsContent value="shadow-prices">
              <ShadowPricesVisualization primal={primal} />
            </TabsContent>
            
            <TabsContent value="complementary">
              <ComplementarySlacknessVisualization />
            </TabsContent>
            
            <TabsContent value="economic">
              <EconomicEquilibriumVisualization primal={primal} dual={dual} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Additional Theorems Visualization */}
      <DualityTheoremsVisualization />
    </div>
  );
};

// Visualization for Strong Duality Theorem
const StrongDualityVisualization: React.FC = () => {
  const [showOptimal, setShowOptimal] = useState(false);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Teorema da Dualidade Forte</h3>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Primal feasible region */}
          <div className="text-center">
            <div className="relative w-48 h-48 mx-auto bg-white rounded-lg border-2 border-blue-500">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Feasible region */}
                <polygon
                  points="50,150 50,100 100,50 150,50 150,150"
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="2"
                />
                {/* Objective function lines */}
                <line x1="30" y1="170" x2="170" y2="30" stroke="rgb(239, 68, 68)" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="50" y1="170" x2="190" y2="30" stroke="rgb(239, 68, 68)" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="70" y1="170" x2="210" y2="30" stroke="rgb(239, 68, 68)" strokeWidth="1" strokeDasharray="5,5" />
                
                {showOptimal && (
                  <>
                    <circle cx="150" cy="50" r="6" fill="rgb(34, 197, 94)" stroke="white" strokeWidth="2" />
                    <text x="160" y="45" fontSize="12" fontWeight="bold">x*</text>
                  </>
                )}
                
                <text x="100" y="190" textAnchor="middle" fontSize="14" fontWeight="bold">
                  Primal (MAX)
                </text>
              </svg>
              {showOptimal && (
                <div className="mt-2 text-sm font-semibold text-green-600">
                  z* = cx* = 42
                </div>
              )}
            </div>
          </div>
          
          {/* Arrow */}
          <div className="flex justify-center">
            <div className="text-center">
              <ArrowUpDown className="w-12 h-12 text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-semibold">Dualidade</p>
            </div>
          </div>
          
          {/* Dual feasible region */}
          <div className="text-center">
            <div className="relative w-48 h-48 mx-auto bg-white rounded-lg border-2 border-green-500">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Feasible region (unbounded) */}
                <polygon
                  points="50,50 150,50 150,100 100,150 50,150"
                  fill="rgba(34, 197, 94, 0.2)"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="2"
                />
                <polygon
                  points="150,50 200,50 200,200 100,200 100,150 150,100"
                  fill="rgba(34, 197, 94, 0.1)"
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
                
                {/* Objective function lines */}
                <line x1="30" y1="30" x2="170" y2="170" stroke="rgb(168, 85, 247)" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="50" y1="30" x2="190" y2="170" stroke="rgb(168, 85, 247)" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="70" y1="30" x2="210" y2="170" stroke="rgb(168, 85, 247)" strokeWidth="1" strokeDasharray="5,5" />
                
                {showOptimal && (
                  <>
                    <circle cx="50" cy="150" r="6" fill="rgb(34, 197, 94)" stroke="white" strokeWidth="2" />
                    <text x="30" y="145" fontSize="12" fontWeight="bold">y*</text>
                  </>
                )}
                
                <text x="100" y="190" textAnchor="middle" fontSize="14" fontWeight="bold">
                  Dual (MIN)
                </text>
              </svg>
              {showOptimal && (
                <div className="mt-2 text-sm font-semibold text-green-600">
                  w* = y*b = 42
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Button
            onClick={() => setShowOptimal(!showOptimal)}
            variant={showOptimal ? "default" : "outline"}
          >
            {showOptimal ? "Ocultar" : "Mostrar"} Solução Ótima
          </Button>
        </div>
        
        {showOptimal && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-lg font-semibold text-blue-900">
              No ótimo: z* = w* (valores objetivos são iguais)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Visualization for Shadow Prices
const ShadowPricesVisualization: React.FC<{ primal: LinearProgram }> = ({ primal }) => {
  const [selectedResource, setSelectedResource] = useState(0);
  const shadowPrices = [2.5, 1.8, 0]; // Example shadow prices
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Interpretação dos Preços Sombra</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource sensitivity */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Sensibilidade dos Recursos</h4>
          
          <div className="space-y-3">
            {primal.constraints.map((constraint, i) => (
              <div
                key={i}
                className={`p-3 rounded cursor-pointer transition-all ${
                  selectedResource === i ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white border'
                }`}
                onClick={() => setSelectedResource(i)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Recurso {i + 1}</p>
                    <p className="text-sm text-gray-600">RHS atual: {constraint.rhs}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      y{i + 1} = {shadowPrices[i]}
                    </p>
                    <p className="text-xs text-gray-500">preço sombra</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Marginal value visualization */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Valor Marginal do Recurso {selectedResource + 1}</h4>
          
          <div className="bg-white p-4 rounded">
            <svg viewBox="0 0 300 200" className="w-full">
              {/* Axes */}
              <line x1="40" y1="160" x2="260" y2="160" stroke="black" strokeWidth="2" />
              <line x1="40" y1="160" x2="40" y2="20" stroke="black" strokeWidth="2" />
              
              {/* Labels */}
              <text x="150" y="185" textAnchor="middle" fontSize="12">
                Mudança no RHS (Δb)
              </text>
              <text x="15" y="90" textAnchor="middle" fontSize="12" transform="rotate(-90 15 90)">
                Mudança no z* (Δz)
              </text>
              
              {/* Shadow price line */}
              <line
                x1="40"
                y1="160"
                x2="260"
                y2={160 - shadowPrices[selectedResource] * 40}
                stroke="rgb(59, 130, 246)"
                strokeWidth="3"
              />
              
              {/* Current point */}
              <circle cx="150" cy="160" r="5" fill="rgb(34, 197, 94)" />
              
              {/* Example changes */}
              <circle cx="190" cy={160 - shadowPrices[selectedResource] * 20} r="4" fill="rgb(239, 68, 68)" />
              <line x1="150" y1="160" x2="190" y2="160" stroke="gray" strokeDasharray="2,2" />
              <line x1="190" y1="160" x2="190" y2={160 - shadowPrices[selectedResource] * 20} stroke="gray" strokeDasharray="2,2" />
              
              {/* Annotations */}
              <text x="195" y="165" fontSize="10">+1</text>
              <text x="195" y={155 - shadowPrices[selectedResource] * 20} fontSize="10">
                +{shadowPrices[selectedResource]}
              </text>
            </svg>
            
            <div className="mt-4 text-center">
              <p className="text-sm">
                Aumentar o recurso {selectedResource + 1} em 1 unidade aumenta z* em{' '}
                <span className="font-bold text-blue-600">{shadowPrices[selectedResource]}</span>
              </p>
              {shadowPrices[selectedResource] === 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  (Recurso não restritivo - tem folga)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Visualization for Complementary Slackness
const ComplementarySlacknessVisualization: React.FC = () => {
  const [scenario, setScenario] = useState(0);
  
  const scenarios = [
    {
      title: "Variável Básica Primal",
      primal: { var: 'x₁', value: 5, active: true },
      dual: { constraint: 'y₁A₁ ≥ c₁', slack: 0, tight: true },
      explanation: "Se x₁ > 0, então a restrição dual correspondente é satisfeita com igualdade"
    },
    {
      title: "Variável com Folga Dual",
      primal: { var: 'x₂', value: 0, active: false },
      dual: { constraint: 'y₁A₂ > c₂', slack: 2, tight: false },
      explanation: "Se a restrição dual tem folga, então x₂ = 0"
    },
    {
      title: "Restrição Ativa Primal",
      primal: { constraint: 'Ax₁ = b₁', slack: 0, tight: true },
      dual: { var: 'y₁', value: 2.5, active: true },
      explanation: "Se a restrição primal é ativa, então y₁ > 0"
    },
    {
      title: "Restrição com Folga Primal",
      primal: { constraint: 'Ax₂ < b₂', slack: 3, tight: false },
      dual: { var: 'y₂', value: 0, active: false },
      explanation: "Se a restrição primal tem folga, então y₂ = 0"
    }
  ];
  
  const currentScenario = scenarios[scenario];
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Condições de Folga Complementar</h3>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        {/* Scenario selector */}
        <div className="flex justify-center gap-2 mb-6">
          {scenarios.map((_, i) => (
            <Button
              key={i}
              size="sm"
              variant={scenario === i ? "default" : "outline"}
              onClick={() => setScenario(i)}
            >
              Cenário {i + 1}
            </Button>
          ))}
        </div>
        
        <h4 className="text-center font-semibold mb-4">{currentScenario.title}</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Primal side */}
          <div className="text-center">
            <div className={`p-6 rounded-lg border-2 ${
              currentScenario.primal.active ? 'bg-blue-50 border-blue-500' : 'bg-gray-100 border-gray-300'
            }`}>
              <p className="font-semibold mb-2">Primal</p>
              {currentScenario.primal.var && (
                <>
                  <p className="text-2xl font-bold">
                    {currentScenario.primal.var} = {currentScenario.primal.value}
                  </p>
                  <p className="text-sm mt-1">
                    {currentScenario.primal.active ? 'Variável básica' : 'Variável não-básica'}
                  </p>
                </>
              )}
              {currentScenario.primal.constraint && (
                <>
                  <p className="text-lg font-mono">{currentScenario.primal.constraint}</p>
                  <p className="text-sm mt-1">
                    Folga: {currentScenario.primal.slack}
                    {currentScenario.primal.tight && ' (ativa)'}
                  </p>
                </>
              )}
            </div>
          </div>
          
          {/* Relationship */}
          <div className="flex justify-center">
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-4 mb-2">
                <ArrowRight className="w-8 h-8 text-yellow-700" />
              </div>
              <p className="text-sm font-semibold">Implica</p>
            </div>
          </div>
          
          {/* Dual side */}
          <div className="text-center">
            <div className={`p-6 rounded-lg border-2 ${
              currentScenario.dual.active ? 'bg-green-50 border-green-500' : 'bg-gray-100 border-gray-300'
            }`}>
              <p className="font-semibold mb-2">Dual</p>
              {currentScenario.dual.var && (
                <>
                  <p className="text-2xl font-bold">
                    {currentScenario.dual.var} = {currentScenario.dual.value}
                  </p>
                  <p className="text-sm mt-1">
                    {currentScenario.dual.active ? 'Variável positiva' : 'Variável zero'}
                  </p>
                </>
              )}
              {currentScenario.dual.constraint && (
                <>
                  <p className="text-lg font-mono">{currentScenario.dual.constraint}</p>
                  <p className="text-sm mt-1">
                    Folga: {currentScenario.dual.slack}
                    {currentScenario.dual.tight && ' (igualdade)'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-sm font-semibold text-blue-900">
            {currentScenario.explanation}
          </p>
        </div>
      </div>
      
      {/* Mathematical formulation */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-semibold mb-2">Formulação Matemática</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold mb-1">Condição 1:</p>
            <p>x*ⱼ × (y*A - c)ⱼ = 0</p>
            <p className="text-xs text-gray-600 mt-1">Para cada variável j</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold mb-1">Condição 2:</p>
            <p>y*ᵢ × (Ax* - b)ᵢ = 0</p>
            <p className="text-xs text-gray-600 mt-1">Para cada restrição i</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Visualization for Economic Equilibrium
const EconomicEquilibriumVisualization: React.FC<VisualizationProps> = ({ primal, dual }) => {
  const [showFlow, setShowFlow] = useState(false);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Equilíbrio Econômico</h3>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        {/* Economic flow diagram */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Producer */}
            <div className="text-center">
              <div className="bg-blue-100 rounded-lg p-6 border-2 border-blue-500">
                <BarChart3 className="w-12 h-12 text-blue-700 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Produtor</h4>
                <p className="text-sm mb-2">Maximizar lucro</p>
                {primal.isMaximization && (
                  <div className="bg-white rounded p-2 mt-2">
                    <p className="text-xs">Produtos: x₁, x₂</p>
                    <p className="text-xs">Lucros: c₁, c₂</p>
                  </div>
                )}
              </div>
              {showFlow && (
                <div className="mt-4 bg-green-100 rounded p-3">
                  <p className="text-sm font-semibold">Lucro Ótimo</p>
                  <p className="text-2xl font-bold text-green-700">z* = 42</p>
                </div>
              )}
            </div>
            
            {/* Market equilibrium */}
            <div className="text-center">
              <div className="bg-yellow-100 rounded-lg p-6 border-2 border-yellow-500">
                <div className="relative">
                  <DollarSign className="w-12 h-12 text-yellow-700 mx-auto mb-2" />
                  {showFlow && (
                    <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <h4 className="font-semibold mb-2">Mercado</h4>
                <p className="text-sm mb-2">Equilíbrio de preços</p>
                <div className="bg-white rounded p-2 mt-2">
                  <p className="text-xs">Preços sombra: y₁, y₂</p>
                  <p className="text-xs">Recursos: b₁, b₂</p>
                </div>
              </div>
              {showFlow && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-yellow-700">
                    No equilíbrio: z* = w*
                  </p>
                </div>
              )}
            </div>
            
            {/* Resource owner */}
            <div className="text-center">
              <div className="bg-green-100 rounded-lg p-6 border-2 border-green-500">
                <TrendingUp className="w-12 h-12 text-green-700 mx-auto mb-2" />
                <h4 className="font-semibold mb-2">Dono dos Recursos</h4>
                <p className="text-sm mb-2">Minimizar custo de oportunidade</p>
                {!primal.isMaximization && (
                  <div className="bg-white rounded p-2 mt-2">
                    <p className="text-xs">Recursos: y₁, y₂</p>
                    <p className="text-xs">Valores: b₁, b₂</p>
                  </div>
                )}
              </div>
              {showFlow && (
                <div className="mt-4 bg-green-100 rounded p-3">
                  <p className="text-sm font-semibold">Custo de Oportunidade</p>
                  <p className="text-2xl font-bold text-green-700">w* = 42</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Flow arrows */}
          {showFlow && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" style={{ position: 'absolute', top: 0, left: 0 }}>
                {/* Arrow from producer to market */}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                  </marker>
                </defs>
                <line x1="33%" y1="50%" x2="45%" y2="50%" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <line x1="55%" y1="50%" x2="67%" y2="50%" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead)" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <Button
            onClick={() => setShowFlow(!showFlow)}
            variant={showFlow ? "default" : "outline"}
          >
            {showFlow ? "Ocultar" : "Mostrar"} Fluxo Econômico
          </Button>
        </div>
        
        {/* Economic interpretations */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h5 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-500" />
              Interpretação dos Preços Sombra
            </h5>
            <ul className="text-sm space-y-1">
              <li>• y₁ = preço implícito do recurso 1</li>
              <li>• y₂ = preço implícito do recurso 2</li>
              <li>• Representa o valor marginal de cada recurso</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <h5 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-green-500" />
              Condições de Equilíbrio
            </h5>
            <ul className="text-sm space-y-1">
              <li>• Lucro do produtor = Custo de oportunidade</li>
              <li>• Recursos escassos têm preço positivo</li>
              <li>• Recursos abundantes têm preço zero</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { ArrowRight, ArrowUp, ArrowDown, Infinity, XCircle, CheckCircle, AlertCircle } from 'lucide-react';

export const DualityTheoremsVisualization: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualização dos Teoremas de Dualidade</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weak">
          <TabsList className="grid grid-cols-3 gap-2">
            <TabsTrigger value="weak">Dualidade Fraca</TabsTrigger>
            <TabsTrigger value="special">Casos Especiais</TabsTrigger>
            <TabsTrigger value="sensitivity">Sensibilidade</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weak">
            <WeakDualityVisualization />
          </TabsContent>
          
          <TabsContent value="special">
            <SpecialCasesVisualization />
          </TabsContent>
          
          <TabsContent value="sensitivity">
            <SensitivityVisualization />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Weak Duality Theorem Visualization
const WeakDualityVisualization: React.FC = () => {
  const [showProof, setShowProof] = useState(false);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Teorema da Dualidade Fraca</h3>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        {/* Visual representation of feasible solutions */}
        <div className="mb-6">
          <svg viewBox="0 0 400 250" className="w-full max-w-2xl mx-auto">
            {/* Primal values (MAX) */}
            <g>
              <text x="50" y="30" fontSize="14" fontWeight="bold">Primal (MAX)</text>
              
              {/* Feasible primal values */}
              <circle cx="60" cy="60" r="4" fill="rgb(59, 130, 246)" />
              <text x="70" y="65" fontSize="12">cx₁ = 20</text>
              
              <circle cx="60" cy="90" r="4" fill="rgb(59, 130, 246)" />
              <text x="70" y="95" fontSize="12">cx₂ = 35</text>
              
              <circle cx="60" cy="120" r="4" fill="rgb(59, 130, 246)" />
              <text x="70" y="125" fontSize="12">cx₃ = 38</text>
              
              <circle cx="60" cy="150" r="6" fill="rgb(34, 197, 94)" stroke="white" strokeWidth="2" />
              <text x="70" y="155" fontSize="12" fontWeight="bold">cx* = 42</text>
              
              {/* Upper bound line */}
              <line x1="150" y1="40" x2="150" y2="200" stroke="rgb(239, 68, 68)" strokeWidth="2" strokeDasharray="5,5" />
              <text x="160" y="50" fontSize="12" fill="rgb(239, 68, 68)">cx ≤ yb</text>
            </g>
            
            {/* Dual values (MIN) */}
            <g>
              <text x="250" y="30" fontSize="14" fontWeight="bold">Dual (MIN)</text>
              
              {/* Feasible dual values */}
              <circle cx="340" cy="60" r="4" fill="rgb(168, 85, 247)" />
              <text x="270" y="65" fontSize="12">yb₁ = 60</text>
              
              <circle cx="340" cy="90" r="4" fill="rgb(168, 85, 247)" />
              <text x="270" y="95" fontSize="12">yb₂ = 50</text>
              
              <circle cx="340" cy="120" r="4" fill="rgb(168, 85, 247)" />
              <text x="270" y="125" fontSize="12">yb₃ = 45</text>
              
              <circle cx="340" cy="150" r="6" fill="rgb(34, 197, 94)" stroke="white" strokeWidth="2" />
              <text x="270" y="155" fontSize="12" fontWeight="bold">y*b = 42</text>
            </g>
            
            {/* Arrows showing relationships */}
            <g>
              <defs>
                <marker id="arrowhead-weak" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                </marker>
              </defs>
              
              {/* Arrows from primal to bound */}
              <line x1="130" y1="60" x2="145" y2="60" stroke="#666" strokeWidth="1" markerEnd="url(#arrowhead-weak)" opacity="0.5" />
              <line x1="130" y1="90" x2="145" y2="90" stroke="#666" strokeWidth="1" markerEnd="url(#arrowhead-weak)" opacity="0.5" />
              <line x1="130" y1="120" x2="145" y2="120" stroke="#666" strokeWidth="1" markerEnd="url(#arrowhead-weak)" opacity="0.5" />
              <line x1="130" y1="150" x2="145" y2="150" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead-weak)" />
              
              {/* Arrows from bound to dual */}
              <line x1="155" y1="60" x2="265" y2="60" stroke="#666" strokeWidth="1" markerEnd="url(#arrowhead-weak)" opacity="0.5" />
              <line x1="155" y1="90" x2="265" y2="90" stroke="#666" strokeWidth="1" markerEnd="url(#arrowhead-weak)" opacity="0.5" />
              <line x1="155" y1="120" x2="265" y2="120" stroke="#666" strokeWidth="1" markerEnd="url(#arrowhead-weak)" opacity="0.5" />
              <line x1="155" y1="150" x2="265" y2="150" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead-weak)" />
            </g>
            
            {/* Optimal point highlight */}
            <rect x="40" y="140" width="320" height="25" fill="rgba(34, 197, 94, 0.1)" stroke="rgb(34, 197, 94)" strokeWidth="2" rx="5" />
          </svg>
        </div>
        
        {/* Explanation */}
        <div className="text-center mb-4">
          <p className="text-lg font-semibold">
            Para qualquer solução viável: <span className="text-blue-600">cx</span> ≤ <span className="text-purple-600">yb</span>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            No ótimo: cx* = y*b (Dualidade Forte)
          </p>
        </div>
        
        {/* Show proof button */}
        <div className="text-center">
          <Button
            onClick={() => setShowProof(!showProof)}
            variant="outline"
            size="sm"
          >
            {showProof ? "Ocultar" : "Mostrar"} Demonstração
          </Button>
        </div>
        
        {showProof && (
          <div className="mt-4 bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-2">Demonstração Visual</h4>
            <div className="space-y-2 text-sm">
              <p>1. Seja x viável para o primal: Ax ≤ b, x ≥ 0</p>
              <p>2. Seja y viável para o dual: yA ≥ c, y ≥ 0</p>
              <p>3. Multiplicando: y(Ax) ≤ yb (pois y ≥ 0)</p>
              <p>4. Como yA ≥ c: (yA)x ≥ cx</p>
              <p>5. Mas y(Ax) = (yA)x, então: cx ≤ yb ✓</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Special Cases Visualization
const SpecialCasesVisualization: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState(0);
  
  const cases = [
    {
      title: "Primal Ilimitado → Dual Inviável",
      primal: { status: "unbounded", icon: Infinity, color: "blue" },
      dual: { status: "infeasible", icon: XCircle, color: "red" },
      explanation: "Se o primal pode crescer indefinidamente, não existe limite superior finito, logo o dual não tem solução viável"
    },
    {
      title: "Primal Inviável → Dual Ilimitado ou Inviável",
      primal: { status: "infeasible", icon: XCircle, color: "red" },
      dual: { status: "unbounded/infeasible", icon: Infinity, color: "orange" },
      explanation: "Se o primal não tem solução viável, o dual pode ser ilimitado ou também inviável"
    },
    {
      title: "Ambos Viáveis → Ambos têm Ótimo",
      primal: { status: "optimal", icon: CheckCircle, color: "green" },
      dual: { status: "optimal", icon: CheckCircle, color: "green" },
      explanation: "Se ambos têm soluções viáveis, ambos têm solução ótima com mesmo valor objetivo"
    },
    {
      title: "Ambos Inviáveis (Caso Raro)",
      primal: { status: "infeasible", icon: XCircle, color: "red" },
      dual: { status: "infeasible", icon: XCircle, color: "red" },
      explanation: "Em casos especiais, tanto o primal quanto o dual podem ser inviáveis simultaneamente"
    }
  ];
  
  const currentCase = cases[selectedCase];
  const IconPrimal = currentCase.primal.icon;
  const IconDual = currentCase.dual.icon;
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Casos Especiais da Dualidade</h3>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        {/* Case selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {cases.map((c, i) => (
            <Button
              key={i}
              size="sm"
              variant={selectedCase === i ? "default" : "outline"}
              onClick={() => setSelectedCase(i)}
            >
              Caso {i + 1}
            </Button>
          ))}
        </div>
        
        <h4 className="text-center font-semibold mb-4">{currentCase.title}</h4>
        
        {/* Visual representation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-6">
          {/* Primal */}
          <div className="text-center">
            <div className={`p-8 rounded-lg bg-${currentCase.primal.color}-50 border-2 border-${currentCase.primal.color}-500`}>
              <IconPrimal className={`w-16 h-16 text-${currentCase.primal.color}-600 mx-auto mb-2`} />
              <p className="font-semibold">Primal</p>
              <p className="text-sm mt-1">{currentCase.primal.status}</p>
            </div>
          </div>
          
          {/* Implication */}
          <div className="flex justify-center">
            <div className="text-center">
              <ArrowRight className="w-12 h-12 text-gray-500 mx-auto" />
              <p className="text-sm font-semibold mt-2">Implica</p>
            </div>
          </div>
          
          {/* Dual */}
          <div className="text-center">
            <div className={`p-8 rounded-lg bg-${currentCase.dual.color}-50 border-2 border-${currentCase.dual.color}-500`}>
              <IconDual className={`w-16 h-16 text-${currentCase.dual.color}-600 mx-auto mb-2`} />
              <p className="font-semibold">Dual</p>
              <p className="text-sm mt-1">{currentCase.dual.status}</p>
            </div>
          </div>
        </div>
        
        {/* Explanation */}
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm font-semibold text-blue-900">
            {currentCase.explanation}
          </p>
        </div>
        
        {/* Graphical example for selected case */}
        {selectedCase === 0 && (
          <div className="mt-6 bg-white p-4 rounded-lg border">
            <h5 className="font-semibold mb-3">Exemplo Visual: Primal Ilimitado</h5>
            <svg viewBox="0 0 300 200" className="w-full max-w-md mx-auto">
              {/* Axes */}
              <line x1="40" y1="160" x2="260" y2="160" stroke="black" strokeWidth="2" />
              <line x1="40" y1="160" x2="40" y2="20" stroke="black" strokeWidth="2" />
              
              {/* Unbounded feasible region */}
              <path
                d="M 40 160 L 40 80 L 100 50 L 200 30 L 260 20 L 260 160 Z"
                fill="rgba(59, 130, 246, 0.2)"
                stroke="rgb(59, 130, 246)"
                strokeWidth="2"
              />
              
              {/* Direction of unboundedness */}
              <defs>
                <marker id="arrowhead-unbound" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="rgb(239, 68, 68)" />
                </marker>
              </defs>
              <line
                x1="100"
                y1="100"
                x2="220"
                y2="40"
                stroke="rgb(239, 68, 68)"
                strokeWidth="3"
                markerEnd="url(#arrowhead-unbound)"
              />
              
              <text x="150" y="185" textAnchor="middle" fontSize="12">x₁</text>
              <text x="20" y="90" fontSize="12">x₂</text>
              <text x="230" y="35" fontSize="12" fill="rgb(239, 68, 68)">z → ∞</text>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

// Sensitivity Analysis Visualization
const SensitivityVisualization: React.FC = () => {
  const [parameter, setParameter] = useState<'objective' | 'rhs'>('objective');
  const [changeAmount, setChangeAmount] = useState(0);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Análise de Sensibilidade via Dualidade</h3>
      
      <div className="bg-gray-50 p-6 rounded-lg">
        {/* Parameter selector */}
        <div className="flex justify-center gap-4 mb-6">
          <Button
            variant={parameter === 'objective' ? "default" : "outline"}
            onClick={() => setParameter('objective')}
          >
            Coeficientes do Objetivo
          </Button>
          <Button
            variant={parameter === 'rhs' ? "default" : "outline"}
            onClick={() => setParameter('rhs')}
          >
            Lados Direitos (RHS)
          </Button>
        </div>
        
        {parameter === 'objective' ? (
          <ObjectiveSensitivity changeAmount={changeAmount} setChangeAmount={setChangeAmount} />
        ) : (
          <RHSSensitivity changeAmount={changeAmount} setChangeAmount={setChangeAmount} />
        )}
      </div>
    </div>
  );
};

// Objective Coefficient Sensitivity
const ObjectiveSensitivity: React.FC<{
  changeAmount: number;
  setChangeAmount: (value: number) => void;
}> = ({ changeAmount, setChangeAmount }) => {
  const baseCoeff = 3;
  const newCoeff = baseCoeff + changeAmount;
  const shadowPrice = 2.5;
  
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-center">Mudança em c₁: {baseCoeff} → {newCoeff}</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primal effect */}
        <div className="bg-white p-4 rounded-lg border">
          <h5 className="font-semibold mb-3">Efeito no Primal</h5>
          <div className="space-y-2">
            <p className="text-sm">Função objetivo original:</p>
            <p className="font-mono bg-gray-100 p-2 rounded">max z = 3x₁ + 2x₂</p>
            <ArrowDown className="w-6 h-6 mx-auto my-2 text-gray-500" />
            <p className="text-sm">Nova função objetivo:</p>
            <p className="font-mono bg-blue-100 p-2 rounded">max z = {newCoeff}x₁ + 2x₂</p>
          </div>
        </div>
        
        {/* Dual effect */}
        <div className="bg-white p-4 rounded-lg border">
          <h5 className="font-semibold mb-3">Efeito no Dual</h5>
          <div className="space-y-2">
            <p className="text-sm">Restrição dual original:</p>
            <p className="font-mono bg-gray-100 p-2 rounded">2y₁ + y₂ ≥ 3</p>
            <ArrowDown className="w-6 h-6 mx-auto my-2 text-gray-500" />
            <p className="text-sm">Nova restrição dual:</p>
            <p className="font-mono bg-green-100 p-2 rounded">2y₁ + y₂ ≥ {newCoeff}</p>
          </div>
        </div>
      </div>
      
      {/* Slider control */}
      <div className="mt-4 bg-white p-4 rounded-lg border">
        <label className="block text-sm font-semibold mb-2">
          Ajustar mudança em c₁: {changeAmount > 0 ? '+' : ''}{changeAmount}
        </label>
        <input
          type="range"
          min="-2"
          max="2"
          step="0.5"
          value={changeAmount}
          onChange={(e) => setChangeAmount(parseFloat(e.target.value))}
          className="w-full"
        />
        
        {/* Feasibility check */}
        <div className="mt-4 text-center">
          {newCoeff <= shadowPrice * 2 + 1 ? (
            <div className="text-green-600">
              <CheckCircle className="w-6 h-6 inline mr-2" />
              Base atual permanece ótima
            </div>
          ) : (
            <div className="text-red-600">
              <XCircle className="w-6 h-6 inline mr-2" />
              Mudança de base necessária
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// RHS Sensitivity
const RHSSensitivity: React.FC<{
  changeAmount: number;
  setChangeAmount: (value: number) => void;
}> = ({ changeAmount, setChangeAmount }) => {
  const baseRHS = 10;
  const newRHS = baseRHS + changeAmount;
  const shadowPrice = 2.5;
  const optimalChange = shadowPrice * changeAmount;
  
  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-center">Mudança em b₁: {baseRHS} → {newRHS}</h4>
      
      <div className="bg-white p-4 rounded-lg border">
        <h5 className="font-semibold mb-3">Impacto via Preço Sombra</h5>
        
        {/* Visual representation */}
        <svg viewBox="0 0 400 200" className="w-full max-w-lg mx-auto">
          {/* Axes */}
          <line x1="50" y1="150" x2="350" y2="150" stroke="black" strokeWidth="2" />
          <line x1="200" y1="30" x2="200" y2="170" stroke="black" strokeWidth="2" />
          
          {/* Labels */}
          <text x="200" y="190" textAnchor="middle" fontSize="12">Δb₁</text>
          <text x="30" y="90" textAnchor="middle" fontSize="12">Δz*</text>
          
          {/* Shadow price line */}
          <line
            x1="50"
            y1={150 - shadowPrice * 30}
            x2="350"
            y2={150 + shadowPrice * 30}
            stroke="rgb(59, 130, 246)"
            strokeWidth="3"
          />
          
          {/* Current change point */}
          <circle
            cx={200 + changeAmount * 30}
            cy={150 - optimalChange * 10}
            r="6"
            fill="rgb(239, 68, 68)"
          />
          
          {/* Reference lines */}
          <line
            x1={200 + changeAmount * 30}
            y1="150"
            x2={200 + changeAmount * 30}
            y2={150 - optimalChange * 10}
            stroke="gray"
            strokeDasharray="2,2"
          />
          <line
            x1="200"
            y1={150 - optimalChange * 10}
            x2={200 + changeAmount * 30}
            y2={150 - optimalChange * 10}
            stroke="gray"
            strokeDasharray="2,2"
          />
          
          {/* Annotations */}
          <text x={210 + changeAmount * 30} y="165" fontSize="10">
            {changeAmount > 0 ? '+' : ''}{changeAmount}
          </text>
          <text x="160" y={145 - optimalChange * 10} fontSize="10">
            {optimalChange > 0 ? '+' : ''}{optimalChange.toFixed(1)}
          </text>
          
          {/* Shadow price label */}
          <text x="300" y="50" fontSize="12" fill="rgb(59, 130, 246)">
            y₁ = {shadowPrice}
          </text>
        </svg>
        
        {/* Calculation display */}
        <div className="mt-4 bg-gray-100 p-3 rounded text-center">
          <p className="font-mono">
            Δz* = y₁ × Δb₁ = {shadowPrice} × {changeAmount} = {optimalChange.toFixed(1)}
          </p>
        </div>
      </div>
      
      {/* Slider control */}
      <div className="bg-white p-4 rounded-lg border">
        <label className="block text-sm font-semibold mb-2">
          Ajustar mudança em b₁: {changeAmount > 0 ? '+' : ''}{changeAmount}
        </label>
        <input
          type="range"
          min="-3"
          max="3"
          step="0.5"
          value={changeAmount}
          onChange={(e) => setChangeAmount(parseFloat(e.target.value))}
          className="w-full"
        />
        
        {/* Validity range */}
        <div className="mt-4 text-center text-sm">
          <p className="text-gray-600">
            Intervalo de validade: b₁ ∈ [{baseRHS - 2}, {baseRHS + 3}]
          </p>
          {Math.abs(changeAmount) <= 2 ? (
            <div className="text-green-600 mt-2">
              <CheckCircle className="w-5 h-5 inline mr-1" />
              Dentro do intervalo de validade
            </div>
          ) : (
            <div className="text-orange-600 mt-2">
              <AlertCircle className="w-5 h-5 inline mr-1" />
              Fora do intervalo - análise aproximada
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
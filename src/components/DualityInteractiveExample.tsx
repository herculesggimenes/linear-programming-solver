import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

export const DualityInteractiveExample: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const steps = [
    {
      title: "Problema Primal",
      description: "Empresa produz dois produtos usando três recursos limitados",
      highlight: "primal"
    },
    {
      title: "Construção do Dual",
      description: "Cada recurso recebe um preço sombra (variável dual)",
      highlight: "dual-vars"
    },
    {
      title: "Interpretação Econômica",
      description: "Preços sombra representam o valor marginal de cada recurso",
      highlight: "shadow-prices"
    },
    {
      title: "Solução Ótima",
      description: "No ótimo, lucro total = custo de oportunidade dos recursos",
      highlight: "optimal"
    },
    {
      title: "Análise de Sensibilidade",
      description: "Mudanças nos recursos afetam o lucro conforme os preços sombra",
      highlight: "sensitivity"
    }
  ];
  
  React.useEffect(() => {
    if (isPlaying && step < steps.length - 1) {
      const timer = setTimeout(() => {
        setStep(step + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (isPlaying && step === steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, step]);
  
  const currentStep = steps[step];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exemplo Interativo: Problema de Produção</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Control buttons */}
          <div className="flex justify-center gap-4">
            <Button
              size="sm"
              variant={isPlaying ? "secondary" : "default"}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? "Pausar" : "Reproduzir"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setStep(0);
                setIsPlaying(false);
              }}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
          
          {/* Current step info */}
          <div className="text-center">
            <h3 className="text-lg font-semibold">{currentStep.title}</h3>
            <p className="text-sm text-gray-600">{currentStep.description}</p>
          </div>
          
          {/* Interactive visualization */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <InteractiveVisualization step={step} highlight={currentStep.highlight} />
          </div>
          
          {/* Step navigation */}
          <div className="flex justify-center gap-2">
            {steps.map((_, i) => (
              <button
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === step ? 'bg-blue-600 w-8' : 'bg-gray-300'
                }`}
                onClick={() => setStep(i)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Interactive visualization component
const InteractiveVisualization: React.FC<{ step: number; highlight: string }> = ({ step, highlight }) => {
  return (
    <div className="relative">
      <svg viewBox="0 0 600 400" className="w-full">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="600" height="400" fill="url(#grid)" />
        
        {/* Primal problem visualization */}
        <g className={`transition-opacity duration-500 ${highlight === 'primal' ? 'opacity-100' : 'opacity-30'}`}>
          <rect x="50" y="50" width="200" height="150" fill="rgba(59, 130, 246, 0.2)" stroke="rgb(59, 130, 246)" strokeWidth="2" rx="10" />
          <text x="150" y="30" textAnchor="middle" fontSize="16" fontWeight="bold">Problema Primal</text>
          
          {/* Products */}
          <circle cx="100" cy="100" r="20" fill="rgb(59, 130, 246)" />
          <text x="100" y="105" textAnchor="middle" fill="white" fontSize="12">P1</text>
          <circle cx="200" cy="100" r="20" fill="rgb(59, 130, 246)" />
          <text x="200" y="105" textAnchor="middle" fill="white" fontSize="12">P2</text>
          
          {/* Resources */}
          <rect x="70" y="140" width="160" height="40" fill="rgba(239, 68, 68, 0.2)" stroke="rgb(239, 68, 68)" strokeWidth="1" rx="5" />
          <text x="150" y="165" textAnchor="middle" fontSize="12">Recursos: R1, R2, R3</text>
        </g>
        
        {/* Dual variables */}
        {step >= 1 && (
          <g className={`transition-opacity duration-500 ${highlight === 'dual-vars' ? 'opacity-100' : 'opacity-30'}`}>
            <rect x="350" y="50" width="200" height="150" fill="rgba(34, 197, 94, 0.2)" stroke="rgb(34, 197, 94)" strokeWidth="2" rx="10" />
            <text x="450" y="30" textAnchor="middle" fontSize="16" fontWeight="bold">Problema Dual</text>
            
            {/* Shadow prices */}
            <g transform="translate(370, 80)">
              <rect width="40" height="30" fill="rgb(168, 85, 247)" rx="5" />
              <text x="20" y="20" textAnchor="middle" fill="white" fontSize="10">y₁</text>
            </g>
            <g transform="translate(430, 80)">
              <rect width="40" height="30" fill="rgb(168, 85, 247)" rx="5" />
              <text x="20" y="20" textAnchor="middle" fill="white" fontSize="10">y₂</text>
            </g>
            <g transform="translate(490, 80)">
              <rect width="40" height="30" fill="rgb(168, 85, 247)" rx="5" />
              <text x="20" y="20" textAnchor="middle" fill="white" fontSize="10">y₃</text>
            </g>
            
            <text x="450" y="140" textAnchor="middle" fontSize="12">Preços dos Recursos</text>
          </g>
        )}
        
        {/* Connection arrows */}
        {step >= 2 && (
          <g className={`transition-opacity duration-500 ${highlight === 'shadow-prices' ? 'opacity-100' : 'opacity-30'}`}>
            <defs>
              <marker id="arrowhead-example" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
              </marker>
            </defs>
            
            <line x1="250" y1="125" x2="350" y2="125" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead-example)" />
            
            {/* Shadow price values */}
            <text x="300" y="120" textAnchor="middle" fontSize="12" fill="#666">Dualidade</text>
            
            <g transform="translate(350, 160)">
              <text x="40" y="0" fontSize="11">y₁ = 2.5</text>
              <text x="100" y="0" fontSize="11">y₂ = 1.8</text>
              <text x="160" y="0" fontSize="11">y₃ = 0</text>
            </g>
          </g>
        )}
        
        {/* Optimal solution */}
        {step >= 3 && (
          <g className={`transition-opacity duration-500 ${highlight === 'optimal' ? 'opacity-100' : 'opacity-30'}`}>
            <rect x="200" y="250" width="200" height="80" fill="rgba(251, 191, 36, 0.2)" stroke="rgb(251, 191, 36)" strokeWidth="2" rx="10" />
            <text x="300" y="270" textAnchor="middle" fontSize="14" fontWeight="bold">Solução Ótima</text>
            <text x="300" y="295" textAnchor="middle" fontSize="12">z* = 42 = w*</text>
            <text x="300" y="315" textAnchor="middle" fontSize="11" fill="#666">Lucro = Custo de Oportunidade</text>
          </g>
        )}
        
        {/* Sensitivity analysis */}
        {step >= 4 && (
          <g className={`transition-opacity duration-500 ${highlight === 'sensitivity' ? 'opacity-100' : 'opacity-30'}`}>
            <g transform="translate(50, 250)">
              <rect width="120" height="60" fill="rgba(99, 102, 241, 0.2)" stroke="rgb(99, 102, 241)" strokeWidth="1" rx="5" />
              <text x="60" y="20" textAnchor="middle" fontSize="11" fontWeight="bold">+1 unidade R1</text>
              <text x="60" y="35" textAnchor="middle" fontSize="10">Δz* = +2.5</text>
              <text x="60" y="50" textAnchor="middle" fontSize="10">(= y₁)</text>
            </g>
            
            <g transform="translate(430, 250)">
              <rect width="120" height="60" fill="rgba(236, 72, 153, 0.2)" stroke="rgb(236, 72, 153)" strokeWidth="1" rx="5" />
              <text x="60" y="20" textAnchor="middle" fontSize="11" fontWeight="bold">+1 unidade R3</text>
              <text x="60" y="35" textAnchor="middle" fontSize="10">Δz* = 0</text>
              <text x="60" y="50" textAnchor="middle" fontSize="10">(recurso abundante)</text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
};
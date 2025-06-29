import React, { useState } from 'react';
import type { LinearProgram } from '@/components/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ChevronRight, ChevronLeft, Factory, Package, DollarSign, TrendingUp, BarChart3, ArrowRight, ArrowDown } from 'lucide-react';

interface DualityNarrativeProps {
  primal: LinearProgram;
  dual: LinearProgram;
}

export const DualityNarrative: React.FC<DualityNarrativeProps> = ({ primal, dual }) => {
  const [currentChapter, setCurrentChapter] = useState(0);
  
  // Create narrative based on the specific problem
  const narrative = createNarrative(primal, dual);
  
  const chapter = narrative.chapters[currentChapter];
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>A História da Dualidade: {narrative.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2">
          {narrative.chapters.map((_, index) => (
            <div
              key={index}
              className={`h-2 transition-all duration-300 ${
                index === currentChapter ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300'
              } rounded-full cursor-pointer`}
              onClick={() => setCurrentChapter(index)}
            />
          ))}
        </div>
        
        {/* Chapter content */}
        <div className="min-h-[400px] space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">{chapter.title}</h3>
            <p className="text-gray-600">{chapter.subtitle}</p>
          </div>
          
          {/* Visualization specific to this chapter */}
          <div className="bg-gray-50 rounded-lg p-6">
            <ChapterVisualization
              chapter={chapter}
              primal={primal}
              dual={dual}
              chapterIndex={currentChapter}
            />
          </div>
          
          {/* Narrative text */}
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 leading-relaxed">{chapter.narrative}</p>
          </div>
          
          {/* Key insight */}
          {chapter.insight && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="font-semibold text-blue-900 mb-1">💡 Insight Principal</p>
              <p className="text-blue-800">{chapter.insight}</p>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
            disabled={currentChapter === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>
          
          <span className="text-sm text-gray-500">
            Capítulo {currentChapter + 1} de {narrative.chapters.length}
          </span>
          
          <Button
            variant="outline"
            onClick={() => setCurrentChapter(Math.min(narrative.chapters.length - 1, currentChapter + 1))}
            disabled={currentChapter === narrative.chapters.length - 1}
          >
            Próximo
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Create narrative based on problem type
function createNarrative(primal: LinearProgram, dual: LinearProgram): Narrative {
  const isMaximization = primal.isMaximization;
  const numVariables = primal.variables.length;
  const numConstraints = primal.constraints.length;
  
  // All narratives now include conversion calculations as first chapters
  const conversionChapters: Chapter[] = [
    {
      title: "Regras de Conversão Primal-Dual",
      subtitle: "Fundamentos teóricos da dualidade",
      narrative: `A teoria da dualidade estabelece que todo problema de programação linear possui um problema dual correspondente. ${isMaximization ? 'Como temos um problema de MAXIMIZAÇÃO, o dual será de MINIMIZAÇÃO.' : 'Como temos um problema de MINIMIZAÇÃO, o dual será de MAXIMIZAÇÃO.'} Esta relação não é arbitrária - ela reflete uma profunda simetria matemática.`,
      visualization: 'conversion-rules',
      insight: "Primal MAX ↔ Dual MIN | Primal MIN ↔ Dual MAX"
    },
    {
      title: "Passo 1: Variáveis Duais",
      subtitle: "Uma variável dual para cada restrição primal",
      narrative: `O problema primal tem ${numConstraints} restrições, então o dual terá ${numConstraints} variáveis: ${dual.variables.join(', ')}. Cada variável dual representa o "preço sombra" ou "valor marginal" da restrição correspondente.`,
      visualization: 'dual-variables',
      insight: `${numConstraints} restrições primais → ${numConstraints} variáveis duais`
    },
    {
      title: "Passo 2: Função Objetivo Dual",
      subtitle: "RHS das restrições primais → Coeficientes do objetivo dual",
      narrative: `Os coeficientes da função objetivo dual vêm dos valores do lado direito (RHS) das restrições primais. Temos: ${primal.constraints.map((c, i) => `RHS${i+1} = ${c.rhs}`).join(', ')}. Portanto, a função objetivo dual é: ${dual.isMaximization ? 'Maximizar' : 'Minimizar'} ${dual.objective.map((c, i) => `${c}y${i+1}`).join(' + ')}.`,
      visualization: 'objective-conversion',
      insight: "Os recursos disponíveis no primal se tornam os coeficientes a otimizar no dual"
    },
    {
      title: "Passo 3: Restrições Duais",
      subtitle: "Uma restrição dual para cada variável primal",
      narrative: `O problema primal tem ${numVariables} variáveis, então o dual terá ${numVariables} restrições. Cada restrição dual é formada pelos coeficientes da coluna correspondente na matriz primal. ${isMaximization ? 'Como o primal é MAX, as restrições duais serão ≥.' : 'Como o primal é MIN, as restrições duais serão ≤.'}`,
      visualization: 'constraints-conversion',
      insight: `${numVariables} variáveis primais → ${numVariables} restrições duais`
    },
    {
      title: "Passo 4: Sinais e Restrições",
      subtitle: "Regras de conversão para tipos de restrições",
      narrative: `As regras de conversão dependem do tipo de cada restrição e variável:\n` +
        primal.constraints.map((c, i) => {
          if (c.operator === '<=') return `• Restrição ${i+1} (≤): y${i+1} ≥ 0`;
          if (c.operator === '>=') return `• Restrição ${i+1} (≥): y${i+1} ≤ 0`;
          return `• Restrição ${i+1} (=): y${i+1} irrestrita`;
        }).join('\n'),
      visualization: 'sign-rules',
      insight: "≤ → dual ≥ 0 | ≥ → dual ≤ 0 | = → dual irrestrita"
    }
  ];
  
  // Detect problem type based on structure
  const problemType = detectProblemType(primal);
  
  // Get problem-specific chapters
  let specificChapters: Chapter[] = [];
  switch (problemType) {
    case 'production':
      specificChapters = createProductionChapters(primal);
      break;
    case 'diet':
      specificChapters = createDietChapters(primal);
      break;
    default:
      specificChapters = createGenericChapters();
  }
  
  // Add theorem chapters at the end
  const theoremChapters: Chapter[] = [
    {
      title: "Teorema da Dualidade Fraca",
      subtitle: "Limitantes entre primal e dual",
      narrative: `Para qualquer solução viável x do primal e y do dual: ${isMaximization ? 'cx ≤ yb' : 'cx ≥ yb'}. Isso significa que ${isMaximization ? 'qualquer solução dual viável fornece um limite superior para o primal' : 'qualquer solução dual viável fornece um limite inferior para o primal'}. Este teorema é fundamental para algoritmos de otimização.`,
      visualization: 'weak-duality',
      insight: "Soluções viáveis do dual limitam o valor ótimo do primal"
    },
    {
      title: "Teorema da Dualidade Forte",
      subtitle: "Igualdade no ótimo",
      narrative: `Se o primal tem solução ótima x*, então o dual tem solução ótima y* e cx* = y*b. Esta igualdade profunda significa que resolver um problema é equivalente a resolver o outro. No nosso caso, quando encontrarmos as soluções ótimas, seus valores objetivos serão idênticos.`,
      visualization: 'strong-duality',
      insight: "No ótimo: valor primal = valor dual (sempre!)"
    },
    {
      title: "Folga Complementar",
      subtitle: "Relação entre variáveis e restrições",
      narrative: `A condição de folga complementar estabelece relações "tudo ou nada":\n` +
        `• Se uma variável primal é positiva, a restrição dual correspondente é ativa (sem folga)\n` +
        `• Se uma restrição primal tem folga, a variável dual correspondente é zero\n` +
        `Esta propriedade conecta intimamente as soluções primal e dual.`,
      visualization: 'complementary-slackness',
      insight: "Atividade econômica só ocorre onde há escassez"
    }
  ];
  
  return {
    title: getProblemTitle(problemType),
    problemContext: getProblemContext(problemType, primal),
    chapters: [...conversionChapters, ...specificChapters, ...theoremChapters]
  };
}

// Detect problem type from structure
function detectProblemType(primal: LinearProgram): string {
  if (primal.isMaximization && primal.constraints.every(c => c.operator === '<=')) {
    return 'production';
  } else if (!primal.isMaximization && primal.constraints.every(c => c.operator === '>=')) {
    return 'diet';
  } else if (primal.constraints.some(c => c.operator === '=')) {
    return 'transportation';
  }
  return 'generic';
}

// Helper functions to get title and context
function getProblemTitle(type: string): string {
  switch (type) {
    case 'production': return "Problema de Produção";
    case 'diet': return "Problema da Dieta";
    case 'transportation': return "Problema de Transporte";
    default: return "Problema de Otimização";
  }
}

function getProblemContext(type: string, primal: LinearProgram): string {
  switch (type) {
    case 'production': 
      return "Uma empresa precisa decidir quanto produzir de cada produto para maximizar o lucro, respeitando limitações de recursos.";
    case 'diet': 
      return "Encontrar a combinação mais barata de alimentos que atenda aos requisitos nutricionais mínimos.";
    case 'transportation': 
      return "Otimizar o fluxo de produtos entre origens e destinos, respeitando capacidades e demandas.";
    default: 
      return `${primal.isMaximization ? 'Maximizar' : 'Minimizar'} um objetivo sujeito a restrições lineares.`;
  }
}

// Production problem chapters
function createProductionChapters(primal: LinearProgram): Chapter[] {
  return [
    {
      title: "Interpretação Econômica",
      subtitle: "O mercado de recursos",
      narrative: `Imagine uma fábrica que produz ${primal.variables.length} produtos. Um investidor quer comprar todos os recursos da fábrica. Quanto deve pagar por cada recurso? Os preços devem ser competitivos - altos o suficiente para compensar o lucro perdido, mas mínimos para o comprador.`,
      visualization: 'economic-interpretation',
      insight: "O dual representa a perspectiva do comprador de recursos"
    },
    {
      title: "Análise dos Preços Sombra",
      subtitle: "Valor marginal dos recursos",
      narrative: `Cada variável dual (y₁, y₂, ...) representa o preço sombra de um recurso - quanto o lucro aumentaria com uma unidade adicional daquele recurso. Recursos totalmente utilizados têm preços sombra positivos; recursos com sobra têm preço zero.`,
      visualization: 'shadow-price-analysis',
      insight: "Preço sombra = Δ lucro / Δ recurso"
    }
  ];
}

// Diet problem chapters
function createDietChapters(primal: LinearProgram): Chapter[] {
  return [
    {
      title: "Interpretação Nutricional",
      subtitle: "Precificando nutrientes",
      narrative: `Você precisa ${primal.variables.length} alimentos para atender ${primal.constraints.length} requisitos nutricionais. Um vendedor de suplementos quer oferecer cada nutriente puro. Os preços dos suplementos devem ser competitivos com os alimentos, senão ninguém compraria.`,
      visualization: 'economic-interpretation',
      insight: "O dual representa o problema de precificar nutrientes"
    },
    {
      title: "Valor dos Nutrientes",
      subtitle: "Preço implícito de cada nutriente",
      narrative: `As variáveis duais revelam quanto você pagaria por flexibilidade em cada requisito nutricional. Nutrientes escassos (restrições ativas) têm preços positivos; nutrientes abundantes têm preço zero.`,
      visualization: 'shadow-price-analysis',
      insight: "Preço do nutriente = economia por unidade de flexibilidade"
    }
  ];
}

// Generic problem chapters
function createGenericChapters(): Chapter[] {
  return [
    {
      title: "Interpretação Geral",
      subtitle: "Perspectivas complementares",
      narrative: `O problema dual oferece uma visão alternativa: em vez de otimizar diretamente as variáveis de decisão, atribuímos valores às restrições. Estes valores devem ser competitivos com a solução direta.`,
      visualization: 'economic-interpretation',
      insight: "Primal: decisões diretas | Dual: valor das restrições"
    },
    {
      title: "Análise de Sensibilidade",
      subtitle: "Impacto de mudanças",
      narrative: `Os preços sombra (variáveis duais) indicam como o valor ótimo muda quando relaxamos restrições. Esta informação é crucial para decisões de investimento e planejamento.`,
      visualization: 'shadow-price-analysis',
      insight: "Preços sombra guiam decisões de expansão"
    }
  ];
}

// Visualization component for each chapter
const ChapterVisualization: React.FC<{
  chapter: Chapter;
  primal: LinearProgram;
  dual: LinearProgram;
  chapterIndex: number;
}> = ({ chapter, primal, dual }) => {
  switch (chapter.visualization) {
    // Conversion steps
    case 'conversion-rules':
      return <ConversionRulesViz primal={primal} dual={dual} />;
    case 'dual-variables':
      return <DualVariablesViz primal={primal} dual={dual} />;
    case 'objective-conversion':
      return <ObjectiveConversionViz primal={primal} dual={dual} />;
    case 'constraints-conversion':
      return <ConstraintsConversionViz primal={primal} dual={dual} />;
    case 'sign-rules':
      return <SignRulesViz primal={primal} dual={dual} />;
    
    // Problem-specific visualizations
    case 'economic-interpretation':
      return <EconomicInterpretationViz primal={primal} dual={dual} />;
    case 'shadow-price-analysis':
      return <ShadowPricesViz primal={primal} dual={dual} />;
    
    // Theorem visualizations
    case 'weak-duality':
      return <WeakDualityViz primal={primal} dual={dual} />;
    case 'strong-duality':
      return <StrongDualityViz primal={primal} dual={dual} />;
    case 'complementary-slackness':
      return <ComplementaryViz primal={primal} dual={dual} />;
    
    // Legacy visualizations (keeping for compatibility)
    case 'primal-setup':
      return <PrimalSetupViz primal={primal} />;
    case 'dual-setup':
      return <DualSetupViz primal={primal} dual={dual} />;
    case 'equilibrium':
      return <EquilibriumViz primal={primal} dual={dual} />;
    default:
      return <div className="text-center text-gray-500">Visualization: {chapter.visualization}</div>;
  }
};

// Primal problem setup visualization
const PrimalSetupViz: React.FC<{ primal: LinearProgram }> = ({ primal }) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <Factory className="w-16 h-16 text-blue-600 mx-auto mb-2" />
        <h4 className="font-semibold">Problema Primal</h4>
      </div>
      
      <div className="bg-white rounded-lg p-4 space-y-3">
        <div className="border-b pb-2">
          <p className="font-semibold text-sm text-gray-600">Objetivo:</p>
          <p className="font-mono">
            {primal.isMaximization ? 'MAX' : 'MIN'} z = {primal.objective.map((c, i) => `${c}${primal.variables[i]}`).join(' + ')}
          </p>
        </div>
        
        <div>
          <p className="font-semibold text-sm text-gray-600 mb-2">Restrições:</p>
          {primal.constraints.map((constraint, i) => (
            <p key={i} className="font-mono text-sm">
              {constraint.coefficients.map((c, j) => `${c}${primal.variables[j]}`).join(' + ')} {constraint.operator} {constraint.rhs}
            </p>
          ))}
        </div>
        
        <div className="border-t pt-2">
          <p className="text-sm text-gray-600">
            {primal.variables.join(', ')} ≥ 0
          </p>
        </div>
      </div>
    </div>
  );
};

// Dual problem setup visualization
const DualSetupViz: React.FC<{ primal: LinearProgram; dual: LinearProgram }> = ({ primal }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <Factory className="w-12 h-12 text-blue-600 mx-auto mb-2" />
          <h5 className="font-semibold text-sm">Primal</h5>
          <p className="text-xs text-gray-600">
            {primal.isMaximization ? 'Maximizar lucro' : 'Minimizar custo'}
          </p>
        </div>
        
        <div className="text-center">
          <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <h5 className="font-semibold text-sm">Dual</h5>
          <p className="text-xs text-gray-600">
            {dual.isMaximization ? 'Maximizar valor' : 'Minimizar preço'}
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4">
        <p className="font-semibold text-sm text-gray-600 mb-2">Variáveis Duais:</p>
        {dual.variables.map((v, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{v}: preço da restrição {i + 1}</span>
            <span className="text-gray-500">({primal.constraints[i].operator} {primal.constraints[i].rhs})</span>
          </div>
        ))}
      </div>
      
      <div className="bg-green-50 rounded-lg p-3 text-sm">
        <p className="font-semibold mb-1">Interpretação:</p>
        <p>Cada variável dual representa o "preço" ou "valor" de uma unidade do recurso correspondente.</p>
      </div>
    </div>
  );
};

// Shadow prices visualization
const ShadowPricesViz: React.FC<{ primal: LinearProgram; dual: LinearProgram }> = ({ primal }) => {
  // Mock shadow prices for visualization
  const shadowPrices = primal.constraints.map((_, i) => i < 2 ? 2.5 - i * 0.7 : 0);
  
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <TrendingUp className="w-16 h-16 text-purple-600 mx-auto mb-2" />
        <h4 className="font-semibold">Preços Sombra</h4>
      </div>
      
      {primal.constraints.map((constraint, i) => (
        <div key={i} className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Recurso {i + 1}</span>
            <span className={`text-lg font-bold ${shadowPrices[i] > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              y{i + 1} = R$ {shadowPrices[i].toFixed(2)}
            </span>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Disponível:</span>
              <span>{constraint.rhs} unidades</span>
            </div>
            <div className="flex justify-between">
              <span>Tipo:</span>
              <span>{constraint.operator}</span>
            </div>
          </div>
          
          {shadowPrices[i] > 0 ? (
            <div className="mt-2 p-2 bg-green-50 rounded text-sm">
              <p className="text-green-800">
                ↗ Aumentar em 1 unidade → Lucro +R$ {shadowPrices[i].toFixed(2)}
              </p>
            </div>
          ) : (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
              <p className="text-gray-600">
                Recurso abundante (tem folga)
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Equilibrium visualization
const EquilibriumViz: React.FC<{ primal: LinearProgram; dual: LinearProgram }> = ({ primal, dual }) => {
  const optimalValue = 42; // Mock value
  
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <BarChart3 className="w-16 h-16 text-indigo-600 mx-auto mb-2" />
        <h4 className="font-semibold">Equilíbrio Perfeito</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-600 mb-1">Valor Ótimo Primal</p>
          <p className="text-2xl font-bold text-blue-800">z* = {optimalValue}</p>
          <p className="text-xs text-blue-600 mt-1">
            {primal.isMaximization ? 'Lucro máximo' : 'Custo mínimo'}
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-green-600 mb-1">Valor Ótimo Dual</p>
          <p className="text-2xl font-bold text-green-800">w* = {optimalValue}</p>
          <p className="text-xs text-green-600 mt-1">
            {dual.isMaximization ? 'Valor máximo' : 'Preço mínimo'}
          </p>
        </div>
      </div>
      
      <div className="bg-indigo-100 rounded-lg p-4 text-center">
        <p className="text-lg font-semibold text-indigo-900">
          z* = w* = {optimalValue}
        </p>
        <p className="text-sm text-indigo-700 mt-1">
          Teorema da Dualidade Forte
        </p>
      </div>
      
      <div className="text-sm text-gray-600 text-center">
        <p>No ponto ótimo, os interesses opostos se equilibram perfeitamente.</p>
      </div>
    </div>
  );
};

// Complementary slackness visualization
const ComplementaryViz: React.FC<{ primal: LinearProgram; dual: LinearProgram }> = () => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <Package className="w-16 h-16 text-orange-600 mx-auto mb-2" />
        <h4 className="font-semibold">Folga Complementar</h4>
      </div>
      
      <div className="bg-white rounded-lg p-4 space-y-3">
        <div className="border-b pb-3">
          <p className="font-semibold text-sm mb-2">Regra 1: Variáveis vs Restrições Duais</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
              <span>Se x₁ {'>'} 0 (produzindo)</span>
              <span className="text-blue-700">→</span>
              <span>Restrição dual ativa</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>Se restrição dual tem folga</span>
              <span className="text-gray-700">→</span>
              <span>x₁ = 0 (não produz)</span>
            </div>
          </div>
        </div>
        
        <div>
          <p className="font-semibold text-sm mb-2">Regra 2: Restrições vs Variáveis Duais</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-green-50 rounded">
              <span>Se recurso totalmente usado</span>
              <span className="text-green-700">→</span>
              <span>y₁ {'>'} 0 (tem valor)</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>Se recurso tem sobra</span>
              <span className="text-gray-700">→</span>
              <span>y₁ = 0 (sem valor)</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-orange-50 rounded-lg p-3 text-sm text-center">
        <p className="font-semibold text-orange-800">Princípio: "Tudo ou Nada"</p>
        <p className="text-orange-700">Atividade econômica só ocorre onde há escassez</p>
      </div>
    </div>
  );
};

// Conversion Rules Visualization
const ConversionRulesViz: React.FC<{ primal: LinearProgram; dual: LinearProgram }> = ({ primal, dual }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Aspecto</th>
              <th className="text-center p-2">Primal</th>
              <th className="text-center p-2">Dual</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-2">Tipo de Problema</td>
              <td className="text-center p-2 font-bold text-blue-600">
                {primal.isMaximization ? 'MAXIMIZAÇÃO' : 'MINIMIZAÇÃO'}
              </td>
              <td className="text-center p-2 font-bold text-green-600">
                {dual.isMaximization ? 'MAXIMIZAÇÃO' : 'MINIMIZAÇÃO'}
              </td>
            </tr>
            <tr className="border-b">
              <td className="p-2">Número de Variáveis</td>
              <td className="text-center p-2">{primal.variables.length}</td>
              <td className="text-center p-2">{dual.variables.length}</td>
            </tr>
            <tr>
              <td className="p-2">Número de Restrições</td>
              <td className="text-center p-2">{primal.constraints.length}</td>
              <td className="text-center p-2">{dual.constraints.length}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-3 text-sm">
        <p className="font-semibold mb-1">Princípio Fundamental:</p>
        <p>Variáveis primais ↔ Restrições duais | Restrições primais ↔ Variáveis duais</p>
      </div>
    </div>
  );
};

// Dual Variables Visualization
const DualVariablesViz: React.FC<{ primal: LinearProgram; dual: LinearProgram }> = ({ primal, dual }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h5 className="font-semibold mb-2 text-blue-600">Restrições Primais</h5>
            {primal.constraints.map((c, i) => (
              <div key={i} className="mb-2 p-2 bg-blue-50 rounded text-sm">
                <p className="font-mono">
                  {c.coefficients.map((coef, j) => `${coef}${primal.variables[j]}`).join(' + ')} {c.operator} {c.rhs}
                </p>
              </div>
            ))}
          </div>
          
          <div>
            <h5 className="font-semibold mb-2 text-green-600">Variáveis Duais</h5>
            {dual.variables.map((v, i) => (
              <div key={i} className="mb-2 p-2 bg-green-50 rounded text-sm flex items-center justify-center">
                <p className="font-bold text-lg">{v}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <ArrowRight className="w-8 h-8 text-gray-400 mx-auto" />
          <p className="text-sm text-gray-600 mt-1">
            Cada restrição primal gera uma variável dual
          </p>
        </div>
      </div>
    </div>
  );
};

// Objective Conversion Visualization
const ObjectiveConversionViz: React.FC<{ primal: LinearProgram; dual: LinearProgram }> = ({ primal, dual }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4">
        <div className="mb-4">
          <h5 className="font-semibold mb-2">RHS das Restrições Primais:</h5>
          <div className="flex gap-2">
            {primal.constraints.map((c, i) => (
              <div key={i} className="bg-blue-100 px-3 py-2 rounded">
                <p className="text-sm font-mono">b{i+1} = {c.rhs}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center my-4">
          <ArrowDown className="w-8 h-8 text-gray-400 mx-auto" />
        </div>
        
        <div>
          <h5 className="font-semibold mb-2">Função Objetivo Dual:</h5>
          <div className="bg-green-100 p-3 rounded">
            <p className="font-mono text-lg">
              {dual.isMaximization ? 'MAX' : 'MIN'} w = {dual.objective.map((c, i) => `${c}y${i+1}`).join(' + ')}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 rounded-lg p-3 text-sm">
        <p className="font-semibold">Interpretação:</p>
        <p>Os recursos disponíveis (RHS) se tornam os "preços" a otimizar no dual</p>
      </div>
    </div>
  );
};

// Constraints Conversion Visualization
const ConstraintsConversionViz: React.FC<{ primal: LinearProgram; dual: LinearProgram }> = ({ primal, dual }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4">
        <h5 className="font-semibold mb-3">Matriz de Coeficientes Primal → Restrições Duais</h5>
        
        {primal.variables.map((v, j) => (
          <div key={j} className="mb-4 border rounded p-3">
            <p className="font-semibold text-sm mb-2">Coluna {j+1} (variável {v}):</p>
            
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                {primal.constraints.map((c, i) => (
                  <span key={i} className="bg-blue-100 px-2 py-1 rounded text-sm font-mono">
                    a{i+1},{j+1} = {c.coefficients[j]}
                  </span>
                ))}
              </div>
              
              <ArrowRight className="w-6 h-6 text-gray-400" />
              
              <div className="bg-green-100 p-2 rounded flex-1">
                <p className="font-mono text-sm">
                  {dual.constraints[j].coefficients.map((c, i) => `${c}y${i+1}`).join(' + ')} 
                  {' '}{dual.constraints[j].operator} {dual.constraints[j].rhs}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sign Rules Visualization
const SignRulesViz: React.FC<{ primal: LinearProgram; dual: LinearProgram }> = ({ primal }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4">
        <h5 className="font-semibold mb-3">Regras de Sinais e Restrições</h5>
        
        <div className="space-y-3">
          {primal.constraints.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded">
              <div className="text-sm">
                <p className="font-semibold">Restrição {i+1}:</p>
                <p className="font-mono">{c.operator}</p>
              </div>
              
              <ArrowRight className="w-6 h-6 text-gray-400" />
              
              <div className="text-sm text-right">
                <p className="font-semibold">Variável dual y{i+1}:</p>
                <p className="font-mono">
                  {c.operator === '<=' ? '≥ 0' : 
                   c.operator === '>=' ? '≤ 0' : 
                   'irrestrita'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-3 text-sm">
        <p className="font-semibold mb-2">Resumo para problema {primal.isMaximization ? 'MAX' : 'MIN'}:</p>
        <ul className="space-y-1">
          <li>• Restrição ≤ → Variável dual ≥ 0</li>
          <li>• Restrição ≥ → Variável dual ≤ 0</li>
          <li>• Restrição = → Variável dual irrestrita</li>
        </ul>
      </div>
    </div>
  );
};

// Economic Interpretation Visualization
const EconomicInterpretationViz: React.FC<{ primal: LinearProgram; dual: LinearProgram }> = ({ primal, dual }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <Factory className="w-12 h-12 text-blue-600 mx-auto mb-2" />
          <h5 className="font-semibold text-center mb-2">Perspectiva Primal</h5>
          <p className="text-sm text-center">
            {primal.isMaximization ? 'Maximizar produção/lucro' : 'Minimizar custos'}
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-2" />
          <h5 className="font-semibold text-center mb-2">Perspectiva Dual</h5>
          <p className="text-sm text-center">
            {dual.isMaximization ? 'Maximizar valor dos recursos' : 'Minimizar preços de compra'}
          </p>
        </div>
      </div>
    </div>
  );
};

// Weak Duality Visualization
const WeakDualityViz: React.FC<{ primal: LinearProgram; dual: LinearProgram }> = ({ primal, dual }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4">
        <div className="relative h-40">
          <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-blue-50 rounded-l flex items-center justify-center">
            <div className="text-center">
              <p className="font-semibold text-blue-600">Primal</p>
              <p className="text-sm">{primal.isMaximization ? 'MAX' : 'MIN'}</p>
              <p className="font-mono mt-2">cx</p>
            </div>
          </div>
          
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-green-50 rounded-r flex items-center justify-center">
            <div className="text-center">
              <p className="font-semibold text-green-600">Dual</p>
              <p className="text-sm">{dual.isMaximization ? 'MAX' : 'MIN'}</p>
              <p className="font-mono mt-2">yb</p>
            </div>
          </div>
          
          <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
            <p className="text-center text-2xl font-bold">
              {primal.isMaximization ? 'cx ≤ yb' : 'cx ≥ yb'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 rounded-lg p-3 text-sm">
        <p className="font-semibold">Significado:</p>
        <p>{primal.isMaximization ? 
          'Qualquer solução dual viável fornece um limite superior para o primal' :
          'Qualquer solução dual viável fornece um limite inferior para o primal'}</p>
      </div>
    </div>
  );
};

// Strong Duality Visualization
const StrongDualityViz: React.FC<{ primal: LinearProgram; dual: LinearProgram }> = () => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6">
        <div className="text-center">
          <p className="text-3xl font-bold mb-2">cx* = y*b</p>
          <p className="text-lg">No ponto ótimo</p>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="font-semibold text-blue-600">Valor Ótimo Primal</p>
            <p className="text-2xl font-mono">z*</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-green-600">Valor Ótimo Dual</p>
            <p className="text-2xl font-mono">w*</p>
          </div>
        </div>
      </div>
      
      <div className="bg-purple-50 rounded-lg p-3 text-sm">
        <p className="font-semibold">Implicação Profunda:</p>
        <p>Resolver o primal é equivalente a resolver o dual - ambos fornecem a mesma informação!</p>
      </div>
    </div>
  );
};

// Type definitions
interface Narrative {
  title: string;
  problemContext: string;
  chapters: Chapter[];
}

interface Chapter {
  title: string;
  subtitle: string;
  narrative: string;
  visualization: string;
  insight?: string;
}
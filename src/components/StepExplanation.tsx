import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import type { SimplexStep } from '@/components/types';

interface StepExplanationProps {
  step: SimplexStep;
}

const StepExplanation: React.FC<StepExplanationProps> = ({ step }) => {
  // Handle different types of steps with appropriate rendering
  if (step.status === 'standard_form') {
    return <StandardFormExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'artificial_vars') {
    return <ArtificialVarsExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'initial') {
    return <InitialTableauExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'phase1_introduction') {
    return <PhaseOneIntroductionExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'phase1_start') {
    return <PhaseOneExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'phase1_optimal') {
    return <PhaseOneOptimalExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'phase2_start') {
    return <PhaseTransitionExplanation explanation={step.explanation} step={step} />;
  }
  
  if (step.status === 'phase2_noncanonical') {
    return <PhaseIINonCanonicalExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'phase2_canonical') {
    return <PhaseIICanonicalExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'phase1_canonicalize') {
    return <CanonicalStepExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'phase1_negate') {
    return <NegationStepExplanation explanation={step.explanation} />;
  }
  
  if (step.status === 'iteration') {
    return <IterationExplanation step={step} />;
  }

  if (step.status === 'optimal') {
    return <OptimalSolutionExplanation step={step} />;
  }
  
  if (step.status === 'unbounded') {
    return <UnboundedExplanation step={step} />;
  }
  
  if (step.status === 'infeasible') {
    return <InfeasibleExplanation explanation={step.explanation} />;
  }
  
  // Fallback for any other status
  return <div className="text-gray-700">{step.explanation}</div>;
};

// Component for standard form conversion explanation
const StandardFormExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  // For now, we'll just structure the explanation for better rendering
  // In the future, we'll parse the explanation and render it with proper components
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-blue-700">Convertendo para Forma Padrão</h3>
      <p className="text-gray-700 leading-relaxed">
        O processo de conversão para forma padrão prepara o problema para solução usando o algoritmo simplex.
      </p>
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm">
        {explanation.split('\n\n').map((paragraph, index) => (
          <p key={index} className="mb-3">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
};

// Component for artificial variables explanation
const ArtificialVarsExplanation: React.FC<{ explanation: string }> = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-purple-700">Adicionando Variáveis Artificiais</h3>
      
      <p className="text-gray-700 leading-relaxed">
        Como não podemos formar uma base inicial apenas com as variáveis de folga disponíveis, 
        precisamos introduzir variáveis artificiais para criar um ponto de partida para o método simplex.
      </p>
      
      <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
        <h4 className="font-semibold mb-2 text-gray-800">Por que Variáveis Artificiais?</h4>
        <p className="text-gray-700 mb-3">
          Variáveis artificiais são adicionadas a restrições que não têm uma variável básica óbvia:
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Restrições de igualdade (nenhuma variável de folga disponível)</li>
          <li>Restrições do tipo maior-ou-igual (variáveis de excesso têm coeficiente -1)</li>
        </ul>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <h4 className="font-semibold mb-2 text-gray-800">A Função Objetivo Auxiliar</h4>
        <p className="text-gray-700 mb-2">
          Substituímos temporariamente a função objetivo original por uma nova que minimiza a soma de todas as variáveis artificiais:
        </p>
        <div className="p-2 bg-white rounded border border-gray-300 font-mono text-sm">
          Fase I: Minimizar w = a₁ + a₂ + ... + aₙ
        </div>
        <p className="text-gray-700 mt-2">
          Isso garante que, se uma solução viável existir, todas as variáveis artificiais serão levadas a zero. 
          Uma vez que w = 0, podemos remover as variáveis artificiais e restaurar a função objetivo original para a Fase II.
        </p>
      </div>
      
      <div className="text-gray-700 italic">
        O tableau agora mostra as variáveis artificiais formando uma matriz identidade nas linhas de restrição, 
        fornecendo-nos uma solução básica viável inicial.
      </div>
    </div>
  );
};

// Component for initial tableau explanation
const InitialTableauExplanation: React.FC<{ explanation: string }> = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-blue-700">Configuração Inicial do Tableau</h3>
      <p className="text-gray-700 leading-relaxed">
        Este é o ponto de partida do algoritmo simplex. O problema foi convertido para forma padrão
        e organizado em formato de tableau.
      </p>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>A primeira linha contém os coeficientes da função objetivo minimizada</li>
          <li>Cada linha subsequente representa uma equação de restrição</li>
          <li>Variáveis de folga/excesso foram adicionadas para converter desigualdades em igualdades</li>
          <li>A coluna mais à direita contém os valores do lado direito das restrições</li>
        </ul>
      </div>
      
      <div className="font-medium text-gray-700 italic">
        O algoritmo simplex agora iniciará iterações para encontrar a solução ótima.
      </div>
    </div>
  );
};

// Component for iteration explanation
const IterationExplanation: React.FC<{ step: SimplexStep }> = ({ step }) => {
  const pivotElement = step.pivotElement ? step.pivotElement : [0, 0];
  const enteringCol = step.enteringVariable;
  const leavingRow = step.leavingVariable;
  const { matrix, basicVariables, variableNames } = step.tableau;
  const numRows = matrix.length;
  const numCols = matrix[0].length;
  const rhsCol = numCols - 1;
  
  // Calculate the minimum ratio for each row
  const ratios = [];
  for (let i = 1; i < numRows; i++) {
    if (matrix[i][enteringCol] > 0) {
      ratios.push({
        row: i,
        ratio: matrix[i][rhsCol] / matrix[i][enteringCol],
        basicVar: basicVariables[i-1]
      });
    } else {
      ratios.push({
        row: i,
        ratio: Infinity,
        basicVar: basicVariables[i-1]
      });
    }
  }
  
  // Sort ratios to find minimum
  ratios.sort((a, b) => a.ratio - b.ratio);
  
  // Get variable names for better display
  const getVarName = (idx) => {
    if (idx < variableNames.length) {
      return variableNames[idx];
    } else {
      return `s${idx - variableNames.length + 1}`;
    }
  };
  
  const enteringVarName = getVarName(enteringCol);
  const leavingVarName = leavingRow && basicVariables[leavingRow-1] !== undefined ? 
    getVarName(basicVariables[leavingRow-1]) : "none";
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-blue-700">
        Iteração Simplex
      </h3>
      
      <div className="space-y-4">
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <h4 className="font-semibold mb-2 text-gray-800">1. Selecionando a Variável que Entra</h4>
          <p className="text-gray-700 mb-2">
            Observando os coeficientes da função objetivo no tableau atual:
          </p>
          <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm overflow-x-auto mb-2">
            {matrix[0].slice(0, rhsCol).map((coef, idx) => (
              <span key={idx} className={idx === enteringCol ? "text-red-600 font-bold" : ""}>
                {coef.toFixed(2)}{getVarName(idx)}{idx < rhsCol-1 ? ' + ' : ''}
              </span>
            ))}
          </div>
          <p className="text-gray-700 mt-2">
            A variável <span className="font-semibold">{enteringVarName}</span> (coluna {enteringCol}) foi selecionada para entrar na base 
            porque tem o coeficiente mais negativo ({matrix[0][enteringCol].toFixed(2)}) na linha objetivo, 
            o que melhorará mais nosso valor objetivo.
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <h4 className="font-semibold mb-2 text-gray-800">2. Selecionando a Variável que Sai</h4>
          <p className="text-gray-700 mb-2">
            Realizamos o teste da razão mínima para encontrar qual variável deve sair da base:
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 mb-3">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left">Linha</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Variável Básica</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Valor LD (b)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Coeficiente (a)</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Razão (b/a)</th>
                </tr>
              </thead>
              <tbody>
                {ratios.map((item, idx) => (
                  <tr key={idx} className={item.row === leavingRow ? "bg-yellow-100" : ""}>  
                    <td className="border border-gray-300 px-3 py-2">{item.row}</td>
                    <td className="border border-gray-300 px-3 py-2">{getVarName(item.basicVar)}</td>
                    <td className="border border-gray-300 px-3 py-2">{matrix[item.row][rhsCol].toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2">{matrix[item.row][enteringCol].toFixed(2)}</td>
                    <td className="border border-gray-300 px-3 py-2">
                      {matrix[item.row][enteringCol] > 0 
                        ? (matrix[item.row][rhsCol] / matrix[item.row][enteringCol]).toFixed(2) 
                        : "N/D"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <p className="text-gray-700 mb-2">
            A variável <span className="font-semibold">{leavingVarName}</span> da linha {leavingRow} foi selecionada para sair da base 
            porque tem a menor razão positiva ({ratios.find(r => r.row === leavingRow)?.ratio.toFixed(2)}).
          </p>
          
          <div className="mt-2 font-medium text-gray-700 bg-white p-2 rounded border border-gray-200">
            Elemento pivô: {matrix[pivotElement[0]][pivotElement[1]].toFixed(2)} 
            na posição (linha {pivotElement[0]}, coluna {pivotElement[1]})
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold mb-2 text-gray-800">3. Operação Pivô</h4>
          <p className="text-gray-700 mb-2">
            O tableau será atualizado usando estes cálculos:
          </p>
          
          <div className="bg-white p-3 rounded border border-gray-200 space-y-3">
            <div>
              <p className="font-semibold">Passo 1: Normalizar a linha pivô (linha {pivotElement[0]})</p>
              <p className="font-mono text-sm">Nova linha {pivotElement[0]} = linha {pivotElement[0]} ÷ {matrix[pivotElement[0]][pivotElement[1]].toFixed(2)}</p>
            </div>
            
            <div>
              <p className="font-semibold">Passo 2: Atualizar todas as outras linhas</p>
              {Array.from({length: numRows}).map((_, i) => {
                if (i === pivotElement[0]) return null;
                return (
                  <p key={i} className="font-mono text-sm">
                    Nova linha {i} = linha {i} - ({matrix[i][pivotElement[1]].toFixed(2)} × Nova linha {pivotElement[0]})
                  </p>
                );
              })}
            </div>
          </div>
          
          <p className="mt-3 text-gray-700">
            Após esta operação, <span className="font-semibold">{enteringVarName}</span> entrará na base, 
            <span className="font-semibold"> {leavingVarName}</span> sairá, 
            e a coluna pivô terá todos zeros exceto um 1 na linha pivô.
          </p>
        </div>
      </div>
    </div>
  );
};

// Component for optimal solution explanation
const OptimalSolutionExplanation: React.FC<{ step: SimplexStep }> = ({ step }) => {
  const { matrix, basicVariables, nonBasicVariables, variableNames, objectiveValue, isMaximization } = step.tableau;
  const numCols = matrix[0].length;
  
  // Calculate solution values for display
  const solution = {};
  for (let i = 0; i < variableNames.length; i++) {
    const basicIndex = basicVariables.indexOf(i);
    if (basicIndex >= 0) {
      // This is a basic variable, get its value from the RHS
      solution[variableNames[i]] = matrix[basicIndex + 1][numCols - 1];
    } else {
      // Non-basic variable has value 0
      solution[variableNames[i]] = 0;
    }
  }
  
  // Format solution for display, filter out zero values if there are many variables
  let solutionItems = Object.entries(solution);
  const hasLotsOfVariables = solutionItems.length > 5;
  
  if (hasLotsOfVariables) {
    solutionItems = solutionItems.filter(([, value]) => Math.abs(value) > 1e-10);
  }
  
  const formattedSolution = solutionItems.map(([varName, value]) => (
    `${varName} = ${value.toFixed(2)}`
  )).join(', ');
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-green-700">Solução Ótima Encontrada!</h3>
      
      <p className="text-gray-700 leading-relaxed">
        O algoritmo simplex convergiu para uma solução ótima. Esta é a melhor solução 
        possível para este problema de programação linear.
      </p>
      
      <div className="bg-green-50 p-4 rounded-md border border-green-200">
        <h4 className="font-semibold mb-2 text-gray-800">Por que esta Solução é Ótima:</h4>
        
        <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm mb-3">
          <p className="mb-2"><strong>Custos reduzidos atuais (linha objetivo):</strong></p>
          <div>
            {nonBasicVariables.map((colIdx, idx) => (
              <span key={idx} className={"inline-block mr-2 " + (matrix[0][colIdx] < -1e-10 ? "text-red-600" : "")}>
                {(matrix[0][colIdx] >= 0 ? "+" : "") + matrix[0][colIdx].toFixed(2)}{variableNames[colIdx] || `x${colIdx+1}`}
              </span>
            ))}
          </div>
        </div>
        
        <p className="mb-2 text-gray-700">
          <strong>Condição de otimalidade:</strong> Todos os coeficientes na linha objetivo são {isMaximization ? "≥ 0" : "≤ 0"}.
          Isso significa que nenhuma variável pode entrar na base e melhorar o valor da função objetivo.
        </p>
        
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>A solução é viável (todas as restrições são satisfeitas)</li>
          <li>Nenhuma variável entrante pode melhorar o valor da função objetivo</li>
          <li>Alcançamos um vértice da região viável que maximiza/minimiza o objetivo</li>
        </ul>
      </div>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold mb-2 text-gray-800">Valores da Solução Ótima:</h4>
          
          <div className="bg-white p-3 rounded border border-gray-200 font-mono mb-2">
            <p>{formattedSolution}</p>
          </div>
          
          <p className="text-gray-700 text-sm italic">
            {hasLotsOfVariables && "Nota: Mostrando apenas variáveis não-zero"}
          </p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <h4 className="font-semibold mb-2 text-gray-800">Cálculo do Valor da Função Objetivo:</h4>
          
          <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm mb-2">
            <p className="mb-1"><strong>Função objetivo avaliada na solução ótima:</strong></p>
            <p>
              {isMaximization ? "Max" : "Min"} z = {Object.entries(solution)
                .filter(([, value]) => Math.abs(value) > 1e-10)
                .map(([varName, value], idx) => {
                  const coef = step.tableau.variableNames.indexOf(varName) >= 0 ? 
                      (isMaximization ? 1 : -1) * matrix[0][step.tableau.variableNames.indexOf(varName)] : 0;
                  return `${idx > 0 ? " + " : ""}(${coef.toFixed(2)} × ${value.toFixed(2)})`;
                })
                .join("")}
              = {objectiveValue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="bg-green-100 px-6 py-3 rounded-md border border-green-300">
          <div className="font-semibold text-lg text-green-800">
            Valor objetivo {isMaximization ? "máximo" : "mínimo"}: {objectiveValue.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for unbounded explanation
const UnboundedExplanation: React.FC<{ step: SimplexStep }> = ({ step }) => {
  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTitle>Problema é Ilimitado</AlertTitle>
        <AlertDescription>
          O valor objetivo pode aumentar (ou diminuir) indefinidamente sem violar nenhuma restrição.
        </AlertDescription>
      </Alert>
      
      <div className="bg-red-50 p-4 rounded-md border border-red-200">
        <h4 className="font-semibold mb-2 text-gray-800">Por que Este Problema é Ilimitado:</h4>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Uma variável entrante foi identificada (coluna {step.enteringVariable})</li>
          <li>Nenhuma variável de saída válida pôde ser encontrada (sem coeficientes positivos nesta coluna)</li>
          <li>Isso significa que a variável entrante pode ser aumentada indefinidamente</li>
        </ul>
      </div>
      
      <p className="text-gray-700 italic">
        Um problema ilimitado não tem solução ótima finita. 
        A região viável se estende infinitamente na direção que melhora o valor objetivo.
      </p>
    </div>
  );
};

// Component for canonicalization step explanation
const CanonicalStepExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  // Parse all the details from the explanation
  const stepMatch = explanation.match(/Passo (\d+)/);
  const stepNumber = stepMatch ? stepMatch[1] : '1';
  
  const artificialVarMatch = explanation.match(/Eliminando (a\d+) da linha objetivo/);
  let artificialVar = artificialVarMatch ? artificialVarMatch[1] : '';
  
  const coeffMatch = explanation.match(/Coeficiente objetivo atual para (a\d+): ([-\d.]+)/);
  const currentCoeff = coeffMatch ? coeffMatch[2] : '';
  
  const constraintMatch = explanation.match(/(a\d+) é básica na restrição (\d+)/);
  const constraintRow = constraintMatch ? constraintMatch[2] : '';
  // Update artificialVar if not found before
  if (!artificialVar && constraintMatch) {
    artificialVar = constraintMatch[1];
  }
  
  const rowOperationMatch = explanation.match(/Linha 0 = Linha 0 - \(([-\d.]+)\) × Linha (\d+)/);
  const coefficient = rowOperationMatch ? rowOperationMatch[1] : '';
  
  // Parse the row details
  const origRowMatch = explanation.match(/Linha 0 Original: \[([-\d., ]+)\]/);
  const origRow = origRowMatch ? origRowMatch[1].split(', ') : [];
  
  const rowNMatch = explanation.match(/Linha \d+: \[([-\d., ]+)\]/g);
  const constraintRowData = rowNMatch && rowNMatch[1] ? rowNMatch[1].match(/\[([-\d., ]+)\]/)?.[1].split(', ') : [];
  
  const multRowMatch = explanation.match(/([-\d.]+) × Linha \d+: \[([-\d., ]+)\]/);
  const multipliedRow = multRowMatch ? multRowMatch[2].split(', ') : [];
  
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Canonicalizando a Linha Objetivo - Passo {stepNumber}
        </h3>
        
        <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
          <h4 className="font-semibold text-lg text-gray-800 mb-3">
            Eliminando <span className="text-purple-600">{artificialVar}</span> da linha objetivo
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">Coeficiente objetivo atual para {artificialVar}:</p>
              <p className="text-2xl font-bold text-red-600">{currentCoeff}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">{artificialVar} é básica em:</p>
              <p className="text-2xl font-bold text-blue-600">Restrição {constraintRow}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
            <p className="text-sm text-gray-700 mb-2">Para tornar o coeficiente 0, realizamos:</p>
            <p className="text-lg font-mono font-bold text-blue-700">
              Linha 0 = Linha 0 - ({coefficient}) × Linha {constraintRow}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-md border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Detalhes da Operação de Linha:</h4>
          
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="text-sm font-semibold text-gray-600 pr-4 whitespace-nowrap">Linha 0 Original:</td>
                    <td className="font-mono text-sm">
                      <div className="flex flex-wrap gap-2">
                        {origRow.map((val, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 rounded">
                            {val}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-sm font-semibold text-gray-600 pr-4 whitespace-nowrap pt-2">Linha {constraintRow}:</td>
                    <td className="font-mono text-sm pt-2">
                      <div className="flex flex-wrap gap-2">
                        {constraintRowData.map((val, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 rounded">
                            {val}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="text-sm font-semibold text-gray-600 pr-4 whitespace-nowrap pt-2">
                      ({coefficient}) × Linha {constraintRow}:
                    </td>
                    <td className="font-mono text-sm pt-2">
                      <div className="flex flex-wrap gap-2">
                        {multipliedRow.map((val, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 rounded">
                            {val}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-md border border-green-200 mt-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Propósito:</span> Esta operação garante que a variável básica {artificialVar} tenha 
            coeficiente 0 na linha objetivo, mantendo a forma canônica necessária para o método simplex.
          </p>
        </div>
      </div>
    </div>
  );
};

// Component for negation step explanation
const NegationStepExplanation: React.FC<{ explanation: string }> = () => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Fase I - Passo Final de Preparação
        </h3>
        
        <div className="bg-white p-4 rounded-md border border-gray-200 mb-4">
          <h4 className="font-semibold text-lg text-gray-800 mb-3">
            Negando a Linha Objetivo
          </h4>
          
          <div className="bg-indigo-50 p-4 rounded-md border border-indigo-200 mb-4">
            <p className="text-gray-700 mb-2">Realizamos uma operação final:</p>
            <p className="text-lg font-mono font-bold text-indigo-700">
              Multiplicar toda a linha objetivo por -1
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-semibold text-gray-600 mb-2">Antes da negação:</p>
              <p className="text-sm text-gray-700">Coeficientes positivos na linha objetivo</p>
              <p className="text-xs text-gray-600 mt-1">Exemplo: [2, 3, 1, 0, 0, 7]</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-semibold text-gray-600 mb-2">Após a negação:</p>
              <p className="text-sm text-gray-700">Coeficientes negativos na linha objetivo</p>
              <p className="text-xs text-gray-600 mt-1">Exemplo: [-2, -3, -1, 0, 0, -7]</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-2">Por que Este Passo é Importante:</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>O algoritmo simplex seleciona o coeficiente <strong>mais negativo</strong> como variável entrante</li>
            <li>Para minimização, coeficientes negativos indicam variáveis que podem diminuir o objetivo</li>
            <li>Esta convenção de sinal garante que o algoritmo funcione corretamente</li>
            <li>Sem este passo, o algoritmo se moveria na direção errada</li>
          </ul>
        </div>
        
        <div className="bg-green-50 p-3 rounded-md border border-green-200">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Resultado:</span> O tableau agora está totalmente preparado para as iterações simplex da Fase I. 
            Podemos iniciar o processo de levar todas as variáveis artificiais a zero.
          </p>
        </div>
      </div>
    </div>
  );
};

// Component for infeasible explanation
const InfeasibleExplanation: React.FC<{ explanation: string }> = () => {
  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTitle>Problema é Inviável</AlertTitle>
        <AlertDescription>
          Não há solução que satisfaça todas as restrições simultaneamente.
        </AlertDescription>
      </Alert>
      
      <div className="bg-red-50 p-4 rounded-md border border-red-200">
        <h4 className="font-semibold mb-2 text-gray-800">Por que Este Problema é Inviável:</h4>
        <p className="mb-4 text-gray-700">
          A Fase I do método simplex terminou, mas o valor objetivo não é zero.
          Isso significa que não conseguimos levar todas as variáveis artificiais a zero, o que indica que
          não há solução que satisfaça todas as restrições.
        </p>
        
        <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm mb-4">
          <p className="mb-2"><strong>Valor Objetivo da Fase I &gt; 0</strong></p>
          <p>Mesmo na solução ótima para a Fase I, algumas variáveis artificiais permanecem positivas.</p>
          <p>Por construção, isso significa que algumas restrições não podem ser satisfeitas simultaneamente.</p>
        </div>
        
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>As restrições são mutuamente contraditórias</li>
          <li>Nenhuma combinação de valores de variáveis pode satisfazer todas as restrições simultaneamente</li>
          <li>A região viável é vazia (não contém pontos)</li>
        </ul>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
        <h4 className="font-semibold mb-2 text-gray-800">Prova Matemática de Inviabilidade:</h4>
        
        <p className="mb-3 text-gray-700">
          Quando um problema é inviável, podemos prová-lo matematicamente através da solução da Fase I:
        </p>
        
        <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm mb-3">
          <ol className="list-decimal list-inside space-y-2">
            <li>Nosso objetivo da Fase I era minimizar a soma das variáveis artificiais</li>
            <li>Se este valor mínimo é maior que zero, então por definição algumas variáveis artificiais devem ser positivas</li>
            <li>Como as variáveis artificiais devem ser zero para que as restrições originais sejam satisfeitas, o problema é inviável</li>
          </ol>
        </div>
        
        <p className="text-gray-700">
          Esta é uma prova matemática rigorosa de inviabilidade - não apenas uma aproximação numérica.
        </p>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <h4 className="font-semibold mb-2 text-gray-800">Identificando Restrições Conflitantes:</h4>
        
        <p className="mb-3 text-gray-700">
          Procure por estes padrões comuns de inviabilidade:
        </p>
        
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>Duas restrições que formam uma região vazia (ex: x ≤ 5 e x ≥ 10)</li>
          <li>Um sistema de restrições de igualdade sem solução</li>
          <li>Restrições que criam uma região limitada, mas com limites não compatíveis</li>
        </ol>
        
        <div className="mt-3 pt-3 border-t border-yellow-200">
          <h5 className="font-semibold mb-2 text-gray-800">Possíveis Soluções:</h5>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Revise suas restrições e verifique erros ou inconsistências</li>
            <li>Relaxe algumas restrições se possível</li>
            <li>Reformule o problema com menos restrições ou restrições modificadas</li>
          </ul>
        </div>
      </div>
      
      <p className="text-gray-700 italic text-center">
        Como não existe solução viável, o método simplex termina.
      </p>
    </div>
  );
};

// Component for Phase One Introduction (before canonicalization)
const PhaseOneIntroductionExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  // Parse the artificial variable names from the marker
  const artificialVars = explanation.startsWith('PHASE_I_INTRO:') 
    ? explanation.substring(14).split(',')
    : ['a1', 'a2'];
  
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-indigo-700">Iniciando a Fase I - O Método de Duas Fases</h3>
      
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">O que é a Fase I?</h4>
        <p className="text-gray-700 leading-relaxed">
          A Fase I é uma fase preparatória que cria um ponto de partida viável para o método simplex. 
          Como tivemos que adicionar variáveis artificiais para formar uma base inicial, precisamos garantir que essas 
          variáveis possam ser levadas a zero (tornadas não-básicas).
        </p>
      </div>
      
      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">O Objetivo da Fase I</h4>
        <p className="text-gray-700 mb-4">
          Em vez de otimizar o objetivo original, a Fase I o substitui temporariamente por:
        </p>
        
        <div className="bg-white p-4 rounded-md border-2 border-purple-300 text-center">
          <span className="text-xl font-semibold text-purple-700">
            Minimizar w = {artificialVars.join(' + ')}
          </span>
        </div>
        
        <div className="mt-4 space-y-2">
          <p className="text-gray-700">Este objetivo garante que:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
            <li>Variáveis artificiais são penalizadas (queremos minimizar sua soma)</li>
            <li>Se w pode ser reduzido a 0, temos uma solução viável para o problema original</li>
            <li>Se w não pode chegar a 0, o problema original é inviável</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Tableau Atual da Fase I</h4>
        <div className="space-y-3">
          <p className="text-gray-700">O tableau agora mostra:</p>
          <div className="bg-white p-4 rounded border border-gray-300 space-y-2">
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-32">Linha objetivo:</span>
              <span className="font-mono text-sm">w - {artificialVars.join(' - ')} = 0</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-32">Variáveis básicas:</span>
              <span className="font-mono text-sm">{artificialVars.join(', ')} (variáveis artificiais)</span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 w-32">Não-básicas:</span>
              <span className="font-mono text-sm">Todas as variáveis originais e de folga/excesso</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Próximos Passos</h4>
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>
            <span className="font-semibold">Canonizar a linha objetivo</span> - 
            Tornar os coeficientes das variáveis básicas iguais a 0
          </li>
          <li>
            <span className="font-semibold">Resolver a Fase I até a otimalidade</span> - 
            Usar o método simplex para minimizar w
          </li>
          <li>
            <span className="font-semibold">Verificar viabilidade</span> - 
            Se w = 0 na otimalidade, o problema é viável e prosseguimos para a Fase II
          </li>
        </ol>
      </div>
    </div>
  );
};

// Component for Phase One Optimal Solution
const PhaseOneOptimalExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  // Extract w value from explanation
  const wMatch = explanation.match(/w = ([\d.-]+)/);
  const wValue = wMatch ? parseFloat(wMatch[1]) : 0;
  const isFeasible = Math.abs(wValue) < 1e-10;
  
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-indigo-700">Solução Ótima da Fase I Encontrada</h3>
      
      <div className={`p-6 rounded-lg border-2 ${isFeasible ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
        <h4 className="text-lg font-semibold mb-3 flex items-center">
          {isFeasible ? (
            <>
              <span className="text-green-700">✅ O problema é viável!</span>
            </>
          ) : (
            <>
              <span className="text-red-700">❌ O problema é inviável!</span>
            </>
          )}
        </h4>
        
        <div className="bg-white p-4 rounded border border-gray-300 mb-4">
          <p className="text-lg font-semibold text-center">
            Valor ótimo de w = {Math.abs(wValue) < 1e-10 ? '0' : wValue.toFixed(6)}
          </p>
        </div>
        
        {isFeasible ? (
          <div className="space-y-3">
            <p className="text-gray-700">
              Todas as variáveis artificiais foram levadas a zero com sucesso. 
              Isso significa que encontramos uma solução viável para o problema original.
            </p>
            
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h5 className="font-semibold text-gray-800 mb-2">Próximo Passo: Transição para a Fase II</h5>
              <p className="text-gray-700">Agora iremos:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-700 ml-4">
                <li>Substituir o objetivo da Fase I pela função objetivo original</li>
                <li>Continuar com o método simplex para encontrar a solução ótima</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-700">
              As variáveis artificiais não puderam ser levadas a zero. 
              Isso significa que as restrições originais são contraditórias e não têm solução viável.
            </p>
            <p className="text-gray-700">
              O algoritmo simplex terminará aqui pois não existe solução viável.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for Phase One explanation
const PhaseOneExplanation: React.FC<{ explanation: string }> = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-blue-700">Introdução à Fase I</h3>
      
      <p className="text-gray-700 leading-relaxed">
        A Fase I do Método Simplex de Duas Fases é necessária quando o problema não tem uma solução viável inicial óbvia.
      </p>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold mb-2 text-gray-800">Por que a Fase I é Necessária</h4>
          <p className="text-gray-700">
            No simplex padrão, precisamos começar com uma solução básica viável (um vértice da região viável). 
            No entanto, para problemas com certos tipos de restrições (restrições de igualdade ou ≥), 
            encontrar uma solução viável inicial não é direto.
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
          <h4 className="font-semibold mb-2 text-gray-800">Abordagem da Fase I</h4>
          <p className="text-gray-700 mb-3">
            Adicionamos variáveis artificiais (a<sub>1</sub>, a<sub>2</sub>, etc.) às restrições que precisam delas.
            Essas variáveis artificiais nos permitem criar uma solução básica viável inicial fornecendo uma coluna identidade
            para cada restrição que ainda não tem uma.
          </p>
          
          <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm">
            <p className="mb-2"><strong>Para restrições de igualdade como:</strong> 
              <span className="ml-2">a<sub>1</sub>x<sub>1</sub> + a<sub>2</sub>x<sub>2</sub> + ... = b</span>
            </p>
            <p className="mb-2"><strong>Adicionamos uma variável artificial:</strong> 
              <span className="ml-2">a<sub>1</sub>x<sub>1</sub> + a<sub>2</sub>x<sub>2</sub> + ... + a<sub>i</sub> = b</span>
            </p>
            <p><strong>Para restrições ≥:</strong> 
              <span className="ml-2">Primeiro convertemos para ≤ multiplicando por -1, depois adicionamos variável de excesso e artificial</span>
            </p>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <h4 className="font-semibold mb-2 text-gray-800">Função Objetivo Auxiliar</h4>
          <p className="text-gray-700 mb-3">
            Na Fase I, nosso objetivo é minimizar a soma das variáveis artificiais:
          </p>
          
          <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm mb-3">
            <p><strong>Objetivo da Fase I:</strong> Minimizar w = a<sub>1</sub> + a<sub>2</sub> + ... + a<sub>n</sub></p>
          </div>
          
          <p className="text-gray-700">
            Se conseguirmos levar esta soma a zero, encontramos uma solução viável para o problema original.
            Se não conseguirmos, o problema original é inviável.
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold mb-2 text-gray-800">Cálculos do Tableau Inicial</h4>
          <p className="text-gray-700 mb-3">
            Para configurar o tableau da Fase I, nós:
          </p>
          
          <ol className="list-decimal list-inside space-y-1 text-gray-700">
            <li>Adicionamos variáveis artificiais para criar uma matriz identidade para a base</li>
            <li>Configuramos a linha objetivo da Fase I com coeficientes para as variáveis artificiais</li>
            <li>Usamos operações de linha para garantir que a linha objetivo tenha zeros nas colunas das variáveis básicas</li>
          </ol>
          
          <p className="mt-3 text-gray-700">
            Nossa base inicial consiste nas variáveis artificiais e quaisquer variáveis de folga/excesso
            que já formam colunas identidade na matriz de restrições.
          </p>
        </div>
      </div>
      
      <div className="font-medium text-gray-700 italic text-center">
        Agora prosseguiremos com as iterações da Fase I para levar todas as variáveis artificiais a zero, se possível.
      </div>
    </div>
  );
};

// Component for Phase I to Phase II transition explanation
const PhaseTransitionExplanation: React.FC<{ explanation: string, step?: SimplexStep }> = ({ explanation }) => {
  // Check if this is the new detailed format
  if (explanation.startsWith('PHASE_II_TRANSITION_DETAILED:')) {
    const parts = explanation.split(':');
    const detailedExplanation = parts[1];
    
    return (
      <div className="space-y-6">
        <div className="prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: detailedExplanation.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        </div>
      </div>
    );
  }
  
  // Legacy format handling
  let basicVarNames: string[] = [];
  let wasOriginallyMax = true;
  let standardFormCoeffs: number[] = [];
  
  if (explanation.startsWith('PHASE_II_TRANSITION:')) {
    const parts = explanation.split(':');
    if (parts.length >= 3) {
      basicVarNames = parts[2].split(',').filter(s => s);
    }
    if (parts.length >= 4) {
      wasOriginallyMax = parts[3] === 'max';
    }
    if (parts.length >= 5) {
      standardFormCoeffs = parts[4].split(',').map(s => parseFloat(s));
    }
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-green-700">Transição para a Fase II</h3>
      
      <div className="bg-green-100 p-4 rounded-md border border-green-300">
        <div className="font-semibold mb-2 text-green-800 text-center">
          Sucesso! A Fase I encontrou uma solução viável.
        </div>
        <p className="text-gray-700 text-center">
          Levamos todas as variáveis artificiais a zero, o que significa que encontramos uma solução básica viável
          que satisfaz todas as restrições originais.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold mb-2 text-gray-800">O que Acontece Agora</h4>
          <p className="text-gray-700">
            Agora que temos uma solução viável, podemos prosseguir com a Fase II do método simplex
            para resolver o problema original usando esta solução viável como nosso ponto de partida.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h4 className="font-semibold mb-2 text-gray-800">Substituindo a Função Objetivo</h4>
          <p className="text-gray-700 mb-3">
            Agora substituímos o objetivo da Fase I pela função objetivo em forma padrão:
          </p>
          
          <div className="bg-white p-3 rounded border border-gray-300 mb-4">
            <p className="text-sm text-gray-600 mb-1">Objetivo em forma padrão:</p>
            <p className="font-mono font-semibold text-lg">
              Minimizar: 
              {standardFormCoeffs.length > 0 ? (
                standardFormCoeffs.map((coeff, i) => (
                  <span key={i}>
                    {i > 0 && coeff >= 0 && ' + '}
                    {coeff}x<sub>{i + 1}</sub>
                  </span>
                ))
              ) : (
                'z = c₁x₁ + c₂x₂ + ...'
              )}
            </p>
          </div>
          
          {wasOriginallyMax && (
            <div className="bg-gray-100 p-3 rounded border border-gray-300 mb-4 text-sm">
              <p className="text-gray-600">
                <strong>Nota:</strong> O problema original era de maximização, mas na forma padrão 
                todos os problemas são de minimização. Os coeficientes foram negados adequadamente.
              </p>
            </div>
          )}
          
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <h5 className="font-semibold text-gray-800 mb-2">⚠️ Importante: Canonicalização Necessária</h5>
            <p className="text-gray-700 mb-2">
              A linha objetivo deve ser canonicalizada em relação às variáveis básicas atuais.
              Isso significa que os coeficientes das variáveis básicas devem ser zero na linha objetivo.
            </p>
            
            {basicVarNames.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-700">Variáveis básicas atuais:</p>
                <p className="font-mono text-sm bg-white p-2 rounded border border-gray-300 mt-1">
                  {basicVarNames.join(', ')}
                </p>
              </div>
            )}
            
            <p className="text-gray-700 mt-3">
              Após a canonicalização, os coeficientes da linha objetivo mudarão para manter 
              a forma adequada do tableau simplex. É por isso que os coeficientes exibidos diferem 
              da função objetivo original.
            </p>
            
            <div className="bg-white p-3 rounded border border-gray-300 mt-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">Exemplo:</p>
              <p className="text-sm font-mono">
                Se x₃ é básica na linha 1 com coeficiente -80 no objetivo:<br/>
                Novo coeficiente = -80 - (-80) × 1 = 0
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Este processo garante que a variável básica tenha coeficiente 0.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <h4 className="font-semibold mb-2 text-gray-800">A Fase II Começa</h4>
          <p className="text-gray-700">
            O método simplex agora otimizará o objetivo original mantendo a viabilidade.
            As variáveis artificiais permanecem no tableau mas serão retiradas da base
            conforme encontramos soluções melhores.
          </p>
        </div>
        
        <div className="bg-indigo-50 p-4 rounded-md border border-indigo-200">
          <h4 className="font-semibold mb-2 text-gray-800">Entendendo a Exibição do Tableau</h4>
          <p className="text-gray-700">
            A linha objetivo no tableau mostra a forma <span className="font-semibold">canonicalizada</span>, 
            não os coeficientes originais. Isso é necessário para o método simplex funcionar corretamente.
            O valor objetivo real sendo otimizado ainda é baseado na sua função objetivo original.
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="bg-green-100 px-6 py-3 rounded-md border border-green-300 text-center">
          <div className="font-medium text-gray-700">
            Pronto para iniciar a Fase II com uma base viável
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for Phase II Non-Canonical explanation
const PhaseIINonCanonicalExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  return (
    <div className="space-y-6">
      <div className="prose prose-sm max-w-none">
        <div 
          dangerouslySetInnerHTML={{ 
            __html: explanation
              .replace(/\n/g, '<br/>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/### (.*?)<br\/>/g, '<h3 class="text-xl font-semibold text-blue-700 mb-4">$1</h3>')
              .replace(/#### (.*?)<br\/>/g, '<h4 class="text-lg font-semibold text-gray-800 mb-3">$1</h4>')
              .replace(/⚠️/g, '<span class="text-yellow-500">⚠️</span>')
          }} 
        />
      </div>
    </div>
  );
};

// Component for Phase II Canonical explanation
const PhaseIICanonicalExplanation: React.FC<{ explanation: string }> = ({ explanation }) => {
  // Check if this is a step-by-step canonicalization
  const isStepByStep = explanation.includes('Canonicalização da Fase II - Passo');
  
  return (
    <div className="space-y-6">
      <div className={`${isStepByStep ? 'bg-gradient-to-r from-blue-50 to-green-50' : ''} p-6 rounded-lg ${isStepByStep ? 'border border-blue-200 shadow-sm' : ''}`}>
        <div className="prose prose-sm max-w-none">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: explanation
                .replace(/\n/g, '<br/>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/### (.*?)<br\/>/g, '<h3 class="text-xl font-semibold text-green-700 mb-4">$1</h3>')
                .replace(/#### (.*?)<br\/>/g, '<h4 class="text-lg font-semibold text-gray-800 mb-3">$1</h4>')
                .replace(/✅/g, '<span class="text-green-500">✅</span>')
                .replace(/Row 0/g, 'Row 0')
                .replace(/Row (\d+)/g, 'Row $1')
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default StepExplanation;
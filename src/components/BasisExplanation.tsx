import React from 'react';

/**
 * Component that explains what a basis is in linear programming context
 */
const BasisExplanation: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-purple-700">Entendendo a Base em Programação Linear</h3>
      
      <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
        <h4 className="font-semibold mb-2 text-gray-800">O que é uma Base?</h4>
        <p className="text-gray-700 mb-3">
          Em programação linear, uma <span className="font-semibold">base</span> é um conjunto de variáveis que:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Contém exatamente uma variável de cada equação de restrição</li>
          <li>Forma uma matriz quadrada de coeficientes que é inversível (não-singular)</li>
          <li>Permite expressar todas as variáveis básicas em termos de variáveis não-básicas</li>
        </ul>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <h4 className="font-semibold mb-2 text-gray-800">Variáveis Básicas e Não-Básicas</h4>
        <div className="space-y-3">
          <div>
            <p className="font-medium text-gray-800">Variáveis Básicas:</p>
            <ul className="list-disc list-inside ml-4 text-gray-700">
              <li>Variáveis atualmente na base</li>
              <li>Correspondem a colunas com exatamente um '1' e todas as outras entradas '0'</li>
              <li>Essas variáveis podem assumir valores positivos na solução atual</li>
              <li>Seus valores são calculados a partir do lado direito das restrições</li>
            </ul>
          </div>
          
          <div>
            <p className="font-medium text-gray-800">Variáveis Não-Básicas:</p>
            <ul className="list-disc list-inside ml-4 text-gray-700">
              <li>Variáveis que não estão na base</li>
              <li>Fixadas em zero na solução básica atual</li>
              <li>Candidatas potenciais para entrar na base na próxima iteração</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <h4 className="font-semibold mb-2 text-gray-800">A Cada Iteração Simplex</h4>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-medium">1. Variável entrante:</span> Uma variável não-básica entra na base</p>
            <p><span className="font-medium">2. Variável que sai:</span> Uma variável básica sai da base</p>
            <p><span className="font-medium">3. Operação de pivoteamento:</span> Atualiza o tableau para refletir a nova base</p>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <h4 className="font-semibold mb-2 text-gray-800">Por que a Base é Importante</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Cada base corresponde a um ponto de canto (vértice) da região viável</li>
            <li>A solução ótima sempre ocorre em um ponto de canto</li>
            <li>O método simplex move-se de uma base para outra, melhorando o valor objetivo</li>
            <li>Cada iteração nos dá uma nova base e uma nova solução básica viável</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <h4 className="font-semibold mb-2 text-gray-800">Exemplo de Visualização</h4>
        <div className="space-y-2">
          <p className="text-gray-700">
            Em um tableau com 3 restrições e 5 variáveis (incluindo folgas), uma base pode ser:
          </p>
          <div className="font-mono bg-white p-3 rounded border border-gray-300 overflow-x-auto">
            <p>Variáveis básicas: [x₂, s₁, s₃]</p>
            <p>Variáveis não-básicas: [x₁, s₂]</p>
          </div>
          <p className="text-gray-700 mt-2">
            Isso representa um ponto de canto particular da região viável. O método simplex tentará
            encontrar uma base melhor substituindo uma variável básica por uma não-básica.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasisExplanation;
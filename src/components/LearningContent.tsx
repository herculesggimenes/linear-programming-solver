import React, { useState } from 'react';

interface LearningSection {
  title: string;
  content: React.ReactNode;
}

interface LearningContentProps {
  onClose?: () => void;
}

const LearningContent: React.FC<LearningContentProps> = ({ onClose }) => {
  const [activeSection, setActiveSection] = useState(0);
  
  const sections: LearningSection[] = [
    {
      title: "Introdução à Programação Linear",
      content: (
        <div>
          <h3>O que é Programação Linear?</h3>
          <p>
            Programação linear é uma técnica de otimização matemática usada para encontrar o melhor resultado em um modelo matemático
            cujos requisitos são representados por relações lineares.
          </p>
          
          <h3>Componentes Principais</h3>
          <ul>
            <li><strong>Variáveis de Decisão:</strong> Os valores que estamos tentando determinar (ex: x₁, x₂)</li>
            <li><strong>Função Objetivo:</strong> O valor que estamos tentando maximizar ou minimizar</li>
            <li><strong>Restrições:</strong> Limitações sobre os valores possíveis das variáveis de decisão</li>
          </ul>
          
          <div className="mermaid-diagram">
            <img
              src="https://mermaid.ink/img/pako:eNptksFuwjAMhl8l8mknkDptY4LBpGnTDtPOPThNGrfQpEocEKh99yWF0nWcnMTf_-fY8gWUVhY4QnJmDeo0CVtj2Wq025qPB-Gp-BYbNJ8wadpZKtlno5nIWsXZeKLki2h1EyWhVE2YdKYhW46kUop1I8FrUUvpkbAGTXJpDR0Io6xdgpFHVoc263vQ1npp8AT25D2EwOazuk7Pbu-eEP1OqsZaoiH-YRFHFf0u5WpnLI7zjPBFHNWEG3kxabsoSyL8z_HzMtAYCJVH-D3JJBmUd5ViGIVrZZQk5YLt6gG-wEU-Hd01f9R6yJlnbwnIcqOVf3vvSiJKGDW1VHDcmsv-4CvMjf2tgfw4deWVKyq4QVAXnXqS-G4iqONh_-qpEA65rqDxukLv7f07qBm2vbPIUB58Uwmk1-aMY02xAqMgev4C9yCf-w?type=png"
              alt="Componentes da Programação Linear"
            />
          </div>
          
          <h3>Forma Padrão</h3>
          <p>Programas lineares são tipicamente escritos na forma padrão:</p>
          <div className="math-display">
            Maximizar: c₁x₁ + c₂x₂ + ... + cₙxₙ<br />
            Sujeito a:<br />
            a₁₁x₁ + a₁₂x₂ + ... + a₁ₙxₙ ≤ b₁<br />
            a₂₁x₁ + a₂₂x₂ + ... + a₂ₙxₙ ≤ b₂<br />
            ...<br />
            aₘ₁x₁ + aₘ₂x₂ + ... + aₘₙxₙ ≤ bₘ<br />
            x₁, x₂, ..., xₙ ≥ 0
          </div>
        </div>
      )
    },
    {
      title: "Entendendo o Algoritmo Simplex",
      content: (
        <div>
          <h3>Visão Principal do Método Simplex</h3>
          <p>
            O algoritmo simplex se baseia em duas propriedades importantes dos programas lineares:
          </p>
          <ol>
            <li>A solução ótima (se existir) ocorre em um vértice da região viável.</li>
            <li>Podemos mover sistematicamente de vértice em vértice, melhorando o valor objetivo a cada vez.</li>
          </ol>
          
          <div className="mermaid-diagram">
            <img
              src="https://mermaid.ink/img/pako:eNptksGOgjAQhl-lmb3shfZgZtM1EA-GT-ABT14IDNQmUG3bjbAnffdCwYgR5tJm5vv_TsvMCUrDDMeQnNkWdZqEe2PZwbD9yI8H4an4FC3az5jU9SIVbLVvGclSidl0oeSDOLgkiofSFGHSqoY8cUTxIObNqRMVzdJg177NWB1Yrj2NuscbY5TdJ2jkkdmhyfoeVMu9MngCO_MeQkjzRVX5s9tau4Pkd0LVsibq_sUNMefi8wdvnXeexsY3RXm5_c1YHZcF4ZvYV4QbeXNStouy5MmF_PxxNAZC5RF-T-6SDMqnEoZheKmMkghWbC9b-AL3-TzMdf-o9QjAlw_UkOVGK__xXlU8SmgbueSKxunQnROXNDf2v4byY9eVN5iO4ApB3erUI8d3U0A1DfuXTw2FE9c1NN7W6L19egY1w6Z3Btm8KPmhgvRaXXBqKGZgFESvfwIkrwI?type=png"
              alt="Visões Principais do Método Simplex"
            />
          </div>
          
          <h3>Processo Passo a Passo</h3>
          <ol>
            <li>Converter o problema para forma padrão e adicionar variáveis de folga</li>
            <li>Configurar uma solução básica viável inicial (SBV)</li>
            <li>Verificar otimalidade examinando custos reduzidos</li>
            <li>Se não for ótimo, selecionar uma variável entrante (coluna pivô)</li>
            <li>Realizar teste de razão para determinar variável que sai (linha pivô)</li>
            <li>Realizar operação de pivoteamento para mover para uma nova SBV</li>
            <li>Repetir até encontrar a solução ótima</li>
          </ol>
          
          <div className="mermaid-diagram">
            <img
              src="https://mermaid.ink/img/pako:eNpdksFugzAMhl8l8qkn2KGHHTZxoKKqNGk9VOqNA2RpWgph6QpDvPvigYC2ybL9-_-c2BeojGLgCPmFdWjyLDwby84di3f-eRKB8h_Rov2OWdMeUkL6ZRmTZaPEcjaX8lUcXRrFQzEmTJrQiKYjapeIakOUxqa2qLjVrD4X3ogzG9fykyf2zgxvSJcPboEUnWK7hpHsxE7MIXgaW_IOQsj6vW7Ciu3t-gzJc6waa4n6-JtFnF34P6NMdy3Z0hriKOFOCx8VnWj3Cl9htRMm41DDdzDkLT-qM3r_n-bjOG5rIyUJduyoLvANHsrFeDf8VusxVl6CfUKzajSMpfVQEVHKpGukhKLdjaKxUPTVP5gneBBXtbZdRXCDQPRKPUv8NBrY9OxRXroX5rqGJugaQ0r3n6BnOBfHIofy5MdKqO46F5w66iswCpKPPw7hj2k?type=png"
              alt="Fluxo do Algoritmo Simplex"
            />
          </div>
          
          <h3>Representação em Tableau</h3>
          <p>
            O método simplex usa um formato tabular chamado "tableau" para realizar cálculos.
            Cada linha representa uma restrição, e as colunas representam variáveis e o lado direito (LD).
          </p>
          
          <div className="tableau-example">
            <table>
              <thead>
                <tr>
                  <th>Básica</th>
                  <th>x₁</th>
                  <th>x₂</th>
                  <th>s₁</th>
                  <th>s₂</th>
                  <th>LD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>z</td>
                  <td>-3</td>
                  <td>-2</td>
                  <td>0</td>
                  <td>0</td>
                  <td>0</td>
                </tr>
                <tr>
                  <td>s₁</td>
                  <td>2</td>
                  <td>1</td>
                  <td>1</td>
                  <td>0</td>
                  <td>10</td>
                </tr>
                <tr>
                  <td>s₂</td>
                  <td>1</td>
                  <td>2</td>
                  <td>0</td>
                  <td>1</td>
                  <td>8</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )
    },
    {
      title: "A Operação de Pivoteamento",
      content: (
        <div>
          <h3>Entendendo a Operação de Pivoteamento</h3>
          <p>
            A operação de pivoteamento é o núcleo do método simplex. É como movemos de uma solução básica viável
            para outra com um valor objetivo melhor.
          </p>
          
          <h3>Passo 1: Selecionar Variável Entrante</h3>
          <p>
            Escolha a variável não-básica com o coeficiente mais negativo na linha objetivo (para maximização).
            Esta variável entrará na base.
          </p>
          
          <h3>Passo 2: Selecionar Variável que Sai</h3>
          <p>
            Determine qual variável básica deve sair da base usando o teste de razão mínima:
          </p>
          <ul>
            <li>Calcular razão = LD / coeficiente da variável entrante (apenas para coeficientes positivos)</li>
            <li>Escolher a variável básica com a menor razão positiva</li>
          </ul>
          
          <div className="mermaid-diagram">
            <img
              src="https://mermaid.ink/img/pako:eNpdksGOgjAQhl-lmb3sRfZgMhs2Qjjs4R18AL3NhmJtoFq2C2FP-u6FgohEOzX95_-mnemcQWlmMcHszPZosizujeXpzd77-XgQgYov0aL9iEmzXaSCfWktE1mjOBsvlXwRR5fG8VBMiJMtGvLkGXCBybTZ0RLPNgUgYz2zRR04sexkbWfp8ANdFyZcE7ukDzikFWGkBmPrnrAGy_JgLV3oSJDD9GFpSz6BzautybsO4rzdQJvU1z24E0dDktXv9cscsWftmvxvwWXeKuy2hiSu8KDFQVUncr6H77B9YXec6ktvx-PxqI2UJLixozrBBd6VKx6v32s9Rs1LMBjQrDc6RlM7pYgoYzK1UsJsf-dmLLJPb-5OvCuuau3hivAOkejVeiXx02lgPbgjeeV-mOsGmmBrDA537xFNM5yLY5FDdfPjJVR3nQtODfU1GA3Z8y-ggpU6?type=png"
              alt="Operação de Pivoteamento"
            />
          </div>
          
          <h3>Passo 3: Realizar Pivoteamento</h3>
          <p>
            Uma vez que você identificou o elemento pivô (a interseção da coluna entrante e linha que sai),
            realize estas operações de linha:
          </p>
          <ol>
            <li>Divida a linha pivô pelo elemento pivô para torná-lo 1</li>
            <li>Para cada outra linha, subtraia um múltiplo da nova linha pivô para tornar seu valor da coluna entrante 0</li>
          </ol>
          
          <div className="example-pivot">
            <h4>Exemplo de Pivoteamento:</h4>
            <p>Tableau inicial com elemento pivô circulado:</p>
            <div className="tableau">
              <table>
                <tbody>
                  <tr>
                    <td>z</td>
                    <td>-3</td>
                    <td>-2</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>s₁</td>
                    <td className="pivot-element">2</td>
                    <td>1</td>
                    <td>1</td>
                    <td>0</td>
                    <td>10</td>
                  </tr>
                  <tr>
                    <td>s₂</td>
                    <td>1</td>
                    <td>2</td>
                    <td>0</td>
                    <td>1</td>
                    <td>8</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p>Após pivoteamento:</p>
            <div className="tableau">
              <table>
                <tbody>
                  <tr>
                    <td>z</td>
                    <td>0</td>
                    <td>-0.5</td>
                    <td>1.5</td>
                    <td>0</td>
                    <td>15</td>
                  </tr>
                  <tr>
                    <td>x₁</td>
                    <td>1</td>
                    <td>0.5</td>
                    <td>0.5</td>
                    <td>0</td>
                    <td>5</td>
                  </tr>
                  <tr>
                    <td>s₂</td>
                    <td>0</td>
                    <td>1.5</td>
                    <td>-0.5</td>
                    <td>1</td>
                    <td>3</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="note">
            <p>
              <strong>Nota:</strong> Cada operação de pivoteamento nos move de um vértice da região viável para um vértice adjacente
              com um valor objetivo melhor.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Interpretação Geométrica",
      content: (
        <div>
          <h3>Visualizando o Método Simplex</h3>
          <p>
            Para problemas com duas variáveis de decisão, podemos visualizar o método simplex geometricamente.
          </p>
          
          <h3>A Região Viável</h3>
          <p>
            A região viável é o conjunto de todos os pontos que satisfazem todas as restrições. Para um problema 2D, é um polígono.
          </p>
          
          <div className="image-container">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Simplex-method-3-dimensions.png/400px-Simplex-method-3-dimensions.png"
              alt="Exemplo de Região Viável"
            />
            <p className="caption">Uma região viável com o caminho do método simplex destacado</p>
          </div>
          
          <h3>Vértices e Arestas</h3>
          <p>
            O método simplex funciona movendo-se de vértice em vértice ao longo das arestas da região viável.
            Cada vértice corresponde a uma solução básica viável no tableau.
          </p>
          
          <h3>Contornos da Função Objetivo</h3>
          <p>
            A função objetivo pode ser visualizada como uma família de linhas paralelas (ou planos em dimensões maiores).
            O método simplex move-se na direção de melhorar o valor objetivo.
          </p>
          
          <div className="mermaid-diagram">
            <img
              src="https://mermaid.ink/img/pako:eNptkk9rwzAMxb-KMbvsINnBoYeNHTqWrcfCYLeLD4ntxiS2i-3-Yd9905Ila9bgP5Ze3pOeZMEptVKwBX9mLWaB5yfJ012Yj5fg0P8QLebPmKxiW5ScZfticX-Hz-lRP9hocXtc3CUhrpg_-EXE6Wm_KBf3OO-OUL4J8yHidjwuls_l4o1VoqJ8nmzCJBbCrMoruMxDUZXxJhV5vNmdUA9F_NRHb_7O0v0ulCQf6zAaZ2wwDzwnU0ZS8pZr07IacUat68fEZzAQyk7udQkgJNrohhGYZe7KUPIibmuOWCkLHyiqdcMS0N6j0K5W2HnTEHGprGlqRZZ3mk39OA1GppOVuDNsmANtB2vFYqugbZqPducXmDP2fxdGux7bfmvUel8aQ-vaw1ayolEt0MmvyVvuauj6yuKOtG2xtn39AyODYe-kkHJ1Vjrw97Nn2wo6AqXBfPwBHOOzpA?type=png"
              alt="Contornos da Função Objetivo"
            />
          </div>
          
          <h3>Conectando Tableau à Geometria</h3>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Conceito do Tableau</th>
                <th>Interpretação Geométrica</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Variáveis básicas</td>
                <td>Coordenadas definindo o vértice atual</td>
              </tr>
              <tr>
                <td>Variáveis não-básicas</td>
                <td>Variáveis atualmente em zero (não contribuindo)</td>
              </tr>
              <tr>
                <td>Variável entrante</td>
                <td>Direção para mover do vértice atual</td>
              </tr>
              <tr>
                <td>Variável que sai</td>
                <td>Restrição que se tornará ativa</td>
              </tr>
              <tr>
                <td>Operação de pivoteamento</td>
                <td>Movendo de um vértice para um adjacente</td>
              </tr>
              <tr>
                <td>Linha objetivo</td>
                <td>Taxa de mudança do objetivo ao longo das arestas</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      title: "Casos Especiais e Solução de Problemas",
      content: (
        <div>
          <h3>Casos Especiais em Programação Linear</h3>
          
          <div className="case-block">
            <h4>1. Múltiplas Soluções Ótimas</h4>
            <p>
              Ocorre quando uma variável não-básica tem coeficiente zero na linha objetivo na otimalidade.
              Isso significa que há uma aresta da região viável onde o valor objetivo é constante.
            </p>
            <div className="mermaid-diagram">
              <img
                src="https://mermaid.ink/img/pako:eNptksFugzAMhl8l8qnSAN1hh-3SHaZN0ibtsgOHQAxEJGTKASHefXECVLTNlvzb3_87tnGByhgLGeRn0aHJ82QH4OxcyIP_PUlP5VE0AJ-Qm7qtSC19bSy1jVbTYablQbZmEiVDaZow6UIjmmZcjls0T3LR4HJQcw4lGNFydgLr5MUYbY_JvgctO4BDyBZnW1BKbSrqYLZ7MFyCcO3ibVFcQJPfat92Gt8av2G3jFnWyD1aV0fyXcrl7gNG-UjVO4vRSjVuGd5RmhY3sxK47YSj18baMy6E0SHO66lZm8bZudEs7Tu0YQmlbNQTtOhTJDBQyuerw_vEcErJsogvNgPNgUgHRN-TvyTi8r3SKozSrTZaUbJgx8bCB7zL594v_KLW47CM3fvf0GZ76-Lb-6joqQRaRePhYAjySV2IPrSInZr_TVB-mgb7boImHCsAzZ3nkdJvMxTCLe3b4P-YjK-gi6ZC5-3za1BTbHsbUBx9M1RcXptzwTr6NTgD-esPXl6h9w?type=png"
                alt="Múltiplas Soluções Ótimas"
              />
            </div>
          </div>
          
          <div className="case-block">
            <h4>2. Problema Ilimitado</h4>
            <p>
              Ocorre quando uma variável não-básica tem coeficiente negativo na linha objetivo (para maximização),
              mas todas as restrições têm coeficientes não-positivos para essa variável. O objetivo pode aumentar indefinidamente.
            </p>
            <p>
              <strong>Detecção:</strong> Durante o teste de razão, se todos os coeficientes na coluna entrante são ≤ 0,
              o problema é ilimitado.
            </p>
            <div className="mermaid-diagram">
              <img
                src="https://mermaid.ink/img/pako:eNptksFugzAMhl8l8mmn0h12QO3SHTatoE3abQcOgRiIlpB1HBDi3RcnMEFbbcmf_f2_Y8sXKLWyEEM8sTXqOAq2SrONVpud-xyEE_FD1Kr-xKhuZ-7QyKdGUVspNp7MVLyKpZ5F0VBMCJPOa8TrPlnohDdT9Fm3NdZK9X-U0rDm_DL7Hj-L88ZoiJe55xrq-BV79DV2cqQTuJAstK16pfMemU1-20AtNvExjdjDqhRTrJQ7mJPWm0g-Uxp3FxjkAyVvDXrF6jDl9Ile10SsVlpZW-KMa-XjfF6a1XFo7ZVmbdej8UugZS2eYIUuhQNT1Hy6RbxPDYeYzEngthNg3hOJgOh7spfEXLxXShpG6Vppaij6YCc-H9_gXTwd_cQLWvcpGTv3v6FJtzWFt_eh0UmE2oVOZlvoeIgbYoQtJmdl_4vg8Jz69d30jTjUoDr3OXL6taZCuLn9GvwXk_AVrEVVonX2-QXUGNvOBjI-sk0lxKU5E6KjXILSED__AmrInpM?type=png"
                alt="Problema Ilimitado"
              />
            </div>
          </div>
          
          <div className="case-block">
            <h4>3. Problema Inviável</h4>
            <p>
              Ocorre quando não há solução que satisfaça todas as restrições. A região viável é vazia.
            </p>
            <p>
              <strong>Detecção:</strong> Ao usar a Fase I do método simplex, se variáveis artificiais
              permanecem na base com valores positivos, o problema é inviável.
            </p>
          </div>
          
          <div className="case-block">
            <h4>4. Degenerescença</h4>
            <p>
              Ocorre quando uma variável básica tem valor zero. Isso pode causar ciclagem no algoritmo simplex.
            </p>
            <p>
              <strong>Sintomas:</strong> Múltiplas razões mínimas durante o teste de razão, ou iterações que não
              melhoram o valor objetivo.
            </p>
            <p>
              <strong>Solução:</strong> Use técnicas anti-ciclagem como a regra de Bland (escolha a variável de menor índice
              quando houver empates).
            </p>
          </div>
          
          <h3>Dicas de Solução de Problemas</h3>
          <ul>
            <li>Sempre verifique suas operações de tableau para erros aritméticos</li>
            <li>Certifique-se de ter convertido corretamente o problema para forma padrão</li>
            <li>Verifique se todas as variáveis são não-negativas</li>
            <li>Se o problema é inviável, verifique suas restrições por erros</li>
            <li>Se obtiver resultados inesperados, tente grafar o problema (para problemas 2D)</li>
          </ul>
        </div>
      )
    }
  ];
  
  return (
    <div className="learning-content">
      <div className="learning-header">
        <h2>Programação Linear: Materiais de Aprendizagem</h2>
        {onClose && (
          <button onClick={onClose} className="close-button">
            Fechar
          </button>
        )}
      </div>
      
      <div className="learning-navigation">
        {sections.map((section, index) => (
          <button
            key={index}
            className={`nav-button ${activeSection === index ? 'active' : ''}`}
            onClick={() => setActiveSection(index)}
          >
            {section.title}
          </button>
        ))}
      </div>
      
      <div className="section-content">
        {sections[activeSection].content}
      </div>
      
      <div className="navigation-arrows">
        {activeSection > 0 && (
          <button 
            className="arrow-button prev"
            onClick={() => setActiveSection(activeSection - 1)}
          >
            ← Anterior: {sections[activeSection - 1].title}
          </button>
        )}
        
        {activeSection < sections.length - 1 && (
          <button 
            className="arrow-button next"
            onClick={() => setActiveSection(activeSection + 1)}
          >
            Próximo: {sections[activeSection + 1].title} →
          </button>
        )}
      </div>
      
      <style jsx>{`
        .learning-content {
          padding: 20px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 900px;
          margin: 0 auto;
        }
        
        .learning-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .close-button {
          background-color: #f44336;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .learning-navigation {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }
        
        .nav-button {
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9f9f9;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .nav-button.active {
          background-color: #1976d2;
          color: white;
          border-color: #1976d2;
        }
        
        .section-content {
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 4px;
          min-height: 400px;
          margin-bottom: 20px;
        }
        
        .section-content h3 {
          margin-top: 0;
          color: #333;
        }
        
        .section-content p, .section-content li {
          line-height: 1.5;
        }
        
        .navigation-arrows {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
        }
        
        .arrow-button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          background-color: #e3f2fd;
          color: #1976d2;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .arrow-button:hover {
          background-color: #bbdefb;
        }
        
        .arrow-button.next {
          margin-left: auto;
        }
        
        .mermaid-diagram {
          margin: 20px 0;
          text-align: center;
        }
        
        .mermaid-diagram img {
          max-width: 100%;
          border: 1px solid #eee;
          border-radius: 4px;
        }
        
        .math-display {
          font-family: monospace;
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
          line-height: 1.5;
        }
        
        .tableau-example table {
          border-collapse: collapse;
          width: 100%;
          margin: 15px 0;
        }
        
        .tableau-example th, .tableau-example td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }
        
        .tableau-example th {
          background-color: #f5f5f5;
        }
        
        .example-pivot {
          margin: 20px 0;
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 4px;
        }
        
        .pivot-element {
          background-color: #ffcb6b;
          font-weight: bold;
          border-radius: 50%;
        }
        
        .case-block {
          margin-bottom: 20px;
          padding: 15px;
          border-left: 4px solid #1976d2;
          background-color: #f5f5f5;
        }
        
        .case-block h4 {
          margin-top: 0;
          color: #1976d2;
        }
        
        .image-container {
          text-align: center;
          margin: 20px 0;
        }
        
        .image-container img {
          max-width: 100%;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .caption {
          font-style: italic;
          color: #666;
          margin-top: 8px;
        }
        
        .compare-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        
        .compare-table th, .compare-table td {
          padding: 10px;
          border: 1px solid #ddd;
        }
        
        .compare-table th {
          background-color: #f5f5f5;
        }
        
        .note {
          margin-top: 20px;
          padding: 15px;
          background-color: #fff8e1;
          border-left: 4px solid #ffc107;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default LearningContent;
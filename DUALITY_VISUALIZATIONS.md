# Visualizações Gráficas da Dualidade

## Visão Geral

Este documento descreve as visualizações gráficas interativas criadas para explicar os conceitos de dualidade em programação linear.

## Componentes Principais

### 1. Visualização da Dualidade Forte

**Arquivo**: `DualityGraphicalVisualizations.tsx`

#### Características:
- Mostra graficamente as regiões viáveis do primal e dual
- Demonstra que `cx ≤ yb` para todas as soluções viáveis
- Destaca o ponto ótimo onde `cx* = y*b`
- Botão interativo para mostrar/ocultar a solução ótima

#### Conceitos Ilustrados:
- Teorema da Dualidade Fraca
- Teorema da Dualidade Forte
- Relação entre valores objetivos primal e dual

### 2. Visualização dos Preços Sombra

#### Características:
- Lista interativa dos recursos com seus preços sombra
- Gráfico mostrando a sensibilidade linear do valor ótimo
- Destaque visual para recursos com folga (preço sombra = 0)

#### Conceitos Ilustrados:
- Interpretação econômica dos preços sombra
- Valor marginal de cada recurso
- Relação linear entre mudança no RHS e mudança no valor ótimo

### 3. Visualização da Folga Complementar

#### Características:
- 4 cenários interativos demonstrando as condições
- Animação visual das implicações primal-dual
- Formulação matemática apresentada visualmente

#### Cenários:
1. Variável básica primal → Restrição dual ativa
2. Restrição dual com folga → Variável primal zero
3. Restrição primal ativa → Variável dual positiva
4. Restrição primal com folga → Variável dual zero

### 4. Visualização do Equilíbrio Econômico

#### Características:
- Diagrama de fluxo econômico interativo
- Três agentes: Produtor, Mercado, Dono dos Recursos
- Animação mostrando o fluxo de valor no equilíbrio

#### Conceitos Ilustrados:
- Interpretação de mercado da dualidade
- Equilíbrio entre lucro e custo de oportunidade
- Papel dos preços sombra como preços de mercado

## Visualizações dos Teoremas

### 1. Teorema da Dualidade Fraca

**Arquivo**: `DualityTheoremsVisualization.tsx`

#### Visualização:
- Eixo vertical mostrando valores de função objetivo
- Pontos representando soluções viáveis primal e dual
- Linha vermelha indicando o limite `cx ≤ yb`
- Destaque do ponto ótimo onde a igualdade vale

#### Interatividade:
- Botão para mostrar demonstração visual
- Passo a passo da prova matemática

### 2. Casos Especiais

#### Visualização:
- 4 casos interativos com ícones visuais
- Cores indicando status (viável, inviável, ilimitado)
- Exemplo gráfico para o caso de primal ilimitado

#### Casos Cobertos:
1. Primal ilimitado → Dual inviável
2. Primal inviável → Dual ilimitado/inviável
3. Ambos viáveis → Ambos têm ótimo
4. Ambos inviáveis (caso raro)

### 3. Análise de Sensibilidade

#### Visualização:
- Controles deslizantes para ajustar parâmetros
- Gráficos em tempo real mostrando impacto das mudanças
- Indicadores de validade do intervalo

#### Tipos de Análise:
1. **Coeficientes do Objetivo**: 
   - Mostra mudança nas restrições duais
   - Verifica se a base permanece ótima

2. **Valores RHS**:
   - Gráfico linear do impacto via preço sombra
   - Cálculo automático de Δz* = y* × Δb
   - Indicação do intervalo de validade

## Exemplo Interativo

**Arquivo**: `DualityInteractiveExample.tsx`

### Características:
- Animação passo a passo de um problema completo
- Controles de reprodução/pausa
- Barra de progresso visual
- 5 etapas explicativas

### Etapas:
1. **Problema Primal**: Apresentação do contexto
2. **Construção do Dual**: Criação das variáveis duais
3. **Interpretação Econômica**: Significado dos preços sombra
4. **Solução Ótima**: Demonstração da igualdade z* = w*
5. **Análise de Sensibilidade**: Aplicação prática

## Aspectos Técnicos

### Tecnologias Utilizadas:
- React com TypeScript
- SVG para gráficos vetoriais
- Tailwind CSS para estilização
- Lucide React para ícones
- Animações CSS para transições suaves

### Padrões de Design:
- Componentes funcionais com hooks
- Estado local para interatividade
- Props tipadas com TypeScript
- Separação de concerns entre visualização e lógica

## Benefícios Educacionais

1. **Aprendizado Visual**: Conceitos abstratos tornam-se concretos
2. **Interatividade**: Exploração ativa melhora retenção
3. **Progressão Gradual**: Complexidade aumenta progressivamente
4. **Feedback Imediato**: Mudanças refletem instantaneamente
5. **Múltiplas Perspectivas**: Mesmos conceitos sob diferentes ângulos

## Como Usar

1. Navegue até a aba "Análise de Dualidade"
2. Explore as visualizações gráficas
3. Interaja com controles e botões
4. Observe como mudanças afetam os resultados
5. Use o exemplo interativo para uma visão completa

## Melhorias Futuras

1. Adicionar mais exemplos de diferentes domínios
2. Implementar visualização 3D para problemas com 3 variáveis
3. Criar modo de comparação lado a lado
4. Adicionar exportação de gráficos como imagem
5. Implementar tour guiado interativo
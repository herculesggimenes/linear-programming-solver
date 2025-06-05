# Abordagem Narrativa da Dualidade

## Visão Geral

A funcionalidade de dualidade agora usa uma abordagem narrativa que conta a história da dualidade de forma personalizada para cada problema específico selecionado pelo usuário.

## Como Funciona

### 1. Detecção Automática do Tipo de Problema

O sistema analisa a estrutura do problema selecionado e identifica automaticamente seu tipo:

- **Problema de Produção**: Maximização com restrições ≤ (recursos limitados)
- **Problema de Dieta**: Minimização com restrições ≥ (requisitos mínimos)
- **Problema de Transporte**: Presença de restrições de igualdade
- **Problema Genérico**: Outros casos

### 2. Narrativa Personalizada

Para cada tipo de problema, uma narrativa específica é criada com:

- **Contexto Relevante**: História que faz sentido para aquele tipo de problema
- **Capítulos Progressivos**: 4-5 capítulos que constroem o entendimento gradualmente
- **Visualizações Específicas**: Gráficos adaptados ao contexto do problema
- **Insights Práticos**: Conclusões aplicáveis ao mundo real

### 3. Estrutura dos Capítulos

#### Problema de Produção
1. **O Desafio do Produtor**: Apresenta o problema de maximizar lucro com recursos limitados
2. **A Perspectiva do Mercado**: Introduz o conceito de precificar recursos
3. **Os Preços Sombra**: Explica o valor marginal de cada recurso
4. **Equilíbrio Perfeito**: Demonstra o teorema da dualidade forte
5. **Decisões Complementares**: Ilustra a folga complementar

#### Problema de Dieta
1. **O Desafio Nutricional**: Minimizar custo atendendo requisitos
2. **O Vendedor de Suplementos**: Perspectiva dual de vender nutrientes
3. **Valor dos Nutrientes**: Preço implícito de cada nutriente
4. **Equilíbrio de Mercado**: Equivalência entre dieta e suplementos

## Componentes Visuais

### Visualizações por Capítulo

- **primal-setup**: Mostra o problema original com ícones contextuais
- **dual-setup**: Apresenta as variáveis duais e sua interpretação
- **shadow-prices**: Lista interativa dos preços sombra com explicações
- **equilibrium**: Demonstração visual da igualdade z* = w*
- **complementary**: Regras de folga complementar ilustradas

### Design Responsivo

- Ícones relevantes para cada contexto (fábrica, dinheiro, gráficos)
- Cores coordenadas (azul para primal, verde para dual, amarelo para equilíbrio)
- Transições suaves entre capítulos
- Layout adaptável para diferentes tamanhos de tela

## Benefícios da Abordagem Narrativa

### 1. Contextualização
- Conceitos abstratos ganham significado concreto
- Exemplos do mundo real facilitam compreensão
- Conexão emocional com a história aumenta retenção

### 2. Progressão Natural
- Complexidade aumenta gradualmente
- Cada capítulo constrói sobre o anterior
- Revelações no momento certo mantêm interesse

### 3. Personalização
- História muda conforme o problema selecionado
- Números e exemplos são específicos do problema
- Interpretações fazem sentido no contexto

### 4. Simplicidade
- Foco em uma narrativa coesa
- Menos sobrecarga cognitiva
- Interface limpa e intuitiva

## Exemplo de Uso

1. Usuário seleciona um problema (ex: "Dualidade: Produção")
2. Sistema detecta que é um problema de maximização com recursos
3. Narrativa de produção é gerada automaticamente
4. Usuário navega pelos capítulos com botões anterior/próximo
5. Cada capítulo apresenta um aspecto da dualidade no contexto

## Implementação Técnica

### Arquitetura
```typescript
createNarrative(primal, dual) → detectProblemType() → 
  → createProductionNarrative() ou
  → createDietNarrative() ou
  → createGenericNarrative()
```

### Componentes Principais
- `DualityNarrative`: Componente principal com navegação
- `ChapterVisualization`: Renderiza visualização específica
- `PrimalSetupViz`, `DualSetupViz`, etc.: Visualizações individuais

### Estado e Navegação
- Estado simples: apenas `currentChapter`
- Indicadores de progresso visuais
- Navegação intuitiva com feedback visual

## Conclusão

Esta abordagem narrativa transforma o aprendizado da dualidade de uma experiência técnica e fragmentada em uma jornada coesa e significativa, onde cada conceito é apresentado no momento certo e no contexto certo para o problema específico que o usuário está explorando.
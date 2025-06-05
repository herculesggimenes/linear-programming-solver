# Funcionalidade de Análise de Dualidade

## Resumo

Foi adicionada uma nova funcionalidade ao Visualizador do Método Simplex que permite converter problemas de programação linear para sua forma dual e entender as implicações dessa conversão.

## Características Principais

### 1. Conversão Automática Primal-Dual
- Converte automaticamente problemas de maximização para minimização dual e vice-versa
- Suporta todos os tipos de restrições (≤, ≥, =)
- Calcula corretamente as variáveis duais e suas restrições

### 2. Visualização Interativa
- **Comparação lado a lado**: Mostra o problema primal e dual em cards separados
- **Visualização matricial**: Exibe como a matriz de restrições é transposta
- **Abas informativas**: Organiza o conteúdo em seções fáceis de navegar

### 3. Conteúdo Educacional

#### Aba "Conversão"
- Passos detalhados da conversão primal-dual
- Regras de transformação para diferentes tipos de restrições
- Explicação visual de como os coeficientes são mapeados

#### Aba "Implicações"
- Teorema da Dualidade Forte
- Interpretação dos preços sombra
- Condições de folga complementar
- Análise de sensibilidade

#### Aba "Interpretação"
- Perspectiva econômica do primal (produtor)
- Perspectiva econômica do dual (mercado)
- Conceito de equilíbrio econômico

#### Aba "Teoremas"
- Teorema da Dualidade Fraca
- Teorema da Dualidade Forte
- Teorema da Folga Complementar
- Casos especiais (ilimitado, inviável)

## Como Usar

1. Selecione um problema de exemplo ou crie um problema personalizado
2. Clique na aba "Análise de Dualidade" no modo de visualização
3. Explore as diferentes abas para entender a conversão e suas implicações

## Exemplos Incluídos

### Dualidade: Produção
- Problema de maximização com 3 restrições de recursos
- Demonstra como os preços sombra representam o valor marginal dos recursos

### Dualidade: Dieta
- Problema de minimização com requisitos nutricionais
- Mostra a interpretação dual de um problema de minimização de custos

## Implementação Técnica

### Arquivos Principais
- `src/lib/duality-converter.ts`: Lógica de conversão primal-dual
- `src/components/DualityVisualizer.tsx`: Componente de visualização
- `src/lib/duality-converter.test.ts`: Testes unitários

### Componentes React
- Usa componentes React nativos em vez de markdown
- Interface responsiva com Tailwind CSS
- Visualizações interativas com cores e ícones

## Benefícios Educacionais

1. **Compreensão Visual**: A visualização lado a lado facilita entender a relação entre primal e dual
2. **Aprendizado Progressivo**: As abas permitem explorar diferentes aspectos no próprio ritmo
3. **Aplicação Prática**: Exemplos econômicos mostram aplicações reais da dualidade
4. **Teoria Completa**: Cobre todos os teoremas fundamentais da dualidade

## Próximas Melhorias Possíveis

1. Adicionar animação na transposição da matriz
2. Incluir solução ótima do primal e dual para comparação
3. Mostrar graficamente a relação entre as soluções
4. Adicionar mais exemplos de diferentes domínios
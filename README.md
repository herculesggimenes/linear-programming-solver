# Aplicação Interativa de Aprendizado do Método Simplex

Uma aplicação visual e interativa para aprender o método simplex, programação linear e teoria da dualidade.

## Funcionalidades

- **Visualização Interativa do Tableau Simplex**: Acompanhe cada passo do método simplex com operações destacadas visualmente
- **Visualização Geométrica com Visx**: Veja como o método simplex navega pela região viável em problemas 2D
- **Modo de Dualidade**: Converta problemas primais para seus duais e explore a teoria da dualidade
- **Aprendizado Passo a Passo**: Siga explicações detalhadas em cada etapa do algoritmo
- **Problemas de Exemplo**: Experimente diferentes problemas pré-carregados para entender vários casos
- **Entrada Personalizada**: Insira seus próprios problemas de programação linear com suporte para variáveis irrestritas
- **Interface Moderna com shadcn/ui**: Interface limpa e responsiva usando Tailwind CSS e componentes shadcn/ui
- **Totalmente em Português**: Interface e explicações completamente traduzidas para português brasileiro

## Estrutura do Projeto

```
linear-programming/
├── src/
│   ├── components/
│   │   ├── BasisExplanation.tsx        # Explicação sobre base e variáveis básicas
│   │   ├── CustomProblemInput.tsx      # Entrada personalizada de problemas
│   │   ├── DualityNarrative.tsx        # Narrativa interativa sobre dualidade
│   │   ├── DualityVisualizer.tsx       # Visualização da conversão primal-dual
│   │   ├── GeometricVisualizerVisx.tsx # Visualização geométrica com Visx
│   │   ├── LearningContent.tsx         # Conteúdo educacional e tutoriais
│   │   ├── SimplexVisualizer.tsx       # Componente principal de visualização
│   │   ├── StandardFormExplanation.tsx # Explicação da conversão para forma padrão
│   │   ├── StepController.tsx          # Navegação pelos passos do simplex
│   │   ├── StepExplanation.tsx         # Explicações detalhadas de cada passo
│   │   ├── StructuredProblemForm.tsx   # Formulário estruturado para entrada
│   │   ├── TableauVisualizer.tsx       # Visualização e destaque do tableau
│   │   └── ui/                         # Componentes shadcn/ui
│   ├── lib/
│   │   ├── duality-converter.ts        # Conversão primal-dual
│   │   ├── phase-one-solver.ts         # Implementação da Fase 1 do Simplex
│   │   ├── phase-two-solver.ts         # Implementação da Fase 2 do Simplex
│   │   ├── simplex-solver.ts           # Algoritmo simplex principal
│   │   └── standard-form-conversion.ts # Conversão para forma padrão
│   ├── app.tsx                         # Componente principal da aplicação
│   └── main.tsx                        # Ponto de entrada
```

## Tecnologias Utilizadas

- React com TypeScript
- Tailwind CSS para estilização
- shadcn/ui para componentes de UI
- Visx (anteriormente D3.js) para visualizações interativas
- Vite para build e desenvolvimento

## Caminho de Aprendizado

A aplicação está estruturada para guiar os usuários através do método simplex e dualidade em etapas-chave:

1. **Entendendo Programação Linear**: Aprenda sobre variáveis de decisão, funções objetivo e restrições
2. **Básicos do Método Simplex**: Entenda a estrutura do tableau e soluções básicas viáveis
3. **Operações de Pivô**: Aprenda a selecionar variáveis que entram/saem e realizar pivôs
4. **Interpretação Geométrica**: Visualize como o método simplex navega pelos vértices da região viável
5. **Casos Especiais**: Aprenda sobre múltiplas soluções ótimas, ilimitação e inviabilidade
6. **Teoria da Dualidade**: Converta problemas primais para duais e entenda suas relações

## Visualizações Interativas

### Modo Simplex
- **Visualização do Tableau**: Tabela interativa que destaca variáveis que entram, variáveis que saem e elementos pivô
- **Visualização Geométrica**: Visualização Visx da região viável, restrições e ponto de solução atual
- **Controles Passo a Passo**: Navegue pelos passos do algoritmo com controles de avançar/retroceder
- **Explicações Detalhadas**: Cada passo inclui explicações sobre o que está acontecendo e por quê

### Modo Dualidade
- **Conversão Primal-Dual**: Visualize a conversão do problema primal para seu dual
- **Narrativa Interativa**: História personalizada baseada no tipo de problema selecionado
- **Cálculos Detalhados**: Veja todos os passos da conversão com explicações
- **Teoremas Visuais**: Visualizações dos teoremas da dualidade fraca, forte e folga complementar

## Problemas de Exemplo

A aplicação inclui exemplos pré-configurados para demonstrar diferentes cenários:

### Problemas Simplex
- **Exemplo 1-3**: Problemas básicos de maximização com duas variáveis
- **Problema Ilimitado**: Demonstra um caso onde o valor objetivo pode crescer indefinidamente
- **Variáveis Livres**: Problema com variáveis irrestritas (sem restrição de sinal)
- **Conversão para Forma Padrão**: Exemplos mostrando diferentes tipos de conversão
- **Minimização**: Problemas de minimização com diferentes estruturas de restrições

### Problemas de Dualidade
- **Problema de Produção**: Maximização com recursos limitados
- **Problema de Dieta**: Minimização com requisitos mínimos
- **Exemplos com Variáveis Irrestritas**: Demonstra conversão dual com variáveis livres

## Entrada Personalizada

A aplicação suporta entrada personalizada de problemas com as seguintes funcionalidades:

### Formato Suportado
```
Maximizar (ou Minimizar)
3x1 + 2x2

Sujeito a
2x1 + x2 <= 10
x1 + 2x2 >= 8
x1 + x2 = 5
x1 >= 0, x2 irrestrito
```

### Características
- **Tipos de Restrições**: Suporta ≤, ≥, e = 
- **Variáveis Irrestritas**: Use "irrestrito", "livre" ou "unrestricted"
- **Conversão Automática**: Converte automaticamente para forma padrão quando necessário
- **Validação**: Verifica erros de sintaxe e fornece feedback útil

## Requisitos e Instalação

Para executar a aplicação:

1. Clone o repositório
2. Instale as dependências com `npm install` ou `pnpm install`
3. Execute o servidor de desenvolvimento com `npm run dev` ou `pnpm dev`
4. Abra http://localhost:5173 para visualizar a aplicação

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila a aplicação para produção
- `npm run lint` - Executa o linter para verificar problemas de código
- `npm test` - Executa os testes (usando Vitest)

## Autor

Criado por [Hercules Gimenes](https://www.linkedin.com/in/herculesgg/)

## Contribuições

Contribuições são bem-vindas! Por favor, sinta-se à vontade para submeter um Pull Request.

## Licença

Este projeto está sob a licença MIT.
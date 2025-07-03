/**
 * Integer Programming (IP) and Mixed Integer Programming (MIP) solver
 * Implements Branch and Bound algorithm for solving integer constraints
 */

import type { LinearProgram } from '@/components/types';
import { solveWithSteps } from './simplex-solver';

export interface IntegerConstraint {
  variableIndex: number;
  variableName: string;
  mustBeInteger: boolean;
}

export interface IntegerProgram extends LinearProgram {
  integerConstraints: IntegerConstraint[];
}

export interface BranchAndBoundNode {
  id: string;
  parentId?: string;
  problem: LinearProgram;
  solution?: {
    values: number[];
    objectiveValue: number;
    feasible: boolean;
  };
  bound: number;
  depth: number;
  branchVariable?: number;
  branchDirection?: 'up' | 'down';
  status: 'active' | 'fathomed' | 'branched' | 'integer';
  reason?: string;
}

export interface BranchAndBoundStep {
  currentNode: BranchAndBoundNode;
  tree: BranchAndBoundNode[];
  incumbentSolution?: {
    values: number[];
    objectiveValue: number;
  };
  explanation: string;
  action: 'select' | 'solve' | 'branch' | 'fathom' | 'update_incumbent' | 'optimal';
}

/**
 * Check if a value is effectively an integer (within tolerance)
 */
function isInteger(value: number, tolerance: number = 1e-6): boolean {
  return Math.abs(value - Math.round(value)) < tolerance;
}

/**
 * Find the most fractional variable among integer-constrained variables
 */
function findBranchingVariable(
  solution: number[], 
  integerConstraints: IntegerConstraint[]
): number | null {
  let maxFractionalPart = 0;
  let branchingVar: number | null = null;
  
  for (const constraint of integerConstraints) {
    const value = solution[constraint.variableIndex];
    const fractionalPart = Math.abs(value - Math.round(value));
    
    if (fractionalPart > 1e-6 && fractionalPart > maxFractionalPart) {
      maxFractionalPart = fractionalPart;
      branchingVar = constraint.variableIndex;
    }
  }
  
  return branchingVar;
}

/**
 * Create a child node by adding a branching constraint
 */
function createBranchNode(
  parent: BranchAndBoundNode,
  variableIndex: number,
  direction: 'up' | 'down',
  nodeCounter: { count: number }
): BranchAndBoundNode {
  const newProblem = JSON.parse(JSON.stringify(parent.problem)) as LinearProgram;
  const currentValue = parent.solution!.values[variableIndex];
  
  // Add branching constraint
  const newConstraint = {
    coefficients: new Array(newProblem.objective.length).fill(0),
    rhs: direction === 'down' 
      ? Math.floor(currentValue) 
      : Math.ceil(currentValue),
    operator: direction === 'down' ? '<=' : '>=' as '<=' | '>='
  };
  newConstraint.coefficients[variableIndex] = 1;
  
  newProblem.constraints.push(newConstraint);
  
  return {
    id: `Nó ${nodeCounter.count++}`,
    parentId: parent.id,
    problem: newProblem,
    bound: parent.bound,
    depth: parent.depth + 1,
    branchVariable: variableIndex,
    branchDirection: direction,
    status: 'active'
  };
}

/**
 * Solve the linear relaxation of a node
 */
function solveRelaxation(node: BranchAndBoundNode): {
  feasible: boolean;
  values: number[];
  objectiveValue: number;
} {
  const steps = solveWithSteps(node.problem);
  const finalStep = steps[steps.length - 1];
  
  if (finalStep.status === 'optimal') {
    const values = new Array(node.problem.objective.length).fill(0);
    const tableau = finalStep.tableau;
    
    // Extract solution values
    for (let i = 0; i < tableau.basicVariables.length; i++) {
      const varIndex = tableau.basicVariables[i];
      if (varIndex < node.problem.objective.length) {
        values[varIndex] = tableau.matrix[i + 1][tableau.matrix[0].length - 1];
      }
    }
    
    return {
      feasible: true,
      values,
      objectiveValue: tableau.objectiveValue
    };
  }
  
  return {
    feasible: false,
    values: [],
    objectiveValue: node.problem.isMaximization ? -Infinity : Infinity
  };
}

/**
 * Check if all integer constraints are satisfied
 */
function isIntegerFeasible(
  solution: number[], 
  integerConstraints: IntegerConstraint[]
): boolean {
  return integerConstraints.every(constraint => 
    isInteger(solution[constraint.variableIndex])
  );
}

/**
 * Select the next node to explore (best-first search)
 */
function selectNode(
  nodes: BranchAndBoundNode[], 
  isMaximization: boolean
): BranchAndBoundNode | null {
  const activeNodes = nodes.filter(n => n.status === 'active');
  
  if (activeNodes.length === 0) return null;
  
  // Select node with best bound
  return activeNodes.reduce((best, node) => {
    if (isMaximization) {
      return node.bound > best.bound ? node : best;
    } else {
      return node.bound < best.bound ? node : best;
    }
  });
}

/**
 * Solve an integer programming problem using Branch and Bound
 */
export function solveBranchAndBound(
  problem: IntegerProgram,
  maxIterations: number = 100
): BranchAndBoundStep[] {
  const steps: BranchAndBoundStep[] = [];
  const nodeCounter = { count: 1 };
  
  // Initialize with root node (linear relaxation)
  const rootNode: BranchAndBoundNode = {
    id: `Nó ${nodeCounter.count++}`,
    problem: problem,
    bound: problem.isMaximization ? Infinity : -Infinity,
    depth: 0,
    status: 'active'
  };
  
  const tree: BranchAndBoundNode[] = [rootNode];
  let incumbentSolution: { values: number[]; objectiveValue: number } | undefined;
  let iteration = 0;
  
  while (iteration < maxIterations) {
    // Select next node
    const currentNode = selectNode(tree, problem.isMaximization);
    if (!currentNode) break;
    
    steps.push({
      currentNode,
      tree: [...tree],
      incumbentSolution,
      explanation: `Selecionando nó ${currentNode.id} com bound ${
        currentNode.bound === Infinity ? 'infinito' : currentNode.bound.toFixed(2)
      }`,
      action: 'select'
    });
    
    // Solve linear relaxation
    const solution = solveRelaxation(currentNode);
    currentNode.solution = solution;
    
    // Add a step to show the solution was found
    steps.push({
      currentNode,
      tree: [...tree],
      incumbentSolution,
      explanation: solution.feasible 
        ? `Relaxação linear resolvida. Valor objetivo: ${solution.objectiveValue.toFixed(2)}`
        : `Relaxação linear infactível`,
      action: 'solve'
    });
    
    if (!solution.feasible) {
      currentNode.status = 'fathomed';
      currentNode.reason = 'Infactível';
      steps.push({
        currentNode,
        tree: [...tree],
        incumbentSolution,
        explanation: 'Nó infactível, podando esta ramificação',
        action: 'fathom'
      });
      iteration++;
      continue;
    }
    
    currentNode.bound = solution.objectiveValue;
    
    // Check if we can prune by bound
    if (incumbentSolution) {
      const canPrune = problem.isMaximization 
        ? solution.objectiveValue <= incumbentSolution.objectiveValue
        : solution.objectiveValue >= incumbentSolution.objectiveValue;
        
      if (canPrune) {
        currentNode.status = 'fathomed';
        currentNode.reason = 'Limitado por melhor solução';
        steps.push({
          currentNode,
          tree: [...tree],
          incumbentSolution,
          explanation: `Bound ${solution.objectiveValue.toFixed(2)} não é melhor que a melhor solução ${incumbentSolution.objectiveValue.toFixed(2)}`,
          action: 'fathom'
        });
        iteration++;
        continue;
      }
    }
    
    // Check if solution is integer feasible
    if (isIntegerFeasible(solution.values, problem.integerConstraints)) {
      currentNode.status = 'integer';
      
      // Update incumbent if better
      if (!incumbentSolution || 
          (problem.isMaximization && solution.objectiveValue > incumbentSolution.objectiveValue) ||
          (!problem.isMaximization && solution.objectiveValue < incumbentSolution.objectiveValue)) {
        incumbentSolution = {
          values: solution.values,
          objectiveValue: solution.objectiveValue
        };
        steps.push({
          currentNode,
          tree: [...tree],
          incumbentSolution,
          explanation: `Nova solução inteira encontrada: ${solution.objectiveValue.toFixed(2)}`,
          action: 'update_incumbent'
        });
      }
    } else {
      // Branch on fractional variable
      const branchVar = findBranchingVariable(solution.values, problem.integerConstraints);
      
      if (branchVar !== null) {
        currentNode.status = 'branched';
        
        // Create child nodes
        const downNode = createBranchNode(currentNode, branchVar, 'down', nodeCounter);
        const upNode = createBranchNode(currentNode, branchVar, 'up', nodeCounter);
        
        tree.push(downNode, upNode);
        
        const varName = problem.variables[branchVar];
        const currentValue = solution.values[branchVar];
        
        steps.push({
          currentNode,
          tree: [...tree],
          incumbentSolution,
          explanation: `Ramificando em ${varName} = ${currentValue.toFixed(2)}: ${varName} ≤ ${Math.floor(currentValue)} ou ${varName} ≥ ${Math.ceil(currentValue)}`,
          action: 'branch'
        });
      }
    }
    
    iteration++;
  }
  
  // Final step
  if (incumbentSolution) {
    steps.push({
      currentNode: tree[0],
      tree: [...tree],
      incumbentSolution,
      explanation: `Solução ótima inteira encontrada: ${incumbentSolution.objectiveValue.toFixed(2)}`,
      action: 'optimal'
    });
  }
  
  return steps;
}

/**
 * Create example integer programming problems
 */
export function createIntegerProgrammingExamples(): { [key: string]: IntegerProgram } {
  return {
    // Knapsack problem
    knapsack: {
      objective: [7, 9, 5, 12, 14, 6, 12],
      isMaximization: true,
      constraints: [
        { coefficients: [2, 3, 2, 4, 5, 3, 4], rhs: 15, operator: '<=' }
      ],
      variables: ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7'],
      variableRestrictions: [true, true, true, true, true, true, true],
      integerConstraints: [
        { variableIndex: 0, variableName: 'x1', mustBeInteger: true },
        { variableIndex: 1, variableName: 'x2', mustBeInteger: true },
        { variableIndex: 2, variableName: 'x3', mustBeInteger: true },
        { variableIndex: 3, variableName: 'x4', mustBeInteger: true },
        { variableIndex: 4, variableName: 'x5', mustBeInteger: true },
        { variableIndex: 5, variableName: 'x6', mustBeInteger: true },
        { variableIndex: 6, variableName: 'x7', mustBeInteger: true }
      ]
    },
    
    // Simple integer example
    simpleInteger: {
      objective: [3, 2],
      isMaximization: true,
      constraints: [
        { coefficients: [2, 1], rhs: 6, operator: '<=' },
        { coefficients: [1, 2], rhs: 6, operator: '<=' }
      ],
      variables: ['x', 'y'],
      variableRestrictions: [true, true],
      integerConstraints: [
        { variableIndex: 0, variableName: 'x', mustBeInteger: true },
        { variableIndex: 1, variableName: 'y', mustBeInteger: true }
      ]
    },
    
    // Mixed integer (only x is integer)
    mixedInteger: {
      objective: [4, 3],
      isMaximization: true,
      constraints: [
        { coefficients: [3, 2], rhs: 12, operator: '<=' },
        { coefficients: [1, 2], rhs: 8, operator: '<=' }
      ],
      variables: ['x', 'y'],
      variableRestrictions: [true, true],
      integerConstraints: [
        { variableIndex: 0, variableName: 'x', mustBeInteger: true }
      ]
    }
  };
}
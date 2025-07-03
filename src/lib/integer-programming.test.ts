import { describe, it, expect } from 'vitest';
import {
  solveBranchAndBound,
  createIntegerProgrammingExamples,
  type IntegerProgram,
  type BranchAndBoundStep
} from './integer-programming';

describe('Integer Programming - Branch and Bound', () => {
  it('should solve a simple integer programming problem', () => {
    const problem: IntegerProgram = {
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
    };

    const steps = solveBranchAndBound(problem);
    
    expect(steps).toBeDefined();
    expect(steps.length).toBeGreaterThan(0);
    
    // Check that we found an optimal solution
    const finalStep = steps[steps.length - 1];
    expect(finalStep.action).toBe('optimal');
    expect(finalStep.incumbentSolution).toBeDefined();
    
    // The optimal solution should be x=2, y=2 with objective value 10
    const solution = finalStep.incumbentSolution!;
    expect(solution.values[0]).toBe(2);
    expect(solution.values[1]).toBe(2);
    expect(solution.objectiveValue).toBe(10);
  });

  it('should handle mixed integer programming (only some variables are integer)', () => {
    const problem: IntegerProgram = {
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
        // y is continuous
      ]
    };

    const steps = solveBranchAndBound(problem);
    const finalStep = steps[steps.length - 1];
    
    expect(finalStep.incumbentSolution).toBeDefined();
    const solution = finalStep.incumbentSolution!;
    
    // x should be integer (within tolerance)
    const xValue = solution.values[0];
    expect(Math.abs(xValue - Math.round(xValue))).toBeLessThan(1e-6);
    // y can be fractional
    expect(solution.objectiveValue).toBeGreaterThan(0);
  });

  it('should detect infeasible integer problems', () => {
    const problem: IntegerProgram = {
      objective: [1, 1],
      isMaximization: true,
      constraints: [
        { coefficients: [1, 0], rhs: 1.5, operator: '<=' },
        { coefficients: [1, 0], rhs: 2.5, operator: '>=' }
      ],
      variables: ['x', 'y'],
      variableRestrictions: [true, true],
      integerConstraints: [
        { variableIndex: 0, variableName: 'x', mustBeInteger: true }
      ]
    };

    const steps = solveBranchAndBound(problem);
    
    // Should terminate without finding an integer solution
    const hasFeasibleInteger = steps.some(step => 
      step.incumbentSolution !== undefined
    );
    
    expect(hasFeasibleInteger).toBe(false);
  });

  it('should solve a knapsack problem', () => {
    const problem: IntegerProgram = {
      objective: [7, 9, 5, 12],
      isMaximization: true,
      constraints: [
        { coefficients: [2, 3, 2, 4], rhs: 10, operator: '<=' }
      ],
      variables: ['x1', 'x2', 'x3', 'x4'],
      variableRestrictions: [true, true, true, true],
      integerConstraints: [
        { variableIndex: 0, variableName: 'x1', mustBeInteger: true },
        { variableIndex: 1, variableName: 'x2', mustBeInteger: true },
        { variableIndex: 2, variableName: 'x3', mustBeInteger: true },
        { variableIndex: 3, variableName: 'x4', mustBeInteger: true }
      ]
    };

    const steps = solveBranchAndBound(problem);
    const finalStep = steps[steps.length - 1];
    
    expect(finalStep.incumbentSolution).toBeDefined();
    const solution = finalStep.incumbentSolution!;
    
    // All variables should be integer (0 or 1 for knapsack)
    solution.values.forEach(val => {
      expect(Number.isInteger(val)).toBe(true);
      expect(val).toBeGreaterThanOrEqual(0);
    });
    
    // Check that the weight constraint is satisfied
    const totalWeight = solution.values.reduce((sum, val, idx) => 
      sum + val * problem.constraints[0].coefficients[idx], 0
    );
    expect(totalWeight).toBeLessThanOrEqual(10);
  });

  it('should track the branch and bound tree correctly', () => {
    const problem: IntegerProgram = {
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
    };

    const steps = solveBranchAndBound(problem);
    
    // Check that tree grows over time
    let prevTreeSize = 0;
    steps.forEach((step, idx) => {
      expect(step.tree.length).toBeGreaterThanOrEqual(prevTreeSize);
      prevTreeSize = step.tree.length;
      
      // Check that each node has a unique ID
      const nodeIds = step.tree.map(node => node.id);
      const uniqueIds = new Set(nodeIds);
      expect(uniqueIds.size).toBe(nodeIds.length);
    });
    
    // Check that we have nodes in the tree
    const finalTree = steps[steps.length - 1].tree;
    expect(finalTree.length).toBeGreaterThan(0);
    
    // Check that at least some nodes have been processed
    const processedNodes = finalTree.filter(node => node.status !== 'active');
    expect(processedNodes.length).toBeGreaterThan(0);
  });

  it('should handle bounds correctly for minimization problems', () => {
    const problem: IntegerProgram = {
      objective: [2, 3],
      isMaximization: false, // Minimization
      constraints: [
        { coefficients: [1, 2], rhs: 8, operator: '>=' },
        { coefficients: [2, 1], rhs: 10, operator: '>=' }
      ],
      variables: ['x', 'y'],
      variableRestrictions: [true, true],
      integerConstraints: [
        { variableIndex: 0, variableName: 'x', mustBeInteger: true },
        { variableIndex: 1, variableName: 'y', mustBeInteger: true }
      ]
    };

    const steps = solveBranchAndBound(problem);
    const finalStep = steps[steps.length - 1];
    
    expect(finalStep.incumbentSolution).toBeDefined();
    
    // For minimization, bounds should work in opposite direction
    const solution = finalStep.incumbentSolution!;
    expect(solution.values.every(v => Number.isInteger(v))).toBe(true);
  });

  describe('createIntegerProgrammingExamples', () => {
    it('should create valid example problems', () => {
      const examples = createIntegerProgrammingExamples();
      
      expect(examples).toBeDefined();
      expect(Object.keys(examples).length).toBeGreaterThan(0);
      
      // Check knapsack example
      expect(examples.knapsack).toBeDefined();
      expect(examples.knapsack.integerConstraints).toHaveLength(7);
      
      // Check simple integer example
      expect(examples.simpleInteger).toBeDefined();
      expect(examples.simpleInteger.integerConstraints).toHaveLength(2);
      
      // Check mixed integer example
      expect(examples.mixedInteger).toBeDefined();
      expect(examples.mixedInteger.integerConstraints).toHaveLength(1);
    });
  });

  it('should provide meaningful step explanations', () => {
    const problem: IntegerProgram = {
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
    };

    const steps = solveBranchAndBound(problem);
    
    // Check that each step has an explanation
    steps.forEach(step => {
      expect(step.explanation).toBeDefined();
      expect(step.explanation.length).toBeGreaterThan(0);
    });
    
    // Check for specific action types
    const actions = new Set(steps.map(step => step.action));
    expect(actions.has('select')).toBe(true);
    expect(actions.has('optimal')).toBe(true);
  });
});
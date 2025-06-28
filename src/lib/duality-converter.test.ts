import { describe, test, expect } from 'vitest';
import { convertToDual, formatLinearProgram } from './duality-converter';
import type { LinearProgram } from '@/components/types';

describe('Duality Converter', () => {
  test('converts simple maximization problem to minimization dual', () => {
    const primal: LinearProgram = {
      objective: [3, 2],
      constraints: [
        { coefficients: [2, 1], rhs: 10, operator: '<=' },
        { coefficients: [1, 2], rhs: 8, operator: '<=' }
      ],
      isMaximization: true,
      variables: ['x1', 'x2'],
      variableRestrictions: [true, true]
    };

    const result = convertToDual(primal);
    
    // Check dual is minimization
    expect(result.dual.isMaximization).toBe(false);
    
    // Check dual objective coefficients (from primal RHS)
    expect(result.dual.objective).toEqual([10, 8]);
    
    // Check dual constraints (transposed from primal)
    expect(result.dual.constraints).toHaveLength(2);
    expect(result.dual.constraints[0].coefficients).toEqual([2, 1]); // First column of primal
    expect(result.dual.constraints[0].rhs).toBe(3); // From primal objective
    expect(result.dual.constraints[0].operator).toBe('>=');
    
    expect(result.dual.constraints[1].coefficients).toEqual([1, 2]); // Second column of primal
    expect(result.dual.constraints[1].rhs).toBe(2);
    expect(result.dual.constraints[1].operator).toBe('>=');
    
    // Check dual variables
    expect(result.dual.variables).toEqual(['y1', 'y2']);
  });

  test('converts minimization problem to maximization dual', () => {
    const primal: LinearProgram = {
      objective: [4, 5],
      constraints: [
        { coefficients: [1, 2], rhs: 6, operator: '>=' },
        { coefficients: [3, 1], rhs: 7, operator: '>=' }
      ],
      isMaximization: false,
      variables: ['x1', 'x2'],
      variableRestrictions: [true, true]
    };

    const result = convertToDual(primal);
    
    // Check dual is maximization
    expect(result.dual.isMaximization).toBe(true);
    
    // Check dual objective
    expect(result.dual.objective).toEqual([6, 7]);
    
    // Check dual constraints
    expect(result.dual.constraints[0].coefficients).toEqual([1, 3]);
    expect(result.dual.constraints[0].operator).toBe('<=');
    expect(result.dual.constraints[1].coefficients).toEqual([2, 1]);
    expect(result.dual.constraints[1].operator).toBe('<=');
  });

  test('formats linear program correctly', () => {
    const lp: LinearProgram = {
      objective: [3, 2],
      constraints: [
        { coefficients: [2, 1], rhs: 10, operator: '<=' },
        { coefficients: [1, 2], rhs: 8, operator: '<=' }
      ],
      isMaximization: true,
      variables: ['x1', 'x2'],
      variableRestrictions: [true, true]
    };

    const formatted = formatLinearProgram(lp);
    
    expect(formatted).toContain('Maximizar: 3x1 + 2x2');
    expect(formatted).toContain('2x1 + x2 <= 10');
    expect(formatted).toContain('x1 + 2x2 <= 8');
    expect(formatted).toContain('x1, x2 ≥ 0');
  });

  test('handles mixed constraint types', () => {
    const primal: LinearProgram = {
      objective: [1, 2, 3],
      constraints: [
        { coefficients: [1, 0, 1], rhs: 5, operator: '<=' },
        { coefficients: [0, 1, 1], rhs: 3, operator: '>=' },
        { coefficients: [1, 1, 0], rhs: 4, operator: '=' }
      ],
      isMaximization: true,
      variables: ['x1', 'x2', 'x3'],
      variableRestrictions: [true, true, true]
    };

    const result = convertToDual(primal);
    
    // Check dual has 3 variables
    expect(result.dual.variables).toHaveLength(3);
    
    // Check dual variable restrictions based on primal constraint types
    // For max problem: <= gives y >= 0, >= gives y <= 0, = gives y unrestricted
    expect(result?.dual?.variableRestrictions?.[0]).toBe(true); // From <= constraint
    expect(result?.dual?.variableRestrictions?.[1]).toBe(false); // From >= constraint (would need special handling)
    expect(result?.dual?.variableRestrictions?.[2]).toBe(false); // From = constraint (unrestricted)
  });
});
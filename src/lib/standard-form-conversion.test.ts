import { convertToStandardFormWithExplanation } from './standard-form-conversion';
import { LinearProgram } from '@/components/types';
import { describe, expect, test } from 'vitest';

describe('Standard Form Conversion', () => {
  // Test case 1: Convert a maximization problem to minimization
  test('converts maximization to minimization', () => {
    const lp: LinearProgram = {
      objective: [3, 2],
      constraints: [
        { coefficients: [2, 1], rhs: 10, operator: '<=' },
        { coefficients: [1, 2], rhs: 8, operator: '<=' }
      ],
      isMaximization: true,
      variables: ['x₁', 'x₂'],
      variableRestrictions: [true, true]
    };
    
    const { standardLP } = convertToStandardFormWithExplanation(lp);
    
    expect(standardLP.isMaximization).toBe(false);
    expect(standardLP.objective.slice(0, 2)).toEqual([-3, -2]); // Only check the original variables
  });
  
  // Test case 2: Handle >= constraints correctly
  test('adds surplus variables with correct naming for >= constraints', () => {
    const lp: LinearProgram = {
      objective: [5, 4],
      constraints: [
        { coefficients: [1, 1], rhs: 5, operator: '<=' },
        { coefficients: [2, 1], rhs: 8, operator: '>=' }
      ],
      isMaximization: true,
      variables: ['x₁', 'x₂'],
      variableRestrictions: [true, true]
    };
    
    const { standardLP } = convertToStandardFormWithExplanation(lp);
    
    // Check that variables include the slack variables with correct naming
    expect(standardLP.variables).toContain('x₁');
    expect(standardLP.variables).toContain('x₂');
    expect(standardLP.variables).toContain('s1');
    expect(standardLP.variables).toContain('s2');
    
    // Check constraint coefficients
    // First constraint: x₁ + x₂ + s1 = 5
    expect(standardLP.constraints[0].coefficients[0]).toBe(1); // x₁
    expect(standardLP.constraints[0].coefficients[1]).toBe(1); // x₂
    
    // Second constraint: 2x₁ + x₂ - s2 = 8 (we don't multiply by -1 since 8 is already positive)
    expect(standardLP.constraints[1].coefficients[0]).toBe(2); // 2x₁
    expect(standardLP.constraints[1].coefficients[1]).toBe(1); // x₂
    
    // First constraint has slack s1, second constraint has slack s2
    // Update the test expectations based on the updated implementation
    // s1 should have coefficient 0 for the second constraint (at position 2)
    // s2 should have coefficient -1 for the second constraint (at position 3)
    expect(standardLP.constraints[1].coefficients[2]).toBe(0); // s1 coefficient in position 2
    expect(standardLP.constraints[1].coefficients[3]).toBe(-1); // s2 coefficient in position 3 (negative for surplus)
    expect(standardLP.constraints[1].rhs).toBe(8); // RHS should remain positive
  });
  
  // Test case 3: Handle unrestricted variables
  test('handles unrestricted variables correctly', () => {
    const lp: LinearProgram = {
      objective: [3, -2],
      constraints: [
        { coefficients: [1, 1], rhs: 6, operator: '<=' },
      ],
      isMaximization: true,
      variables: ['x₁', 'x₂'],
      variableRestrictions: [true, false] // x₁ ≥ 0, x₂ unrestricted
    };
    
    const { standardLP } = convertToStandardFormWithExplanation(lp);
    
    // Check variable substitution
    expect(standardLP.variables).toContain('x₁');
    expect(standardLP.variables).toContain('x₂⁺');
    expect(standardLP.variables).toContain('x₂⁻');
    
    // Check objective coefficients
    expect(standardLP.objective[0]).toBe(-3); // -3x₁
    expect(standardLP.objective[1]).toBe(2);  // +2x₂⁺
    expect(standardLP.objective[2]).toBe(-2); // -2x₂⁻
    
    // Check constraint coefficients
    // x₁ + x₂⁺ - x₂⁻ + s₁ = 6
    expect(standardLP.constraints[0].coefficients).toEqual([1, 1, -1, 1]);
  });
  
  // Test case 4: Example 1 from the exercise
  test('correctly converts Example 1 problem', () => {
    const lp: LinearProgram = {
      objective: [5, 2],
      constraints: [
        { coefficients: [10, 12], rhs: -60, operator: '>=' },
        { coefficients: [2, 1], rhs: 6, operator: '=' }
      ],
      isMaximization: true,
      variables: ['x₁', 'x₂'],
      variableRestrictions: [true, true]
    };
    
    const { standardLP } = convertToStandardFormWithExplanation(lp);
    
    // Check objective function conversion
    expect(standardLP.isMaximization).toBe(false);
    expect(standardLP.objective[0]).toBe(-5); // -5x₁
    expect(standardLP.objective[1]).toBe(-2); // -2x₂
    
    // Check constraint conversion
    // First constraint: -10x₁ - 12x₂ + s₁ = 60
    expect(standardLP.constraints[0].coefficients).toEqual([-10, -12, 1]);
    expect(standardLP.constraints[0].rhs).toBe(60);
    
    // Second constraint: 2x₁ + x₂ = 6
    expect(standardLP.constraints[1].coefficients.slice(0, 2)).toEqual([2, 1]);
    expect(standardLP.constraints[1].rhs).toBe(6);
    expect(standardLP.constraints[1].operator).toBe('=');
  });
  
  // Test case 5: Example 2 from the exercise
  test('correctly converts Example 2 problem with unrestricted variables', () => {
    const lp: LinearProgram = {
      objective: [10, 7, 0],
      constraints: [
        { coefficients: [2, 1, 1], rhs: 5000, operator: '<=' },
        { coefficients: [4, 5, 0], rhs: 15000, operator: '>=' }
      ],
      isMaximization: true,
      variables: ['x₁', 'x₂', 'x₃'],
      variableRestrictions: [true, false, true] // x₁ ≥ 0, x₂ unrestricted, x₃ ≥ 0
    };
    
    const { standardLP } = convertToStandardFormWithExplanation(lp);
    
    // Check that variables have the correct names
    expect(standardLP.variables).toContain('x₁');
    expect(standardLP.variables).toContain('x₂⁺');
    expect(standardLP.variables).toContain('x₃');
    expect(standardLP.variables).toContain('x₂⁻');
    expect(standardLP.variables).toContain('s1');
    expect(standardLP.variables).toContain('s2');
    
    // Check objective function
    // Use toBe for individual elements to avoid -0/+0 comparison issues
    expect(standardLP.objective[0]).toBe(-10); // -10x₁
    expect(standardLP.objective[1]).toBe(-7);  // -7x₂⁺
    expect(Math.abs(standardLP.objective[2])).toBe(0); // 0x₃
    expect(standardLP.objective[3]).toBe(7);   // 7x₂⁻
    
    // First constraint: 2x₁ + 1x₂⁺ - 1x₂⁻ + x₃ + s₁ = 5000
    expect(standardLP.constraints[0].coefficients[0]).toBe(2);  // 2x₁
    expect(standardLP.constraints[0].coefficients[1]).toBe(1);  // 1x₂⁺
    expect(standardLP.constraints[0].coefficients[2]).toBe(1);  // 1x₃
    expect(standardLP.constraints[0].coefficients[3]).toBe(-1); // -1x₂⁻
    expect(standardLP.constraints[0].coefficients[4]).toBe(1);  // +s₁
    
    // Second constraint: 4x₁ + 5x₂⁺ - 5x₂⁻ + 0x₃ - s₂ = 15000
    // With our updated logic, we don't multiply by -1 since RHS is already positive
    expect(standardLP.constraints[1].coefficients[0]).toBe(4);  // 4x₁
    expect(standardLP.constraints[1].coefficients[1]).toBe(5);  // 5x₂⁺
    expect(Math.abs(standardLP.constraints[1].coefficients[2])).toBe(0);   // 0x₃
    expect(standardLP.constraints[1].coefficients[3]).toBe(-5);   // -5x₂⁻
    
    // Check slack/surplus variable coefficients based on the updated implementation
    expect(standardLP.constraints[1].coefficients[4]).toBe(0); // s1 coefficient in position 4
    expect(standardLP.constraints[1].coefficients[5]).toBe(-1); // s2 coefficient in position 5 (surplus is negative)
    
    expect(standardLP.constraints[1].rhs).toBe(15000); // RHS remains positive
  });
  
  // Additional test cases provided by user
  describe('Additional Standard Form Conversion Tests', () => {
    // Test case 1: Simple maximization problem
    test('converts simple maximization problem to standard form', () => {
      const lp: LinearProgram = {
        objective: [10, 7],
        constraints: [
          { coefficients: [2, 1], rhs: 5, operator: '<=' },
          { coefficients: [4, 5], rhs: 15, operator: '<=' }
        ],
        isMaximization: true,
        variables: ['x₁', 'x₂'],
        variableRestrictions: [true, true]
      };
      
      const { standardLP } = convertToStandardFormWithExplanation(lp);
      
      // Verify objective function
      expect(standardLP.isMaximization).toBe(false);
      expect(standardLP.objective[0]).toBe(-10);
      expect(standardLP.objective[1]).toBe(-7);
      
      // Verify constraints
      expect(standardLP.variables).toContain('x₁');
      expect(standardLP.variables).toContain('x₂');
      expect(standardLP.variables).toContain('s1');
      expect(standardLP.variables).toContain('s2');
      
      // Check first constraint: 2x₁ + x₂ + s1 = 5
      expect(standardLP.constraints[0].coefficients[0]).toBe(2);
      expect(standardLP.constraints[0].coefficients[1]).toBe(1);
      expect(standardLP.constraints[0].rhs).toBe(5);
      
      // Check second constraint: 4x₁ + 5x₂ + s2 = 15
      expect(standardLP.constraints[1].coefficients[0]).toBe(4);
      expect(standardLP.constraints[1].coefficients[1]).toBe(5);
      expect(standardLP.constraints[1].rhs).toBe(15);
    });
    
    // Test case 2: Max problem with inequalities
    test('converts max problem with inequality constraints', () => {
      const lp: LinearProgram = {
        objective: [5, 2],
        constraints: [
          { coefficients: [10, 12], rhs: 60, operator: '<=' },
          { coefficients: [2, 1], rhs: 6, operator: '<=' }
        ],
        isMaximization: true,
        variables: ['x₁', 'x₂'],
        variableRestrictions: [true, true]
      };
      
      const { standardLP } = convertToStandardFormWithExplanation(lp);
      
      // Verify objective function
      expect(standardLP.isMaximization).toBe(false);
      expect(standardLP.objective[0]).toBe(-5);
      expect(standardLP.objective[1]).toBe(-2);
      
      // Verify constraints
      expect(standardLP.variables).toContain('x₁');
      expect(standardLP.variables).toContain('x₂');
      expect(standardLP.variables).toContain('s1');
      expect(standardLP.variables).toContain('s2');
      
      // Check first constraint: 10x₁ + 12x₂ + s1 = 60
      expect(standardLP.constraints[0].coefficients[0]).toBe(10);
      expect(standardLP.constraints[0].coefficients[1]).toBe(12);
      expect(standardLP.constraints[0].rhs).toBe(60);
      
      // Check second constraint: 2x₁ + x₂ + s2 = 6
      expect(standardLP.constraints[1].coefficients[0]).toBe(2);
      expect(standardLP.constraints[1].coefficients[1]).toBe(1);
      expect(standardLP.constraints[1].rhs).toBe(6);
    });
    
    // Test case 3: Problem with three constraints
    test('converts problem with three constraints', () => {
      const lp: LinearProgram = {
        objective: [2, 3],
        constraints: [
          { coefficients: [1, 3], rhs: 9, operator: '<=' },
          { coefficients: [-1, 2], rhs: 4, operator: '<=' },
          { coefficients: [1, 1], rhs: 6, operator: '<=' }
        ],
        isMaximization: true,
        variables: ['x₁', 'x₂'],
        variableRestrictions: [true, true]
      };
      
      const { standardLP } = convertToStandardFormWithExplanation(lp);
      
      // Verify objective function
      expect(standardLP.isMaximization).toBe(false);
      expect(standardLP.objective[0]).toBe(-2);
      expect(standardLP.objective[1]).toBe(-3);
      
      // Verify variables with slack variables
      expect(standardLP.variables).toContain('x₁');
      expect(standardLP.variables).toContain('x₂');
      expect(standardLP.variables).toContain('s1');
      expect(standardLP.variables).toContain('s2');
      expect(standardLP.variables).toContain('s3');
      
      // Check constraints and their slack variables
      expect(standardLP.constraints[0].coefficients[0]).toBe(1);
      expect(standardLP.constraints[0].coefficients[1]).toBe(3);
      expect(standardLP.constraints[0].rhs).toBe(9);
      
      expect(standardLP.constraints[1].coefficients[0]).toBe(-1);
      expect(standardLP.constraints[1].coefficients[1]).toBe(2);
      expect(standardLP.constraints[1].rhs).toBe(4);
      
      expect(standardLP.constraints[2].coefficients[0]).toBe(1);
      expect(standardLP.constraints[2].coefficients[1]).toBe(1);
      expect(standardLP.constraints[2].rhs).toBe(6);
    });
    
    // Test case 4: Problem with three variables
    test('converts problem with three variables', () => {
      const lp: LinearProgram = {
        objective: [2, 3, 4],
        constraints: [
          { coefficients: [1, 1, 1], rhs: 100, operator: '<=' },
          { coefficients: [2, 1, 0], rhs: 210, operator: '<=' },
          { coefficients: [1, 0, 0], rhs: 80, operator: '<=' }
        ],
        isMaximization: true,
        variables: ['x₁', 'x₂', 'x₃'],
        variableRestrictions: [true, true, true]
      };
      
      const { standardLP } = convertToStandardFormWithExplanation(lp);
      
      // Verify objective function
      expect(standardLP.isMaximization).toBe(false);
      expect(standardLP.objective[0]).toBe(-2);
      expect(standardLP.objective[1]).toBe(-3);
      expect(standardLP.objective[2]).toBe(-4);
      
      // Verify variables with slack variables
      expect(standardLP.variables).toContain('x₁');
      expect(standardLP.variables).toContain('x₂');
      expect(standardLP.variables).toContain('x₃');
      expect(standardLP.variables).toContain('s1');
      expect(standardLP.variables).toContain('s2');
      expect(standardLP.variables).toContain('s3');
      
      // Check constraints and their slack variables
      expect(standardLP.constraints[0].coefficients[0]).toBe(1);
      expect(standardLP.constraints[0].coefficients[1]).toBe(1);
      expect(standardLP.constraints[0].coefficients[2]).toBe(1);
      expect(standardLP.constraints[0].rhs).toBe(100);
      
      expect(standardLP.constraints[1].coefficients[0]).toBe(2);
      expect(standardLP.constraints[1].coefficients[1]).toBe(1);
      expect(standardLP.constraints[1].coefficients[2]).toBe(0);
      expect(standardLP.constraints[1].rhs).toBe(210);
      
      expect(standardLP.constraints[2].coefficients[0]).toBe(1);
      expect(standardLP.constraints[2].coefficients[1]).toBe(0);
      expect(standardLP.constraints[2].coefficients[2]).toBe(0);
      expect(standardLP.constraints[2].rhs).toBe(80);
    });
  });
  
  test('handles negative RHS in equality constraints', () => {
    const lp: LinearProgram = {
      objective: [1, -1],
      constraints: [
        { coefficients: [1, -1], rhs: -1, operator: '=' }  // x1 - x2 = -1
      ],
      isMaximization: true,
      variables: ['x1', 'x2'],
      variableRestrictions: [true, true]
    };
    
    const { standardLP, explanation } = convertToStandardFormWithExplanation(lp);
    
    // Check that the constraint was multiplied by -1
    expect(standardLP.constraints[0].coefficients).toEqual([-1, 1]);
    expect(standardLP.constraints[0].rhs).toBe(1);
    expect(standardLP.constraints[0].operator).toBe('=');
    
    // Check that the explanation mentions the multiplication
    expect(explanation).toContain('multiply the entire constraint by -1');
  });
  
  test('handles objective function RHS', () => {
    const lp: LinearProgram = {
      objective: [3, 2],
      objectiveRHS: 5, // z = 3x1 + 2x2 + 5
      constraints: [
        { coefficients: [2, 1], rhs: 10, operator: '<=' },
        { coefficients: [1, 2], rhs: 8, operator: '<=' }
      ],
      isMaximization: true,
      variables: ['x1', 'x2'],
      variableRestrictions: [true, true]
    };
    
    const { standardLP } = convertToStandardFormWithExplanation(lp);
    
    // Check that objective RHS is converted properly
    expect(standardLP.objectiveRHS).toBe(-5); // Negated because it's maximization
    
    // Check that objective coefficients are negated
    expect(standardLP.objective[0]).toBe(-3);
    expect(standardLP.objective[1]).toBe(-2);
  });
});

// This declaration is conflicting with Jest's expect function
// Remove to use the globally imported Jest expect

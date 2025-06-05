import React from 'react';

/**
 * Component that explains what a basis is in linear programming context
 */
const BasisExplanation: React.FC = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-purple-700">Understanding the Basis in Linear Programming</h3>
      
      <div className="bg-purple-50 p-4 rounded-md border border-purple-200">
        <h4 className="font-semibold mb-2 text-gray-800">What is a Basis?</h4>
        <p className="text-gray-700 mb-3">
          In linear programming, a <span className="font-semibold">basis</span> is a set of variables that:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Contains exactly one variable from each constraint equation</li>
          <li>Forms a square matrix of coefficients that is invertible (non-singular)</li>
          <li>Allows us to express all basic variables in terms of non-basic variables</li>
        </ul>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
        <h4 className="font-semibold mb-2 text-gray-800">Basic and Non-Basic Variables</h4>
        <div className="space-y-3">
          <div>
            <p className="font-medium text-gray-800">Basic Variables:</p>
            <ul className="list-disc list-inside ml-4 text-gray-700">
              <li>Variables currently in the basis</li>
              <li>Correspond to columns with exactly one '1' and all other entries '0'</li>
              <li>These variables can take positive values in the current solution</li>
              <li>Their values are computed from the right-hand side of the constraints</li>
            </ul>
          </div>
          
          <div>
            <p className="font-medium text-gray-800">Non-Basic Variables:</p>
            <ul className="list-disc list-inside ml-4 text-gray-700">
              <li>Variables not in the basis</li>
              <li>Fixed at value zero in the current basic solution</li>
              <li>Potential candidates to enter the basis in the next iteration</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <h4 className="font-semibold mb-2 text-gray-800">At Each Simplex Iteration</h4>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-medium">1. Entering variable:</span> A non-basic variable enters the basis</p>
            <p><span className="font-medium">2. Leaving variable:</span> A basic variable leaves the basis</p>
            <p><span className="font-medium">3. Pivot operation:</span> Updates the tableau to reflect the new basis</p>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
          <h4 className="font-semibold mb-2 text-gray-800">Why the Basis Matters</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Each basis corresponds to a corner point (vertex) of the feasible region</li>
            <li>The optimal solution always occurs at a corner point</li>
            <li>The simplex method moves from one basis to another, improving the objective value</li>
            <li>Each iteration gives us a new basis and a new basic feasible solution</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
        <h4 className="font-semibold mb-2 text-gray-800">Example Visualization</h4>
        <div className="space-y-2">
          <p className="text-gray-700">
            In a tableau with 3 constraints and 5 variables (including slacks), a basis might be:
          </p>
          <div className="font-mono bg-white p-3 rounded border border-gray-300 overflow-x-auto">
            <p>Basic variables: [x₂, s₁, s₃]</p>
            <p>Non-basic variables: [x₁, s₂]</p>
          </div>
          <p className="text-gray-700 mt-2">
            This represents one particular corner point of the feasible region. The simplex method will
            try to find a better basis by replacing one basic variable with a non-basic one.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasisExplanation;
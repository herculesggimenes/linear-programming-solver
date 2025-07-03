import React from 'react';
import SimplexVisualizer from '../SimplexVisualizer';
import type { BranchAndBoundNode } from '@/lib/integer-programming';

interface NodeSimplexVisualizerProps {
  node: BranchAndBoundNode;
  isActive?: boolean;
  showDetails?: boolean;
}

const NodeSimplexVisualizer: React.FC<NodeSimplexVisualizerProps> = ({ 
  node, 
  isActive = false,
  showDetails = false 
}) => {
  return (
    <div className="space-y-4">
      {/* Node Information Header */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Informações do Nó {node.id}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Status:</span> {' '}
            <span className={`font-semibold ${
              node.status === 'integer' ? 'text-green-600' :
              node.status === 'fathomed' ? 'text-red-600' :
              node.status === 'branched' ? 'text-amber-600' :
              'text-blue-600'
            }`}>
              {node.status === 'integer' ? 'Solução Inteira' :
               node.status === 'fathomed' ? 'Podado' :
               node.status === 'branched' ? 'Ramificado' :
               'Ativo'}
            </span>
          </div>
          <div>
            <span className="font-medium">Profundidade:</span> {node.depth}
          </div>
          {node.parentId && (
            <div>
              <span className="font-medium">Nó Pai:</span> {node.parentId}
            </div>
          )}
          {node.bound !== undefined && (
            <div>
              <span className="font-medium">Bound:</span> {node.bound.toFixed(2)}
            </div>
          )}
        </div>
        
        {/* Branching constraints */}
        {node.parentId && node.branchVariable !== undefined && node.branchDirection && (
          <div className="mt-3 p-3 bg-blue-50 rounded">
            <span className="font-medium text-sm">Restrição de Ramificação:</span>
            <div className="text-sm mt-1">
              x{node.branchVariable + 1} {node.branchDirection === 'up' ? '≥' : '≤'} {
                node.branchDirection === 'up' 
                  ? Math.ceil(node.solution?.values[node.branchVariable] || 0)
                  : Math.floor(node.solution?.values[node.branchVariable] || 0)
              }
            </div>
          </div>
        )}
        
        {/* Pruning reason */}
        {node.status === 'fathomed' && node.reason && (
          <div className="mt-3 p-3 bg-red-50 rounded">
            <span className="font-medium text-sm text-red-700">Razão da Poda:</span>
            <div className="text-sm mt-1 text-red-600">{node.reason}</div>
          </div>
        )}
      </div>
      
      {/* Simplex Visualization */}
      <div className="border rounded-lg p-4">
        <SimplexVisualizer 
          lp={node.problem} 
          showGeometric={node.problem.variables.length <= 2}
          width={800}
          height={400}
        />
      </div>
    </div>
  );
};

export default NodeSimplexVisualizer;
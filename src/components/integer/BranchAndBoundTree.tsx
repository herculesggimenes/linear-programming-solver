import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tree } from '@visx/hierarchy';
import { Group } from '@visx/group';
import { LinkVertical } from '@visx/shape';
import type { BranchAndBoundNode } from '@/lib/integer-programming';

interface BranchAndBoundTreeProps {
  nodes: BranchAndBoundNode[];
  currentNodeId?: string;
  width?: number;
  height?: number;
}

interface TreeNodeData {
  id: string;
  node: BranchAndBoundNode;
  children?: TreeNodeData[];
}

const BranchAndBoundTree: React.FC<BranchAndBoundTreeProps> = ({
  nodes,
  currentNodeId,
  width = 800,
  height = 600
}) => {
  // Build tree structure from flat array
  const treeData = useMemo(() => {
    const nodeMap = new Map<string, TreeNodeData>();
    
    // Create tree nodes
    nodes.forEach(node => {
      nodeMap.set(node.id, {
        id: node.id,
        node,
        children: []
      });
    });
    
    // Build parent-child relationships
    nodes.forEach(node => {
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        const child = nodeMap.get(node.id);
        if (parent && child) {
          parent.children!.push(child);
        }
      }
    });
    
    // Find root
    const root = nodes.find(n => !n.parentId);
    return root ? nodeMap.get(root.id) : null;
  }, [nodes]);
  
  if (!treeData) return null;
  
  const margin = { top: 40, left: 40, right: 40, bottom: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  // Color map for node status
  const colorScale: Record<string, string> = {
    active: '#3b82f6',      // blue
    fathomed: '#ef4444',    // red
    branched: '#f59e0b',    // amber
    integer: '#10b981'      // green
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Árvore Branch and Bound</CardTitle>
      </CardHeader>
      <CardContent>
        <svg width={width} height={height}>
          <Group left={margin.left} top={margin.top}>
            <Tree<TreeNodeData>
              root={treeData}
              size={[innerWidth, innerHeight]}
              separation={(a, b) => (a.parent === b.parent ? 1 : 2) / a.depth}
            >
              {tree => (
                <Group>
                  {/* Links */}
                  {tree.links().map((link, i) => (
                    <LinkVertical
                      key={`link-${i}`}
                      data={link}
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeOpacity={0.6}
                    />
                  ))}
                  
                  {/* Nodes */}
                  {tree.descendants().map((node, i) => {
                    const isCurrentNode = node.data.id === currentNodeId;
                    const nodeData = node.data.node;
                    const nodeColor = colorScale[nodeData.status] || '#94a3b8';
                    
                    return (
                      <Group key={`node-${i}`} top={node.y} left={node.x}>
                        {/* Node circle */}
                        <circle
                          r={25}
                          fill={nodeColor}
                          fillOpacity={isCurrentNode ? 1 : 0.8}
                          stroke={isCurrentNode ? '#1e40af' : nodeColor}
                          strokeWidth={isCurrentNode ? 4 : 2}
                          className="transition-all duration-300"
                        />
                        
                        {/* Node ID */}
                        <text
                          dy=".33em"
                          fontSize={12}
                          fontWeight="bold"
                          textAnchor="middle"
                          fill="white"
                        >
                          {nodeData.id.replace('node_', '')}
                        </text>
                        
                        {/* Bound value */}
                        {nodeData.solution && (
                          <text
                            y={35}
                            fontSize={11}
                            textAnchor="middle"
                            fill="#1e293b"
                          >
                            {nodeData.bound.toFixed(1)}
                          </text>
                        )}
                        
                        {/* Branch constraint */}
                        {nodeData.branchDirection && (
                          <text
                            y={-35}
                            fontSize={10}
                            textAnchor="middle"
                            fill="#64748b"
                          >
                            x{nodeData.branchVariable! + 1} {nodeData.branchDirection === 'up' ? '≥' : '≤'} {
                              nodeData.branchDirection === 'up' 
                                ? Math.ceil(nodeData.solution!.values[nodeData.branchVariable!])
                                : Math.floor(nodeData.solution!.values[nodeData.branchVariable!])
                            }
                          </text>
                        )}
                        
                        {/* Status indicator */}
                        {nodeData.status === 'integer' && (
                          <text
                            y={50}
                            fontSize={10}
                            textAnchor="middle"
                            fill="#059669"
                            fontWeight="bold"
                          >
                            INTEIRO
                          </text>
                        )}
                        {nodeData.status === 'fathomed' && nodeData.reason && (
                          <text
                            y={50}
                            fontSize={9}
                            textAnchor="middle"
                            fill="#dc2626"
                          >
                            {nodeData.reason}
                          </text>
                        )}
                      </Group>
                    );
                  })}
                </Group>
              )}
            </Tree>
          </Group>
        </svg>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm">Ativo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span className="text-sm">Ramificado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm">Inteiro</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm">Podado</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BranchAndBoundTree;
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Group } from '@visx/group';
import { Tree } from '@visx/hierarchy';
import { hierarchy } from '@visx/hierarchy';
import { LinkVertical } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { Zoom } from '@visx/zoom';
import { localPoint } from '@visx/event';
import NodeSimplexVisualizer from './NodeSimplexVisualizer';
import type { BranchAndBoundNode } from '@/lib/integer-programming';

interface SimpleBranchAndBoundTreeProps {
  nodes: BranchAndBoundNode[];
  currentNodeId?: string;
}

interface TreeNode {
  name: string;
  node: BranchAndBoundNode;
  children?: TreeNode[];
}

const SimpleBranchAndBoundTree: React.FC<SimpleBranchAndBoundTreeProps> = ({
  nodes,
  currentNodeId
}) => {
  const [selectedNode, setSelectedNode] = useState<BranchAndBoundNode | null>(null);

  // Build tree structure for visx
  const buildTree = (): TreeNode | null => {
    const nodeMap = new Map<string, TreeNode>();
    
    // Create tree nodes
    nodes.forEach(node => {
      nodeMap.set(node.id, {
        name: node.id,
        node
      });
    });
    
    // Build parent-child relationships
    nodes.forEach(node => {
      if (node.parentId) {
        const parent = nodeMap.get(node.parentId);
        const child = nodeMap.get(node.id);
        if (parent && child) {
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(child);
        }
      }
    });
    
    // Find root
    const root = nodes.find(n => !n.parentId);
    return root ? nodeMap.get(root.id) || null : null;
  };

  const treeData = buildTree();
  if (!treeData) return <div>No tree data</div>;
  
  // Create hierarchy object for visx
  const root = hierarchy(treeData);

  // Use ref to get parent container width
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 900, height: 600 });
  
  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setDimensions({ 
          width: Math.max(containerWidth - 40, 300), // Subtract padding, min 300px
          height: 600 
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Use ResizeObserver for more accurate container size detection
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, []);
  
  const { width, height } = dimensions;
  const margin = { top: 80, left: 50, right: 50, bottom: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'active': return '#60a5fa'; // light blue
      case 'fathomed': return '#f87171'; // light red
      case 'branched': return '#fbbf24'; // light amber
      case 'integer': return '#34d399'; // light green
      default: return '#9ca3af'; // light gray
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'fathomed': return 'Podado';
      case 'branched': return 'Ramificado';
      case 'integer': return 'Inteiro';
      default: return status;
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="text-lg flex items-center justify-between flex-wrap gap-2">
          <span className="text-gray-800">Árvore Branch and Bound</span>
          <span className="text-xs font-normal text-gray-600">
            💡 Clique em um nó para ver a execução do Simplex | Use o scroll para zoom
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={containerRef} className="bg-white w-full">
          <Zoom<SVGSVGElement>
            width={width}
            height={height}
            scaleXMin={0.2}
            scaleXMax={2}
            scaleYMin={0.2}
            scaleYMax={2}
          >
            {zoom => (
              <svg
                width={width}
                height={height}
                style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab' }}
              >
                <rect width={width} height={height} fill="#f9fafb" />
                
                <rect
                  width={width}
                  height={height}
                  fill="transparent"
                  onTouchStart={zoom.dragStart}
                  onTouchMove={zoom.dragMove}
                  onTouchEnd={zoom.dragEnd}
                  onMouseDown={zoom.dragStart}
                  onMouseMove={zoom.dragMove}
                  onMouseUp={zoom.dragEnd}
                  onMouseLeave={() => {
                    if (zoom.isDragging) zoom.dragEnd();
                  }}
                  onDoubleClick={(event) => {
                    const point = localPoint(event) || { x: 0, y: 0 };
                    zoom.scale({ scaleX: 1.2, scaleY: 1.2, point });
                  }}
                />
                
                <Group transform={zoom.toString()}>
                  <Tree<TreeNode>
                    root={root}
                    size={[innerWidth, innerHeight]}
                    separation={(a, b) => (a.parent === b.parent ? 1.5 : 2) / a.depth}
                  >
                    {tree => (
                      <Group top={margin.top} left={margin.left}>
                        {/* Links */}
                        {tree.links().map((link, i) => (
                          <LinkVertical
                            key={`link-${i}`}
                            data={link}
                            stroke={
                              link.target.data.node.status === 'fathomed' 
                                ? '#94a3b8' 
                                : '#cbd5e1'
                            }
                            strokeWidth={2}
                            fill="none"
                            strokeDasharray={
                              link.target.data.node.status === 'fathomed' ? '5,5' : undefined
                            }
                          />
                        ))}
                        
                        {/* Nodes */}
                        {tree.descendants().map((node, i) => {
                          const isCurrentNode = node.data.node.id === currentNodeId;
                          const nodeData = node.data.node;
                          const nodeColor = getNodeColor(nodeData.status);
                          
                          return (
                            <Group key={`node-${i}`} top={node.y} left={node.x}>
                              {/* Node circle with click handler */}
                              <g
                                className="cursor-pointer"
                                onClick={() => setSelectedNode(nodeData)}
                              >
                                {/* White background circle */}
                                <circle
                                  r={40}
                                  fill="white"
                                  stroke={nodeColor}
                                  strokeWidth={isCurrentNode ? 3 : 2}
                                  strokeOpacity={0.8}
                                />
                                
                                {/* Colored inner circle */}
                                <circle
                                  r={37}
                                  fill={nodeColor}
                                  fillOpacity={0.3}
                                />
                                
                                {/* Node ID */}
                                <text
                                  dy="-10"
                                  fontSize={16}
                                  fontWeight="600"
                                  textAnchor="middle"
                                  fill="#1f2937"
                                  style={{ pointerEvents: 'none' }}
                                >
                                  {nodeData.id.replace('Nó ', '')}
                                </text>
                                
                                {/* Bound value */}
                                {nodeData.solution && (
                                  <text
                                    dy="10"
                                    fontSize={14}
                                    textAnchor="middle"
                                    fill="#4b5563"
                                    fontWeight="500"
                                    style={{ pointerEvents: 'none' }}
                                  >
                                    {nodeData.bound.toFixed(1)}
                                  </text>
                                )}
                                
                                {/* Subtle indicator for current node */}
                                {isCurrentNode && (
                                  <circle
                                    r={40}
                                    fill="none"
                                    stroke={nodeColor}
                                    strokeWidth={2}
                                    strokeOpacity={0.5}
                                    strokeDasharray="5,5"
                                  >
                                    <animateTransform
                                      attributeName="transform"
                                      type="rotate"
                                      from="0 0 0"
                                      to="360 0 0"
                                      dur="20s"
                                      repeatCount="indefinite"
                                    />
                                  </circle>
                                )}
                              </g>
                              
                              {/* Status badge */}
                              <g transform="translate(0, 58)">
                                <rect
                                  x={-35}
                                  y={-10}
                                  width={70}
                                  height={20}
                                  rx={10}
                                  fill={nodeColor}
                                  fillOpacity={0.1}
                                  stroke={nodeColor}
                                  strokeWidth={1}
                                  strokeOpacity={0.5}
                                />
                                <text
                                  y={4}
                                  fontSize={11}
                                  textAnchor="middle"
                                  fill={nodeColor}
                                  fontWeight="500"
                                  fillOpacity={0.9}
                                >
                                  {getStatusText(nodeData.status)}
                                </text>
                              </g>
                              
                              {/* Branch constraint */}
                              {nodeData.branchVariable !== undefined && nodeData.branchDirection && (
                                <text
                                  y={82}
                                  fontSize={11}
                                  textAnchor="middle"
                                  fill="#64748b"
                                  fontWeight="500"
                                >
                                  x{nodeData.branchVariable + 1} {nodeData.branchDirection === 'up' ? '≥' : '≤'} {
                                    nodeData.branchDirection === 'up' 
                                      ? Math.ceil(nodeData.solution?.values[nodeData.branchVariable] || 0)
                                      : Math.floor(nodeData.solution?.values[nodeData.branchVariable] || 0)
                                  }
                                </text>
                              )}
                              
                              {/* Reason for pruning */}
                              {nodeData.reason && (
                                <text
                                  y={97}
                                  fontSize={10}
                                  textAnchor="middle"
                                  fill="#dc2626"
                                  fontWeight="500"
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
                
                {/* Zoom controls */}
                <Group top={10} left={width - 50}>
                  <g className="opacity-90 hover:opacity-100 transition-opacity">
                    <rect
                      width={35}
                      height={35}
                      rx={8}
                      fill="white"
                      stroke="#e5e7eb"
                      strokeWidth={1}
                      className="cursor-pointer shadow-md"
                      onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
                    />
                    <text
                      x={17.5}
                      y={22}
                      textAnchor="middle"
                      fontSize={20}
                      fill="#374151"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      +
                    </text>
                  </g>
                </Group>
                <Group top={50} left={width - 50}>
                  <g className="opacity-90 hover:opacity-100 transition-opacity">
                    <rect
                      width={35}
                      height={35}
                      rx={8}
                      fill="white"
                      stroke="#e5e7eb"
                      strokeWidth={1}
                      className="cursor-pointer shadow-md"
                      onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
                    />
                    <text
                      x={17.5}
                      y={22}
                      textAnchor="middle"
                      fontSize={20}
                      fill="#374151"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      −
                    </text>
                  </g>
                </Group>
                <Group top={90} left={width - 50}>
                  <g className="opacity-90 hover:opacity-100 transition-opacity">
                    <rect
                      width={35}
                      height={35}
                      rx={8}
                      fill="white"
                      stroke="#e5e7eb"
                      strokeWidth={1}
                      className="cursor-pointer shadow-md"
                      onClick={zoom.reset}
                    />
                    <text
                      x={17.5}
                      y={22}
                      textAnchor="middle"
                      fontSize={14}
                      fill="#374151"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      ⟲
                    </text>
                  </g>
                </Group>
              </svg>
            )}
          </Zoom>
        </div>
        
        {/* Legend */}
        <div className="bg-gray-50 border-t px-6 py-4">
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-blue-400 opacity-80"></div>
              <span className="text-sm font-medium text-gray-600">Ativo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-amber-400 opacity-80"></div>
              <span className="text-sm font-medium text-gray-600">Ramificado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-400 opacity-80"></div>
              <span className="text-sm font-medium text-gray-600">Inteiro</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-red-400 opacity-80"></div>
              <span className="text-sm font-medium text-gray-600">Podado</span>
            </div>
          </div>
        </div>
        
        {/* Dialog to show Simplex execution */}
        <Dialog open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Execução Simplex - Nó {selectedNode?.id}</DialogTitle>
            </DialogHeader>
            {selectedNode && (
              <NodeSimplexVisualizer 
                node={selectedNode} 
                showDetails={true}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SimpleBranchAndBoundTree;
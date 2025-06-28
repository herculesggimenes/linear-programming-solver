import React, { useMemo, useState, useEffect } from 'react';
import type { LinearProgram, SimplexStep } from '@/components/types';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { LinePath, Polygon } from '@visx/shape';
import { Marker } from '@visx/marker';
import { Axis } from '@visx/axis';
import { Grid } from '@visx/grid';
import { Text } from '@visx/text';
import { Zoom } from '@visx/zoom';
import { localPoint } from '@visx/event';

interface GeometricVisualizerVisxProps {
  lp: LinearProgram;
  currentStep: SimplexStep;
  width?: number;
  height?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const defaultMargin = { top: 40, right: 40, bottom: 60, left: 60 };

const GeometricVisualizerVisx: React.FC<GeometricVisualizerVisxProps> = ({
  lp,
  currentStep,
  width: propWidth = 500,
  height: propHeight = 400,
  margin = defaultMargin,
}) => {
  const [containerWidth, setContainerWidth] = useState(propWidth);
  const [containerHeight, setContainerHeight] = useState(propHeight);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Responsive resizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth;
        // Maintain aspect ratio but limit height
        const newHeight = Math.min(
          newWidth * 0.8, // maintain roughly 4:5 aspect ratio
          window.innerHeight * 0.6 // limit to 60% of viewport height
        );
        
        setContainerWidth(newWidth);
        setContainerHeight(newHeight);
      }
    };
    
    // Initial size set
    updateDimensions();
    
    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="geometric-visualizer w-full relative"
    >
      <GeometricVisualizerBase
        lp={lp}
        currentStep={currentStep}
        width={containerWidth}
        height={containerHeight}
        margin={margin}
      />
    </div>
  );
};

// The actual visualization component
const GeometricVisualizerBase: React.FC<Required<GeometricVisualizerVisxProps>> = ({
  lp,
  currentStep,
  width,
  height,
  margin,
}) => {
  // Calculate bounds for the plot based on constraints
  const { minX, maxX, minY, maxY, vertices } = useMemo(() => {
    // Start with default bounds
    let minX = 0;
    let maxX = 10;
    let minY = 0;
    let maxY = 10;

    // Collect constraints including non-negativity
    const constraints = [
      ...lp.constraints,
      { coefficients: [1, 0], rhs: 0, operator: '>=' as const }, // x₁ ≥ 0
      { coefficients: [0, 1], rhs: 0, operator: '>=' as const }, // x₂ ≥ 0
    ];
    
    // Find vertices of the feasible region
    const intersectionPoints: Array<[number, number]> = [];
    
    // Add the origin if it's feasible
    if (constraints.every(({ coefficients, rhs, operator }) => {
      const [a, b] = coefficients;
      // Non-negativity means origin always satisfies >=
      return operator === '>=' ? (0 >= rhs) : (a * 0 + b * 0 <= rhs);
    })) {
      intersectionPoints.push([0, 0]);
    }
    
    // Find intersections between constraint lines and axes
    for (const { coefficients, rhs } of constraints) {
      const [a, b] = coefficients;
      
      // Skip invalid constraints
      if (a === 0 && b === 0) continue;
      
      // Intersection with x-axis (y=0)
      if (a !== 0) {
        const x = rhs / a;
        if (x >= 0 && constraints.every(({ coefficients: c, rhs: r, operator: op }) => {
          const [ca, cb] = c;
          return op === '>=' ? (ca * x + cb * 0 >= r) : (ca * x + cb * 0 <= r);
        })) {
          intersectionPoints.push([x, 0]);
          maxX = Math.max(maxX, x * 1.2);
        }
      }
      
      // Intersection with y-axis (x=0)
      if (b !== 0) {
        const y = rhs / b;
        if (y >= 0 && constraints.every(({ coefficients: c, rhs: r, operator: op }) => {
          const [ca, cb] = c;
          return op === '>=' ? (ca * 0 + cb * y >= r) : (ca * 0 + cb * y <= r);
        })) {
          intersectionPoints.push([0, y]);
          maxY = Math.max(maxY, y * 1.2);
        }
      }
    }
    
    // Find intersections between constraint lines
    for (let i = 0; i < constraints.length; i++) {
      for (let j = i + 1; j < constraints.length; j++) {
        const { coefficients: coeffs1, rhs: rhs1 } = constraints[i];
        const { coefficients: coeffs2, rhs: rhs2 } = constraints[j];
        const [a1, b1] = coeffs1;
        const [a2, b2] = coeffs2;
        
        // Calculate determinant to check if lines are parallel
        const det = a1 * b2 - a2 * b1;
        
        if (det !== 0) {
          // Lines intersect
          const x = (b2 * rhs1 - b1 * rhs2) / det;
          const y = (a1 * rhs2 - a2 * rhs1) / det;
          
          // Check if intersection point is feasible
          if (x >= 0 && y >= 0 && constraints.every(({ coefficients, rhs, operator }) => {
            const [a, b] = coefficients;
            return operator === '>=' ? (a * x + b * y >= rhs) : (a * x + b * y <= rhs);
          })) {
            intersectionPoints.push([x, y]);
            maxX = Math.max(maxX, x * 1.2);
            maxY = Math.max(maxY, y * 1.2);
          }
        }
      }
    }
    
    // Ensure reasonable bounds
    maxX = Math.max(maxX, 5);
    maxY = Math.max(maxY, 5);
    
    // Create a convex hull from the vertices (simplified approach)
    let sortedVertices: Array<[number, number]> = [...intersectionPoints];
    
    // Sort vertices to form a convex polygon (simplified approach)
    // Find centroid
    const centroidX = sortedVertices.reduce((sum, [x]) => sum + x, 0) / sortedVertices.length;
    const centroidY = sortedVertices.reduce((sum, [_, y]) => sum + y, 0) / sortedVertices.length;
    
    // Sort by angle from centroid
    sortedVertices.sort((a, b) => {
      const angleA = Math.atan2(a[1] - centroidY, a[0] - centroidX);
      const angleB = Math.atan2(b[1] - centroidY, b[0] - centroidX);
      return angleA - angleB;
    });
    
    return { minX, maxX, minY, maxY, vertices: sortedVertices };
  }, [lp.constraints]);
  
  // Get current solution point from simplex tableau
  const { x1, x2 } = useMemo(() => {
    if (currentStep.status !== 'optimal' && currentStep.status !== 'iteration') {
      return { x1: 0, x2: 0 };
    }
    
    const { tableau } = currentStep;
    const { matrix, basicVariables } = tableau;
    const cols = matrix[0].length;
    
    // Find values of x₁ and x₂
    let x1 = 0, x2 = 0;
    for (let i = 0; i < basicVariables.length; i++) {
      if (basicVariables[i] === 0) x1 = matrix[i + 1][cols - 1];
      if (basicVariables[i] === 1) x2 = matrix[i + 1][cols - 1];
    }
    
    return { x1, x2 };
  }, [currentStep]);
  
  // Calculate dimensions
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  // Create scales
  const xScale = useMemo(
    () => scaleLinear<number>({
      domain: [minX, maxX],
      range: [0, innerWidth],
    }),
    [minX, maxX, innerWidth]
  );
  
  const yScale = useMemo(
    () => scaleLinear<number>({
      domain: [minY, maxY],
      range: [innerHeight, 0],
    }),
    [minY, maxY, innerHeight]
  );
  
  // Variable names for labels
  const xVarName = lp.variables[0] || 'x₁';
  const yVarName = lp.variables[1] || 'x₂';
  
  return (
    <Zoom<SVGSVGElement>
      width={width}
      height={height}
      scaleXMin={0.2}
      scaleXMax={5}
      scaleYMin={0.2}
      scaleYMax={5}
      initialTransformMatrix={{
        scaleX: 1,
        scaleY: 1,
        translateX: 0,
        translateY: 0,
        skewX: 0,
        skewY: 0,
      }}
    >
      {(zoom) => (
        <div className="relative">
          <svg
            width={width}
            height={height}
            className="bg-white border border-gray-200 rounded-md"
            ref={zoom.containerRef}
            onTouchStart={zoom.dragStart}
            onTouchMove={zoom.dragMove}
            onTouchEnd={zoom.dragEnd}
            onMouseDown={zoom.dragStart}
            onMouseMove={zoom.dragMove}
            onMouseUp={zoom.dragEnd}
            onMouseLeave={zoom.dragEnd}
            onDoubleClick={(event) => {
              const point = localPoint(event) || { x: 0, y: 0 };
              zoom.scale({ scaleX: 1.1, scaleY: 1.1, point });
            }}
            style={{ 
              cursor: zoom.isDragging ? 'grabbing' : 'grab',
              touchAction: 'none' // Prevent default touch behaviors
            }}
          >
            <rect
              width={width}
              height={height}
              fill="white"
              rx={4}
              style={{ touchAction: 'none' }} // Prevent touch scrolling for mobile
            />
            
            <Group
              left={margin.left}
              top={margin.top}
              transform={zoom.toString()}
            >
              {/* Grid lines */}
              <Grid
                xScale={xScale}
                yScale={yScale}
                width={innerWidth}
                height={innerHeight}
                stroke="#e0e0e0"
                strokeDasharray="2,2"
                numTicksRows={10}
                numTicksColumns={10}
              />
              
              {/* X and Y axes */}
              <Axis
                orientation="bottom"
                scale={xScale}
                top={innerHeight}
                label={xVarName}
                stroke="#333"
                tickStroke="#333"
              />
              <Axis
                orientation="left"
                scale={yScale}
                label={yVarName}
                stroke="#333"
                tickStroke="#333"
              />
              
              {/* Feasible region (polygon) */}
              {vertices.length > 2 && (
                <Polygon
                  points={vertices.map(([x, y]) =>
                    [xScale(x), yScale(y)]
                  )}
                  fill="#3498db"
                  fillOpacity={0.2}
                  stroke="#3498db"
                  strokeWidth={1}
                />
              )}
              
              {/* Constraint lines */}
              {lp.constraints.map((constraint, i) => {
                const { coefficients, rhs } = constraint;
                const [a, b] = coefficients;
                
                // Skip invalid constraints
                if (a === 0 && b === 0) return null;
                
                // For simple constraints, draw the line
                let points: Array<[number, number]> = [];
                
                if (a === 0) {
                  // Horizontal line: y = rhs/b
                  const y = rhs / b;
                  points = [[minX, y], [maxX, y]];
                } else if (b === 0) {
                  // Vertical line: x = rhs/a
                  const x = rhs / a;
                  points = [[x, minY], [x, maxY]];
                } else {
                  // Line: ax + by = c => y = (c - ax) / b
                  const x1 = minX;
                  const y1 = (rhs - a * x1) / b;
                  
                  const x2 = maxX;
                  const y2 = (rhs - a * x2) / b;
                  
                  points = [[x1, y1], [x2, y2]];
                }
                
                // Format constraint label
                const formatCoef = (value: number, varName: string) => {
                  if (value === 0) return "";
                  if (value === 1) return `+${varName}`;
                  if (value === -1) return `-${varName}`;
                  return `${value > 0 ? "+" : ""}${value}${varName}`;
                };
                
                let labelText = '';
                if (a !== 0) {
                  labelText = a === 1 ? xVarName : a === -1 ? `-${xVarName}` : `${a}${xVarName}`;
                }
                if (b !== 0) {
                  const bTerm = b === 1 ? yVarName : b === -1 ? `-${yVarName}` : `${b}${yVarName}`;
                  labelText = labelText ? 
                    `${labelText} ${b > 0 ? '+' : ''} ${bTerm}` : 
                    bTerm;
                }
                labelText = `${labelText} ${constraint.operator} ${rhs}`;
                
                // Position label near the middle of the line segment
                const labelX = (points[0][0] + points[1][0]) / 2;
                const labelY = (points[0][1] + points[1][1]) / 2;
                
                return (
                  <Group key={`constraint-${i}`}>
                    <LinePath
                      data={points}
                      x={(d) => xScale(d[0])}
                      y={(d) => yScale(d[1])}
                      stroke="#3498db"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <Text
                      x={xScale(labelX)}
                      y={yScale(labelY) - 10}
                      textAnchor="middle"
                      fill="#3498db"
                      fontSize={12}
                      dy="-0.5em"
                      fontWeight={500}
                    >
                      {labelText}
                    </Text>
                  </Group>
                );
              })}
              
              {/* Non-negativity axes */}
              <LinePath
                data={[[0, 0], [0, maxY]]}
                x={(d) => xScale(d[0])}
                y={(d) => yScale(d[1])}
                stroke="#95a5a6"
                strokeWidth={1.5}
              />
              <LinePath
                data={[[0, 0], [maxX, 0]]}
                x={(d) => xScale(d[0])}
                y={(d) => yScale(d[1])}
                stroke="#95a5a6"
                strokeWidth={1.5}
              />
              
              {/* Objective function gradient */}
              {lp.objective.length >= 2 && (currentStep.status === 'optimal' || currentStep.status === 'iteration') && (
                <Group>
                  {/* Draw objective function direction at current solution */}
                  <LinePath
                    data={[
                      [x1, x2],
                      [x1 + (lp.isMaximization ? 1 : -1) * lp.objective[0] * 0.8, 
                       x2 + (lp.isMaximization ? 1 : -1) * lp.objective[1] * 0.8]
                    ]}
                    x={(d) => xScale(d[0])}
                    y={(d) => yScale(d[1])}
                    stroke="#e67e22"
                    strokeWidth={2}
                    markerEnd="url(#marker-arrow-gradient)"
                  />
                  <Marker id="marker-arrow-gradient" refX={2} fill="#e67e22">
                    <path d="M 0,0 L 6,3 L 0,6 z" />
                  </Marker>
                  
                </Group>
              )}
              
              {/* Current solution point */}
              {(currentStep.status === 'optimal' || currentStep.status === 'iteration') && (
                <Group>
                  <circle
                    cx={xScale(x1)}
                    cy={yScale(x2)}
                    r={6}
                    fill="#e74c3c"
                  />
                  <Text
                    x={xScale(x1) + 10}
                    y={yScale(x2) - 10}
                    fontSize={12}
                    fill="#e74c3c"
                    fontWeight={500}
                  >
                    {`(${x1.toFixed(2)}, ${x2.toFixed(2)})`}
                  </Text>
                </Group>
              )}
            </Group>
          </svg>
          
          {/* Zoom controls */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1">
            <button
              className="p-2 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 flex items-center justify-center"
              onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
              aria-label="Aumentar zoom"
              style={{ touchAction: 'none' }} // Prevent touch events from scrolling the page
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              className="p-2 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 flex items-center justify-center"
              onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
              aria-label="Diminuir zoom"
              style={{ touchAction: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              className="p-2 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 flex items-center justify-center"
              onClick={zoom.reset}
              aria-label="Resetar visualização"
              style={{ touchAction: 'none' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 12h9m9 0h-9m0 0V3m0 9v9" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 p-2 rounded border border-gray-200 text-xs md:text-sm shadow-sm">
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 opacity-20 border border-blue-500 mr-1"></div>
                <span>Região Viável</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-none mr-1"></div>
                <span>Restrições</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span>Solução Atual</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-0 border-t-2 border-orange-500 mr-1"></div>
                <span>
                  Direção de {lp.isMaximization ? "Max" : "Min"}
                  {lp.objectiveRHS ? ` (${lp.objective[0]}${xVarName} + ${lp.objective[1]}${yVarName} ${lp.objectiveRHS >= 0 ? '+' : ''} ${lp.objectiveRHS})` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Zoom>
  );
};

export default GeometricVisualizerVisx;
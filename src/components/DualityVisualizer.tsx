import React, { useState } from 'react';
import type { LinearProgram } from '@/components/types';
import { convertToDual, formatLinearProgram } from '../lib/duality-converter';
import type { DualityExplanation } from '../lib/duality-converter';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowRight, ArrowDown, Info } from 'lucide-react';
import { DualityNarrative } from './DualityNarrative';

interface DualityVisualizerProps {
  problem: LinearProgram;
}

export const DualityVisualizer: React.FC<DualityVisualizerProps> = ({ problem }) => {
  const [dualityResult, setDualityResult] = useState<DualityExplanation | null>(null);
  
  // Convert to dual on component mount or problem change
  React.useEffect(() => {
    const result = convertToDual(problem);
    setDualityResult(result);
  }, [problem]);
  
  if (!dualityResult) {
    return <div>Processando conversão para o dual...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Primal and Dual in Single Row */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-4 overflow-x-auto">
        {/* Primal Problem */}
        <Card className="w-full lg:flex-1 lg:max-w-md">
          <CardHeader className="bg-blue-50 py-3">
            <CardTitle className="text-blue-900 text-lg">Problema Primal</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm bg-gray-50 p-3 rounded">
              {formatLinearProgram(dualityResult.primal)}
            </pre>
          </CardContent>
        </Card>
        
        {/* Arrow */}
        <div className="flex-shrink-0 rotate-90 lg:rotate-0">
          <ArrowRight className="w-8 h-8 text-gray-400" />
        </div>
        
        {/* Dual Problem */}
        <Card className="w-full lg:flex-1 lg:max-w-md">
          <CardHeader className="bg-green-50 py-3">
            <CardTitle className="text-green-900 text-lg">Problema Dual</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4">
            <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm bg-gray-50 p-3 rounded">
              {formatLinearProgram(dualityResult.dual)}
            </pre>
          </CardContent>
        </Card>
      </div>
      
      
      {/* Narrative Story */}
      <DualityNarrative primal={dualityResult.primal} dual={dualityResult.dual} />
    </div>
  );
};


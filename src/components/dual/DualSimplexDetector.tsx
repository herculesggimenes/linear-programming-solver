import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import type { SimplexTableau } from '@/components/types';
import { 
  isDualSimplexCandidate, 
  needsDualSimplex,
  createReoptimizationScenario 
} from '@/lib/dual-simplex-solver';

interface DualSimplexDetectorProps {
  tableau: SimplexTableau;
  onReoptimize?: (modifiedTableau: SimplexTableau) => void;
}

const DualSimplexDetector: React.FC<DualSimplexDetectorProps> = ({ 
  tableau, 
  onReoptimize 
}) => {
  const [showModification, setShowModification] = useState(false);
  const [rhsChanges, setRhsChanges] = useState<{ constraint: number; newValue: number }[]>([]);
  
  const isDualCandidate = isDualSimplexCandidate(tableau);
  const dualCheck = needsDualSimplex(tableau);
  
  // Check tableau status
  const isOptimal = tableau.matrix[0].slice(0, -1).every(val => val >= -1e-10);
  const isFeasible = tableau.matrix.slice(1).every(row => row[row.length - 1] >= -1e-10);
  
  const handleAddRHSChange = () => {
    setRhsChanges([...rhsChanges, { constraint: 0, newValue: 0 }]);
  };
  
  const handleRHSChange = (index: number, field: 'constraint' | 'newValue', value: number) => {
    const newChanges = [...rhsChanges];
    newChanges[index] = { ...newChanges[index], [field]: value };
    setRhsChanges(newChanges);
  };
  
  const handleApplyChanges = () => {
    if (rhsChanges.length > 0 && onReoptimize) {
      const modifiedTableau = createReoptimizationScenario(tableau, rhsChanges);
      onReoptimize(modifiedTableau);
      setShowModification(false);
      setRhsChanges([]);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Status do Tableau
            <div className="flex gap-2">
              {isOptimal && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ótimo
                </Badge>
              )}
              {isFeasible ? (
                <Badge variant="default" className="bg-blue-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Factível
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  Infactível
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Dual Simplex Detection */}
            {isDualCandidate && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Dual Simplex Necessário!</strong><br />
                  A solução é ótima mas infactível. Use o Dual Simplex para restaurar factibilidade.
                </AlertDescription>
              </Alert>
            )}
            
            {/* Detailed Status */}
            <div className="text-sm space-y-2">
              <div>
                <strong>Custos Reduzidos:</strong>
                <div className="font-mono text-xs mt-1 flex flex-wrap gap-2">
                  {tableau.matrix[0].slice(0, -1).map((val, idx) => (
                    <span 
                      key={idx} 
                      className={`px-2 py-1 rounded ${
                        val >= -1e-10 ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      x{idx + 1}: {val.toFixed(2)}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <strong>Valores RHS (Lado Direito):</strong>
                <div className="font-mono text-xs mt-1 space-y-1">
                  {tableau.matrix.slice(1).map((row, idx) => {
                    const rhs = row[row.length - 1];
                    const varName = tableau.variableNames[tableau.basicVariables[idx]];
                    return (
                      <div 
                        key={idx}
                        className={`flex justify-between px-2 py-1 rounded ${
                          rhs >= -1e-10 ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        <span>{varName}:</span>
                        <span className={rhs < -1e-10 ? 'font-bold text-red-600' : ''}>
                          {rhs.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {dualCheck.negativeRows.length > 0 && (
                <div className="text-red-600 text-xs">
                  Linhas com RHS negativo: {dualCheck.negativeRows.map(r => r + 1).join(', ')}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Re-optimization Scenario */}
      {isOptimal && isFeasible && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Cenário de Re-otimização
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowModification(!showModification)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Modificar RHS
              </Button>
            </CardTitle>
          </CardHeader>
          {showModification && (
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Modifique os valores do lado direito (RHS) das restrições para criar 
                  um cenário de re-otimização que necessite do Dual Simplex.
                </p>
                
                {/* RHS Modification Form */}
                <div className="space-y-2">
                  {rhsChanges.map((change, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select
                        value={change.constraint}
                        onChange={(e) => handleRHSChange(idx, 'constraint', Number(e.target.value))}
                        className="border rounded px-2 py-1 text-sm"
                      >
                        {tableau.matrix.slice(1).map((_, rowIdx) => (
                          <option key={rowIdx} value={rowIdx}>
                            Restrição {rowIdx + 1}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm">novo RHS:</span>
                      <input
                        type="number"
                        value={change.newValue}
                        onChange={(e) => handleRHSChange(idx, 'newValue', Number(e.target.value))}
                        className="border rounded px-2 py-1 w-20 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRhsChanges(rhsChanges.filter((_, i) => i !== idx))}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAddRHSChange}
                    className="w-full"
                  >
                    + Adicionar Modificação
                  </Button>
                </div>
                
                {rhsChanges.length > 0 && (
                  <Button
                    onClick={handleApplyChanges}
                    className="w-full"
                  >
                    Aplicar Mudanças e Re-otimizar
                  </Button>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}
      
      {/* Educational Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold text-blue-900 mb-2">
            Quando usar o Dual Simplex?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Após adicionar novas restrições que tornam a solução atual infactível</li>
            <li>Quando os valores RHS são modificados (análise de sensibilidade)</li>
            <li>Em problemas de corte (cutting plane) para programação inteira</li>
            <li>Para re-otimização eficiente após mudanças no problema</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DualSimplexDetector;
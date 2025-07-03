import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const GenericTableauDisplay: React.FC = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Quadro Simplex Genérico
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>Este quadro mostra a estrutura geral de um tableau Simplex em termos matriciais.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="px-4 py-2 text-left font-semibold">Base</th>
                <th className="px-4 py-2 text-center font-semibold">x<sub>B</sub></th>
                <th className="px-4 py-2 text-center font-semibold">x<sub>N</sub></th>
                <th className="px-4 py-2 text-center font-semibold">-z</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="px-4 py-3 font-semibold">Linha 0</td>
                <td className="px-4 py-3 text-center bg-gray-50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help font-mono">0</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Custos reduzidos das variáveis básicas são sempre zero</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="px-4 py-3 text-center bg-blue-50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help font-mono">(c'<sub>N</sub> - c'<sub>B</sub>B<sup>-1</sup>N)</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p className="font-semibold mb-1">Custos Reduzidos</p>
                        <p>c'<sub>N</sub>: custos das variáveis não-básicas</p>
                        <p>c'<sub>B</sub>: custos das variáveis básicas</p>
                        <p>B<sup>-1</sup>N: colunas não-básicas transformadas</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="px-4 py-3 text-center bg-green-50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help font-mono">-c'<sub>B</sub>B<sup>-1</sup>b</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p className="font-semibold mb-1">Valor da Função Objetivo</p>
                        <p>Negativo do produto: custos básicos × solução básica</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-semibold">Linhas 1..m</td>
                <td className="px-4 py-3 text-center bg-gray-50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help font-mono">I</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Matriz identidade (colunas básicas após transformação)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="px-4 py-3 text-center bg-blue-50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help font-mono">B<sup>-1</sup>N</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p className="font-semibold mb-1">Colunas Não-Básicas Transformadas</p>
                        <p>Resultado da multiplicação B<sup>-1</sup> × N</p>
                        <p>onde N são as colunas não-básicas originais</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
                <td className="px-4 py-3 text-center bg-green-50">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help font-mono">B<sup>-1</sup>b</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p className="font-semibold mb-1">Solução Básica</p>
                        <p>Valores das variáveis básicas</p>
                        <p>x<sub>B</sub> = B<sup>-1</sup>b</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Como usar este quadro:
          </h4>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Para reconstruir o tableau: aplique as fórmulas usando a base atual</li>
            <li>Para verificar otimalidade: verifique se todos os custos reduzidos ≤ 0 (max) ou ≥ 0 (min)</li>
            <li>Para verificar factibilidade: verifique se B<sup>-1</sup>b ≥ 0</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default GenericTableauDisplay;
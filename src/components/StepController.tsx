import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { 
  SkipBack, 
  SkipForward, 
  Rewind, 
  FastForward 
} from 'lucide-react';
import { Badge } from './ui/badge';

interface StepControllerProps {
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  disabled?: boolean;
}

const StepController: React.FC<StepControllerProps> = ({
  currentStep,
  totalSteps,
  onStepChange,
  disabled = false
}) => {
  const handleFirst = () => {
    if (!disabled) onStepChange(0);
  };
  
  const handlePrevious = () => {
    if (!disabled && currentStep > 0) onStepChange(currentStep - 1);
  };
  
  const handleNext = () => {
    if (!disabled && currentStep < totalSteps - 1) onStepChange(currentStep + 1);
  };
  
  const handleLast = () => {
    if (!disabled) onStepChange(totalSteps - 1);
  };
  
  
  const handleSliderChange = (value: number[]) => {
    if (!disabled) {
      onStepChange(value[0]);
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              Passo <Badge variant="outline" className="ml-1 mr-1 font-bold">{currentStep + 1}</Badge> 
              de 
              <Badge variant="outline" className="ml-1 font-bold">{totalSteps}</Badge>
            </div>
          </div>
          
          <Slider
            value={[currentStep]}
            min={0}
            max={totalSteps - 1}
            step={1}
            onValueChange={handleSliderChange}
            disabled={disabled}
            className="my-2"
          />
          
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleFirst}
              disabled={disabled || currentStep === 0}
              title="Primeiro passo"
              className="h-9 w-9"
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
              disabled={disabled || currentStep === 0}
              title="Passo anterior"
              className="h-9 w-9"
            >
              <Rewind className="h-4 w-4" />
            </Button>
            
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              disabled={disabled || currentStep === totalSteps - 1}
              title="Próximo passo"
              className="h-9 w-9"
            >
              <FastForward className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleLast}
              disabled={disabled || currentStep === totalSteps - 1}
              title="Último passo"
              className="h-9 w-9"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepController;
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, MapPin, CreditCard, Users, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'wouter';

interface OnboardingFlowProps {
  onComplete: () => void;
  userName?: string;
}

const steps = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Run Your Trip!',
    subtitle: 'Sua jornada para viagens incríveis começa aqui',
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Check className="h-5 w-5 text-green-500" />
          <span>Planeje viagens personalizadas em minutos</span>
        </div>
        <div className="flex items-center space-x-3">
          <Check className="h-5 w-5 text-green-500" />
          <span>Reserve hotéis e passagens com desconto</span>
        </div>
        <div className="flex items-center space-x-3">
          <Check className="h-5 w-5 text-green-500" />
          <span>Ganhe R$ 10 por cada amigo indicado</span>
        </div>
      </div>
    ),
  },
  {
    id: 'explore',
    title: 'Explore Destinos Incríveis',
    subtitle: 'Descubra lugares únicos com nossos roteiros',
    icon: MapPin,
    content: (
      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <img 
              src="https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=200&q=80" 
              alt="Fernando de Noronha" 
              className="rounded-lg mb-2 w-full h-24 object-cover"
            />
            <p className="text-sm font-medium">Fernando de Noronha</p>
            <p className="text-xs text-gray-500">Paraíso tropical</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <img 
              src="https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=200&q=80" 
              alt="Rio de Janeiro" 
              className="rounded-lg mb-2 w-full h-24 object-cover"
            />
            <p className="text-sm font-medium">Rio de Janeiro</p>
            <p className="text-xs text-gray-500">Cidade maravilhosa</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <img 
              src="https://images.unsplash.com/photo-1543385426-191664295b58?w=200&q=80" 
              alt="Chapada Diamantina" 
              className="rounded-lg mb-2 w-full h-24 object-cover"
            />
            <p className="text-sm font-medium">Chapada Diamantina</p>
            <p className="text-xs text-gray-500">Aventura e natureza</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <img 
              src="https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=200&q=80" 
              alt="Foz do Iguaçu" 
              className="rounded-lg mb-2 w-full h-24 object-cover"
            />
            <p className="text-sm font-medium">Foz do Iguaçu</p>
            <p className="text-xs text-gray-500">Cataratas incríveis</p>
          </CardContent>
        </Card>
      </div>
    ),
  },
  {
    id: 'book',
    title: 'Reserve com Facilidade',
    subtitle: 'Tudo em um só lugar, com os melhores preços',
    icon: CreditCard,
    content: (
      <div className="space-y-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-blue-900">Hotéis Premium</p>
                <p className="text-sm text-blue-700">Até 40% de desconto</p>
              </div>
              <div className="text-2xl font-bold text-blue-900">-40%</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-green-900">Passagens Aéreas</p>
                <p className="text-sm text-green-700">Compare e economize</p>
              </div>
              <div className="text-2xl font-bold text-green-900">✈️</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-purple-900">Pacotes Completos</p>
                <p className="text-sm text-purple-700">Hotel + Voo + Passeios</p>
              </div>
              <div className="text-2xl font-bold text-purple-900">📦</div>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
  },
  {
    id: 'share',
    title: 'Ganhe Indicando Amigos',
    subtitle: 'R$ 10 por cada amigo que se cadastrar',
    icon: Users,
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-6 text-center">
          <p className="text-4xl font-bold text-orange-600 mb-2">R$ 10</p>
          <p className="text-gray-700">Por cada amigo indicado</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full p-1">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Compartilhe seu código</p>
              <p className="text-sm text-gray-500">Envie para amigos via WhatsApp</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full p-1">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Amigo se cadastra</p>
              <p className="text-sm text-gray-500">Usando seu código especial</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 rounded-full p-1">
              <Check className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Receba R$ 10</p>
              <p className="text-sm text-gray-500">Direto na sua conta</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export function OnboardingFlow({ onComplete, userName }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [, navigate] = useNavigate();
  
  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      navigate('/marketplace');
    }
  };
  
  const handleSkip = () => {
    onComplete();
    navigate('/marketplace');
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Progress Bar */}
        <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500">
          <Progress value={progress} className="h-2 bg-white/30" />
          <div className="flex justify-between items-center mt-2">
            <p className="text-white text-sm">
              Passo {currentStep + 1} de {steps.length}
            </p>
            <button
              onClick={handleSkip}
              className="text-white/80 hover:text-white text-sm underline"
            >
              Pular tour
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-3">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {userName && currentStep === 0 
                      ? `Olá, ${userName}! ${currentStepData.title}` 
                      : currentStepData.title}
                  </h2>
                  <p className="text-sm text-gray-600">{currentStepData.subtitle}</p>
                </div>
              </div>
              
              {/* Step Content */}
              <div className="my-6">
                {currentStepData.content}
              </div>
              
              {/* Navigation */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  className={`text-gray-500 hover:text-gray-700 ${
                    currentStep === 0 ? 'invisible' : ''
                  }`}
                >
                  Voltar
                </button>
                
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      Começar Agora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Próximo
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
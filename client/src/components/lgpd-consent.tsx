import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Cookies from 'js-cookie';

const CONSENT_COOKIE = 'lgpd_consent';
const CONSENT_VERSION = '1.0';

interface ConsentData {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  version: string;
  timestamp: string;
}

export function LGPDConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<ConsentData>({
    necessary: true,
    analytics: false,
    marketing: false,
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    const savedConsent = Cookies.get(CONSENT_COOKIE);
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        if (parsed.version !== CONSENT_VERSION) {
          setShowBanner(true);
        } else {
          setConsent(parsed);
          applyConsent(parsed);
        }
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const applyConsent = (consentData: ConsentData) => {
    // Initialize GA4 if analytics consent given
    if (consentData.analytics && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted'
      });
    }

    // Initialize Meta Pixel if marketing consent given
    if (consentData.marketing && window.fbq) {
      window.fbq('consent', 'grant');
    }
  };

  const saveConsent = (accepted: 'all' | 'necessary' | 'custom') => {
    let finalConsent = { ...consent };
    
    if (accepted === 'all') {
      finalConsent.analytics = true;
      finalConsent.marketing = true;
    } else if (accepted === 'necessary') {
      finalConsent.analytics = false;
      finalConsent.marketing = false;
    }

    finalConsent.timestamp = new Date().toISOString();
    
    Cookies.set(CONSENT_COOKIE, JSON.stringify(finalConsent), { 
      expires: 365,
      sameSite: 'Lax',
      secure: true 
    });
    
    applyConsent(finalConsent);
    setShowBanner(false);
    setShowDetails(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <Card className="mx-auto max-w-6xl bg-white/95 backdrop-blur-lg shadow-2xl border-2">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <Cookie className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Política de Cookies e Privacidade
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3" />
                    Em conformidade com a LGPD
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBanner(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Fechar banner"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!showDetails ? (
              <>
                <p className="text-gray-700 mb-6">
                  Utilizamos cookies para melhorar sua experiência, analisar o tráfego do site 
                  e personalizar conteúdo. Você pode aceitar todos os cookies ou personalizar suas preferências.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => saveConsent('all')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Aceitar Todos
                  </Button>
                  <Button
                    onClick={() => saveConsent('necessary')}
                    variant="outline"
                  >
                    Apenas Necessários
                  </Button>
                  <Button
                    onClick={() => setShowDetails(true)}
                    variant="ghost"
                  >
                    Personalizar
                  </Button>
                  <a
                    href="/privacidade"
                    className="inline-flex items-center justify-center text-sm text-blue-600 hover:text-blue-700 underline px-3"
                  >
                    Política de Privacidade
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Cookies Necessários</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Essenciais para o funcionamento do site. Não podem ser desativados.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.necessary}
                      disabled
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Cookies de Análise</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Nos ajudam a entender como você usa o site (Google Analytics).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Cookies de Marketing</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Usados para mostrar anúncios relevantes (Meta Pixel, Google Ads).
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.marketing}
                      onChange={(e) => setConsent({ ...consent, marketing: e.target.checked })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => saveConsent('custom')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Salvar Preferências
                  </Button>
                  <Button
                    onClick={() => setShowDetails(false)}
                    variant="outline"
                  >
                    Voltar
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

// Declare global types for GA and FB
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}
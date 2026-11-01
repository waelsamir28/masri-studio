import React, { useState } from 'react';
import { PlanType, UserSubscription, PaymentMethod } from '../types';
import { addToast } from '../services/notificationService';

interface SubscriptionPlansProps {
  lang: 'en' | 'ar';
  onClose: () => void;
  currentPlan?: PlanType;
}

const PLANS = [
  {
    id: 'free' as PlanType,
    name: 'مجاني', nameEn: 'Free',
    price: 0, priceMonthly: 0,
    color: 'from-gray-500 to-gray-700',
    borderColor: 'border-gray-500/30',
    popular: false,
    features: [
      { en: '5 generations / day', ar: '5 توليدات / يوم' },
      { en: 'Standard quality', ar: 'جودة عادية' },
      { en: 'All voice actors', ar: 'كل المؤدين' },
      { en: 'Basic support', ar: 'دعم أساسي' },
      { en: 'Local storage only', ar: 'تخزين محلي فقط' },
    ],
    limitations: [
      { en: 'No voice cloning', ar: 'لا يوجد استنساخ صوتي' },
      { en: 'No team features', ar: 'لا يوجد فريق عمل' },
      { en: 'No cloud backup', ar: 'لا يوجد نسخ احتياطي' },
    ]
  },
  {
    id: 'pro' as PlanType,
    name: 'احترافي', nameEn: 'Pro',
    price: 99, priceMonthly: 99,
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500/50',
    popular: true,
    features: [
      { en: '100 generations / day', ar: '100 توليد / يوم' },
      { en: 'HD quality', ar: 'جودة عالية HD' },
      { en: 'All voice actors + VIP', ar: 'كل المؤدين + VIP' },
      { en: '3 voice clones', ar: '3 أصوات مستنسخة' },
      { en: 'Cloud storage (1GB)', ar: 'تخزين سحابي (1 جيجا)' },
      { en: 'Priority support', ar: 'دعم أولوي' },
      { en: 'Download as MP3/WAV', ar: 'تحميل MP3/WAV' },
    ],
    limitations: [
      { en: 'No team features', ar: 'لا يوجد فريق عمل' },
    ]
  },
  {
    id: 'business' as PlanType,
    name: 'شركات', nameEn: 'Business',
    price: 299, priceMonthly: 299,
    color: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500/50',
    popular: false,
    features: [
      { en: 'Unlimited generations', ar: 'توليدات غير محدودة' },
      { en: 'Ultra HD quality', ar: 'جودة Ultra HD' },
      { en: 'All actors + early access', ar: 'كل المؤدين + وصول مبكر' },
      { en: '10 voice clones', ar: '10 أصوات مستنسخة' },
      { en: 'Cloud storage (10GB)', ar: 'تخزين سحابي (10 جيجا)' },
      { en: 'Team workspace (up to 25)', ar: 'فريق عمل (حتى 25)' },
      { en: 'API access', ar: 'وصول API' },
      { en: '24/7 dedicated support', ar: 'دعم 24/7' },
      { en: 'Custom branding', ar: 'علامتك التجارية' },
      { en: 'Analytics dashboard', ar: 'لوحة تحليلات' },
    ],
    limitations: []
  }
];

const PAYMENT_METHODS: { id: PaymentMethod; name: string; nameEn: string; icon: string; color: string }[] = [
  { id: 'visa', name: 'فيزا / ماستركارد', nameEn: 'Visa / Mastercard', icon: 'fa-credit-card', color: 'from-blue-600 to-blue-800' },
  { id: 'vodafone_cash', name: 'فودافون كاش', nameEn: 'Vodafone Cash', icon: 'fa-mobile-screen', color: 'from-red-500 to-red-700' },
  { id: 'fawry', name: 'فوري', nameEn: 'Fawry', icon: 'fa-store', color: 'from-yellow-500 to-orange-600' },
  { id: 'instapay', name: 'إنستاباي', nameEn: 'InstaPay', icon: 'fa-bolt', color: 'from-green-500 to-emerald-700' },
];

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ lang, onClose, currentPlan = 'free' }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = (planId: PlanType) => {
    if (planId === 'free') {
      addToast('info', lang === 'ar' ? 'أنت على الخطة المجانية' : 'You\'re on the free plan', '');
      return;
    }
    setSelectedPlan(planId);
    setShowPayment(true);
  };

  const handlePayment = async () => {
    if (!paymentMethod || !selectedPlan) return;
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const sub: UserSubscription = {
      plan: selectedPlan,
      generationsToday: 0,
      generationsLimit: selectedPlan === 'pro' ? 100 : 999999,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      paymentMethod
    };
    localStorage.setItem('masri-subscription', JSON.stringify(sub));
    
    setIsProcessing(false);
    addToast('success', lang === 'ar' ? 'تم الاشتراك!' : 'Subscribed!', lang === 'ar' ? 'مرحباً في الخطة الاحترافية' : 'Welcome to Pro!');
    
    setTimeout(() => onClose(), 1500);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col win11-card animate-scale-in overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-4 border-b border-border text-center">
          <h3 className="text-base font-bold text-txt-primary flex items-center justify-center gap-2">
            <i className="fas fa-crown text-yellow-400"></i>
            {lang === 'ar' ? 'اختر خطتك' : 'Choose Your Plan'}
          </h3>
          <p className="text-[10px] text-txt-muted mt-1">{lang === 'ar' ? 'أسعار مناسبة للجميع • إلغاء في أي وقت' : 'Affordable for everyone • Cancel anytime'}</p>
        </div>

        {!showPayment ? (
          /* Plans Grid */
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map(plan => (
                <div key={plan.id} className={`relative rounded-2xl border-2 ${plan.borderColor} p-4 transition-all hover:scale-[1.02] ${plan.popular ? 'ring-2 ring-accent/30' : ''} ${currentPlan === plan.id ? 'bg-accent/5' : 'bg-surface2/30'}`}>
                  {plan.popular && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-[9px] text-white font-bold shadow-lg">
                      {lang === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                    </div>
                  )}
                  {currentPlan === plan.id && (
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-green-500/20 text-[8px] text-green-400 font-bold">
                      {lang === 'ar' ? 'خطتك الحالية' : 'Current Plan'}
                    </div>
                  )}

                  <div className="text-center pt-2">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                      <i className={`fas ${plan.id === 'free' ? 'fa-gift' : plan.id === 'pro' ? 'fa-rocket' : 'fa-building'} text-white text-lg`}></i>
                    </div>
                    <h4 className="text-sm font-bold text-txt-primary">{lang === 'ar' ? plan.name : plan.nameEn}</h4>
                    <div className="mt-2 mb-3">
                      <span className="text-2xl font-bold text-accent">{plan.price}</span>
                      <span className="text-[10px] text-txt-muted"> {lang === 'ar' ? 'ج.م / شهر' : 'EGP / month'}</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-[10px] text-txt-secondary">
                        <i className="fas fa-check text-green-400 text-[8px]"></i>
                        {lang === 'ar' ? f.ar : f.en}
                      </li>
                    ))}
                    {plan.limitations.map((f, i) => (
                      <li key={`l-${i}`} className="flex items-center gap-1.5 text-[10px] text-txt-muted">
                        <i className="fas fa-xmark text-red-400/60 text-[8px]"></i>
                        {lang === 'ar' ? f.ar : f.en}
                      </li>
                    ))}
                  </ul>

                  <button onClick={() => handleSubscribe(plan.id)} disabled={currentPlan === plan.id} className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                    currentPlan === plan.id 
                      ? 'bg-surface2 text-txt-muted cursor-not-allowed border border-border'
                      : plan.popular 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02]' 
                        : 'win11-button hover:border-accent/30'
                  }`}>
                    {currentPlan === plan.id 
                      ? (lang === 'ar' ? 'خطتك الحالية' : 'Current Plan')
                      : plan.id === 'free' 
                        ? (lang === 'ar' ? 'البدء مجاناً' : 'Start Free')
                        : (lang === 'ar' ? 'اشترك الآن' : 'Subscribe Now')
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Payment Method */
          <div className="flex-1 overflow-y-auto p-5">
            <button onClick={() => setShowPayment(false)} className="text-[10px] text-txt-muted hover:text-accent flex items-center gap-1 mb-4">
              <i className="fas fa-arrow-right"></i>
              {lang === 'ar' ? 'رجوع للخطط' : 'Back to plans'}
            </button>

            <div className="bg-surface2/50 rounded-xl p-3 border border-border mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="fas fa-shopping-cart text-accent"></i>
                <span className="text-xs font-bold text-txt-primary">{lang === 'ar' ? 'الباقة المختارة:' : 'Selected plan:'}</span>
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-accent">
                  {lang === 'ar' ? PLANS.find(p => p.id === selectedPlan)?.name : PLANS.find(p => p.id === selectedPlan)?.nameEn}
                </span>
                <span className="text-xs text-txt-muted mr-2">
                  {PLANS.find(p => p.id === selectedPlan)?.price} {lang === 'ar' ? 'ج.م' : 'EGP'}
                </span>
              </div>
            </div>

            <h4 className="text-xs font-bold text-txt-primary mb-3">
              <i className="fas fa-wallet text-accent ml-1"></i>
              {lang === 'ar' ? 'اختر طريقة الدفع' : 'Choose payment method'}
            </h4>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {PAYMENT_METHODS.map(method => (
                <button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`p-3 rounded-xl border-2 transition-all text-center ${paymentMethod === method.id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/30'}`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                    <i className={`fas ${method.icon} text-white text-sm`}></i>
                  </div>
                  <p className="text-[10px] font-bold text-txt-primary">{lang === 'ar' ? method.name : method.nameEn}</p>
                </button>
              ))}
            </div>

            <button onClick={handlePayment} disabled={!paymentMethod || isProcessing} className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              paymentMethod && !isProcessing 
                ? 'bg-gradient-to-r from-green-500 to-emerald-700 text-white shadow-xl' 
                : 'bg-surface2 text-txt-muted cursor-not-allowed border border-border'
            }`}>
              {isProcessing ? (
                <><i className="fas fa-spinner fa-spin"></i>{lang === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</>
              ) : (
                <><i className="fas fa-lock"></i>{lang === 'ar' ? 'تأكيد الدفع' : 'Confirm Payment'}</>
              )}
            </button>

            <p className="text-[9px] text-txt-muted text-center mt-2 flex items-center justify-center gap-1">
              <i className="fas fa-shield-halved text-green-400"></i>
              {lang === 'ar' ? 'دفع آمن ومشفر 100%' : '100% secure encrypted payment'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

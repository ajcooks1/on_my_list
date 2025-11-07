import React from 'react';
import Card from './common/Card';
import { SparklesIcon } from './common/icons';
import { useLocalization } from '../context/localization';

interface SubscriptionProps {
    isSubscribed: boolean;
    activePlan: string | null;
    onSubscribe: (planName: string) => void;
}

const Subscription: React.FC<SubscriptionProps> = ({ isSubscribed, activePlan, onSubscribe }) => {
  const { t } = useLocalization();

  const plans = [
    {
      name: 'Monthly',
      price: '$5.00',
      billing: t('perMonth'),
      features: [
        'Unlock Healthy Recipes',
        'Advanced Shopping Analytics',
        'Priority Support',
      ],
      cta: t('choose', { plan: 'Monthly' }),
      bestValue: false,
    },
    {
      name: 'Yearly',
      price: '$50.00',
      billing: t('perYear'),
      features: [
        'Everything in Monthly',
        'Get 2 Months Free!',
        'Exclusive Early Access to New Features',
      ],
      cta: t('choose', { plan: 'Yearly' }),
      bestValue: false,
    },
    {
      name: 'Family',
      price: '$12.00',
      billing: t('perMonth'),
      features: [
        'Everything in Yearly',
        'Share with up to 5 family members',
        'Shared Shopping Lists',
        'Family Spending Tracker',
      ],
      cta: t('choose', { plan: 'Family' }),
      bestValue: true,
    },
  ];

  const renderSubscriptionContent = () => {
    if (isSubscribed) {
      return (
          <div className="text-center">
              <Card className="max-w-2xl mx-auto">
                  <SparklesIcon className="w-16 h-16 mx-auto text-primary-500" />
                  <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">{t('subscribedMessage')}</h2>
                  <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                      {t('subscribedThanks', { plan: activePlan })}
                  </p>
              </Card>
          </div>
      );
    }

    return (
      <div className="space-y-6">
          <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('choosePlan')}</h2>
              <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
              {t('choosePlanSubtitle')}
              </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
              <Card key={plan.name} className={`flex flex-col relative ${plan.bestValue ? 'border-4 border-primary-500' : ''}`}>
                  {plan.bestValue && (
                  <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 text-sm font-semibold text-white bg-primary-500 rounded-full shadow-lg">
                      {t('bestValue')}
                  </div>
                  )}
                  <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-center">{plan.name}</h3>
                  <div className="my-4 text-center">
                      <span className="text-5xl font-extrabold">{plan.price}</span>
                      <span className="text-gray-500 dark:text-gray-400">/{plan.billing.split(' ')[1]}</span>
                  </div>
                  <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                      {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          <span>{feature}</span>
                      </li>
                      ))}
                  </ul>
                  </div>
                  <button
                  onClick={() => onSubscribe(plan.name)}
                  className={`w-full mt-8 px-6 py-3 font-semibold text-white rounded-lg shadow-md transition-colors ${
                      plan.bestValue 
                      ? 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500' 
                      : 'bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                  }`}
                  >
                  {plan.cta}
                  </button>
              </Card>
              ))}
          </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-12">
      {renderSubscriptionContent()}
    </div>
  );
};

export default Subscription;
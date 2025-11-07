import React, { useState } from 'react';
import { generateHealthyRecipe, validateDish } from '../services/geminiService';
import { Recipe, AppTab } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { HeartIcon, SparklesIcon } from './common/icons';
import { useLocalization } from '../context/localization';

interface HealthProps {
  isSubscribed: boolean;
  setActiveTab: (tab: AppTab) => void;
}

const Health: React.FC<HealthProps> = ({ isSubscribed, setActiveTab }) => {
  const [dish, setDish] = useState('');
  const [servings, setServings] = useState(2);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Generating...');
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocalization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dish.trim()) {
      setError("Please enter a dish name.");
      return;
    }
    setLoading(true);
    setError(null);
    setRecipe(null);
    try {
      setLoadingMessage(t('validatingDish'));
      const validation = await validateDish(dish);

      if (!validation.isValid) {
        setError(validation.reason || `"${dish}" doesn't seem to be a valid food dish. Please try again.`);
        setLoading(false);
        return;
      }

      setLoadingMessage(t('creatingHealthyRecipe'));
      const dishToSearch = validation.correctedDish || dish;
      const result = await generateHealthyRecipe(dishToSearch, servings);
      setRecipe(result);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isSubscribed) {
    return (
        <div className="text-center">
            <Card className="max-w-2xl mx-auto">
                <SparklesIcon className="w-16 h-16 mx-auto text-primary-500" />
                <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">{t('premiumFeature')}</h2>
                <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                    {t('premiumFeatureDesc')}
                </p>
                <button
                    onClick={() => setActiveTab(AppTab.Subscription)}
                    className="mt-6 px-8 py-3 font-semibold text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 transform hover:scale-105"
                >
                    {t('viewSubscriptionPlans')}
                </button>
            </Card>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('healthyRecipeTitle')}</h2>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          {t('healthyRecipeSubtitle')}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={dish}
            onChange={(e) => setDish(e.target.value)}
            placeholder="e.g., Lasagna, Brownies, etc."
            className="flex-grow px-4 py-3 bg-white/50 dark:bg-gray-900/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex items-center gap-2">
            <label htmlFor="servings" className="font-medium">{t('servings')}</label>
            <input
              id="servings"
              type="number"
              min="1"
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              className="w-20 px-4 py-3 bg-white/50 dark:bg-gray-900/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button type="submit" disabled={loading} className="px-6 py-3 font-semibold text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 transition-colors">
            {loading ? loadingMessage : t('getHealthyRecipe')}
          </button>
        </form>
      </Card>

      {loading && <Spinner />}
      {error && <p className="text-center text-red-500">{error}</p>}

      {recipe && (
        <Card>
          <h3 className="text-3xl font-bold text-primary-600 dark:text-primary-400">{recipe.recipeName}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Serves {recipe.servings}</p>
          
          {recipe.healthNotes && (
            <div className="mb-6 p-4 bg-green-50/80 dark:bg-green-900/50 border-l-4 border-green-500 rounded-r-lg">
                <h4 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">{t('healthyChanges')}</h4>
                <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-green-300">
                    {recipe.healthNotes.map((note, i) => <li key={i}>{note}</li>)}
                </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-2 border-b-2 border-primary-500 pb-1">{t('instructions')}</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-2 border-b-2 border-primary-500 pb-1">{t('ingredientsPriceCheck')}</h4>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="p-3 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                    <div className="font-semibold">{ing.name} <span className="font-normal text-gray-500 dark:text-gray-400">- {ing.quantity}</span></div>
                    <div className="text-sm flex justify-between mt-1">
                      <span>Walmart: {ing.walmartPrice}</span>
                      <span>Albertsons: {ing.albertsonsPrice}</span>
                    </div>
                    <div className={`mt-1 text-sm font-bold p-1 rounded text-center ${ing.cheaperStore === 'Walmart' ? 'bg-blue-100 text-blue-800' : ing.cheaperStore === 'Albertsons' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {t('cheaperAt', { store: ing.cheaperStore })}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Health;
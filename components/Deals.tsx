import React, { useState } from 'react';
import { searchDeals } from '../services/geminiService';
import { Deal as DealType } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { MagnifyingGlassIcon } from './common/icons';
import { useLocalization } from '../context/localization';
import Chatbot from './Chatbot';

const DealCard: React.FC<{ deal: DealType }> = ({ deal }) => (
    <Card className="flex flex-col">
        <div className="flex-grow">
            {deal.imageUrl && (
                <img src={deal.imageUrl} alt={deal.productName} className="w-full h-40 object-contain rounded-t-lg mb-4 bg-white" onError={(e) => (e.currentTarget.style.display = 'none')} />
            )}
            <h3 className="font-bold text-lg text-gray-800 dark:text-white">{deal.productName}</h3>
            <div className="mt-2">
                <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">{deal.salePrice}</p>
                {deal.regularPrice && <p className="text-sm text-gray-500 dark:text-gray-400 line-through">Was {deal.regularPrice}</p>}
            </div>
        </div>
        <p className={`mt-4 font-semibold text-sm self-start px-2 py-1 rounded ${deal.store === 'Walmart' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
            {deal.store}
        </p>
    </Card>
);

const Deals: React.FC = () => {
    const [query, setQuery] = useState('');
    const [deals, setDeals] = useState<DealType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const { t } = useLocalization();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        const locationData = localStorage.getItem('userLocation');
        if (!locationData) {
            setError("Please set your location in your profile settings first.");
            return;
        }
        let locationString = '';
        try {
            const parsedLocation = JSON.parse(locationData);
            locationString = parsedLocation.zip || `${parsedLocation.latitude}, ${parsedLocation.longitude}`;
        } catch(e) { /* ignore */ }
        
        if (!locationString) {
            setError("Your saved location is invalid. Please set it again.");
            return;
        }
        
        setLoading(true);
        setError(null);
        setDeals([]);
        setHasSearched(true);

        try {
            const results = await searchDeals(query, locationString);
            setDeals(results);
        } catch (err: any) {
            setError(err.message || "An error occurred while fetching deals.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('dealsTitle')}</h2>
                <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
                    {t('dealsSubtitle')}
                </p>
            </div>
            
            <Card>
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t('searchDealsPlaceholder')}
                        className="flex-grow px-4 py-3 bg-white/50 dark:bg-gray-900/50 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 font-semibold text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 transition-colors"
                    >
                        <MagnifyingGlassIcon className="w-5 h-5" />
                        {loading ? t('searching') : t('search')}
                    </button>
                </form>
            </Card>

            {loading && <Spinner />}
            {error && <p className="text-center text-red-500">{error}</p>}
            
            {!loading && deals.length > 0 && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {deals.map((deal, index) => (
                        <DealCard key={index} deal={deal} />
                    ))}
                </div>
            )}

            {hasSearched && !loading && deals.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('noDealsFound', { query })}</p>
            )}

            <div className="pt-8 mt-8 border-t-2 border-gray-200/50 dark:border-gray-700/50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('savvyAssistantTitle')}</h2>
                    <p className="mt-1 text-lg text-gray-500 dark:text-gray-400">{t('savvyAssistantSubtitle')}</p>
                </div>
                <div className="max-w-2xl mx-auto mt-6">
                    <Chatbot />
                </div>
            </div>
        </div>
    );
};

export default Deals;
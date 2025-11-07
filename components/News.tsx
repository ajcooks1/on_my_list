import React, { useState, useEffect } from 'react';
import { getFoodNews } from '../services/geminiService';
import { NewsArticle } from '../types';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { useLocalization } from '../context/localization';
import { NewspaperIcon } from './common/icons';

const News: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLocalization();

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      setArticles([]);
      try {
        const result = await getFoodNews();
        setArticles(result);
      } catch (e: any) {
        setError(e.message || 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('newsTitle')}</h2>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          {t('newsSubtitle')}
        </p>
      </div>

      {loading && <Spinner />}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <Card key={index} className="p-0 flex flex-col group hover:shadow-xl">
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex flex-col h-full"
              >
                <div className="relative h-48 w-full overflow-hidden">
                    {article.imageUrl ? (
                        <img 
                            src={article.imageUrl} 
                            alt={article.title} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                const target = e.currentTarget;
                                target.onerror = null; // Prevent infinite loop
                                target.style.display = 'none';
                                const placeholder = target.nextElementSibling;
                                if(placeholder) placeholder.classList.remove('hidden');
                            }}
                        />
                    ) : null}
                     <div className={`w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${article.imageUrl ? 'hidden' : ''}`}>
                        <NewspaperIcon className="w-12 h-12 text-gray-400" />
                    </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-lg font-bold text-primary-600 dark:text-primary-400 group-hover:underline">{article.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">{t('source', { source: article.source })}</p>
                  <p className="text-gray-700 dark:text-gray-300 text-sm flex-grow">{article.summary}</p>
                </div>
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;
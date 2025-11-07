import React, { useState, useEffect } from 'react';
import Card from './common/Card';
import { useLocalization } from '../context/localization';
import { CpuChipIcon, ArrowPathIcon, ShieldCheckIcon, FlagIcon, QuestionMarkCircleIcon } from './common/icons';

const SettingsCard: React.FC = () => {
    const [name, setName] = useState('');
    const [family, setFamily] = useState('');
    const [diet, setDiet] = useState<Record<string, string>>({});
    const [saved, setSaved] = useState(false);
    const { t } = useLocalization();

    const currentPeople = [name, ...family.split(',').map(m => m.trim()).filter(Boolean)].filter(Boolean);

    useEffect(() => {
        const savedName = localStorage.getItem('userName') || '';
        const savedFamily = localStorage.getItem('familyMembers') || '';
        const savedDiet = localStorage.getItem('familyDietaryRestrictions');
        
        setName(savedName);
        setFamily(savedFamily);
        if (savedDiet) {
            try {
                setDiet(JSON.parse(savedDiet));
            } catch(e) {
                console.error("Failed to parse saved diet info", e);
            }
        }
    }, []);

    const handleDietChange = (person: string, value: string) => {
        setDiet(prev => ({...prev, [person]: value}));
    };

    const handleSave = () => {
        localStorage.setItem('userName', name);
        localStorage.setItem('familyMembers', family);

        const updatedDiet: Record<string, string> = {};
        currentPeople.forEach(p => {
            updatedDiet[p] = diet[p] || '';
        });

        localStorage.setItem('familyDietaryRestrictions', JSON.stringify(updatedDiet));
        setDiet(updatedDiet);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <Card>
            <h3 className="text-xl font-bold mb-4 text-primary-600 dark:text-primary-400">{t('settings')}</h3>
            <div className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('yourName')}</label>
                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} placeholder={t('namePlaceholder')} className="mt-1 w-full p-2 bg-white/50 dark:bg-gray-900/50 placeholder-gray-500 dark:placeholder-gray-400 rounded-md border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"/>
            </div>
            <div>
                <label htmlFor="family" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('whoIsInHousehold')}</label>
                <input type="text" id="family" value={family} onChange={e => setFamily(e.target.value)} placeholder={t('familyPlaceholder')} className="mt-1 w-full p-2 bg-white/50 dark:bg-gray-900/50 placeholder-gray-500 dark:placeholder-gray-400 rounded-md border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"/>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('commaSeparated')}</p>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('anyDietaryRestrictions')}</label>
                <div className="mt-2 space-y-3 p-3 bg-white/20 dark:bg-gray-900/30 rounded-lg max-h-40 overflow-y-auto">
                    {currentPeople.length > 0 ? currentPeople.map(person => (
                        <div key={person}>
                            <label htmlFor={`diet-${person}`} className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                                {t('dietaryNeedsFor', { name: person })}
                            </label>
                            <input
                                id={`diet-${person}`}
                                value={diet[person] || ''}
                                onChange={(e) => handleDietChange(person, e.target.value)}
                                placeholder={t('dietaryPlaceholder')}
                                className="mt-1 w-full p-2 bg-white/80 dark:bg-gray-700/80 rounded-md border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    )) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t('addFamilyNote')}</p>
                    )}
                </div>
            </div>
            <div className="flex justify-end items-center pt-2">
                {saved && <span className="text-sm text-green-600 dark:text-green-400 mr-4">{t('settingsSaved')}</span>}
                <button onClick={handleSave} className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">{t('save')}</button>
            </div>
        </div>
        </Card>
    );
}

const FamilyCard: React.FC = () => {
    const { t } = useLocalization();
    const [people, setPeople] = useState<string[]>([]);
    const [restrictions, setRestrictions] = useState<Record<string, string>>({});

    useEffect(() => {
        const name = localStorage.getItem('userName');
        const familyData = localStorage.getItem('familyMembers');
        const dietData = localStorage.getItem('familyDietaryRestrictions');

        const allPeople: string[] = [];
        if (name) allPeople.push(name);
        if (familyData) {
            allPeople.push(...familyData.split(',').map(m => m.trim()).filter(Boolean));
        }
        setPeople(allPeople);

        if (dietData) {
            try {
                setRestrictions(JSON.parse(dietData));
            } catch (e) { console.error("Failed to parse diet data", e); }
        }
    }, []);

    return (
         <Card>
            <h3 className="text-xl font-bold mb-4 text-primary-600 dark:text-primary-400">{t('myFamily')}</h3>
            {people.length === 0 ? (
                 <p className="text-center text-gray-500 dark:text-gray-400">{t('noFamilyInfo')}</p>
            ) : (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {people.map(person => (
                        <div key={person}>
                            <h4 className="font-semibold text-lg">{person}</h4>
                            <p className="p-3 bg-white/30 dark:bg-gray-900/30 rounded-lg mt-1 whitespace-pre-wrap text-sm">
                                {restrictions[person] || t('noRestrictionsSpecified')}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

const InfoCard: React.FC = () => {
    const { t } = useLocalization();
    const sections = [
        {
            key: 'aiVersion',
            title: t('aiVersion'),
            icon: CpuChipIcon,
            content: (
                <div className="space-y-2 text-sm">
                  <p>You are currently using <span className="font-bold text-primary-500">On My List AI v1.2</span>.</p>
                  <p>This version is powered by <span className="font-semibold">Gemini 2.5 Flash</span>, optimized for speed and accuracy in finding deals, generating recipes, and providing helpful food-related information.</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">We are constantly working to improve our AI. Premium subscribers will get early access to more advanced models in the future.</p>
                </div>
              )
        },
        {
            key: 'updates',
            title: t('appUpdates'),
            icon: ArrowPathIcon,
            content: (
                <ul className="space-y-3 list-disc list-inside text-sm">
                  <li><span className="font-semibold">[Current Version]</span>: Overhauled profile management into a dedicated, user-friendly page.</li>
                  <li>Added user name, family, and dietary restrictions to onboarding and a new settings panel. AI responses are now personalized!</li>
                  <li>Introduced "Savvy" the AI food assistant as a persistent chatbot.</li>
                  <li>Enabled premium users to generate healthy recipe makeovers.</li>
                </ul>
              )
        },
        {
            key: 'privacy',
            title: t('privacy'),
            icon: ShieldCheckIcon,
            content: (
                <div className="space-y-3 text-sm">
                    <p>Your privacy is important to us. We do not store your conversations or personal data on our servers. All profile information (name, family, etc.) is stored locally on your device in your browser's localStorage.</p>
                    <p>All interactions with the Gemini API are handled securely. Your microphone is only accessed for the speech-to-text feature when you explicitly activate it, and the audio is not stored.</p>
                </div>
              )
        },
        {
            key: 'report',
            title: t('reportProblem'),
            icon: FlagIcon,
            content: (
                <div className="text-sm">
                    <p className="mb-2">Found a bug or have a suggestion? We'd love to hear from you. Please send an email to:</p>
                    <a href="mailto:support@savvyshopperai.app" className="font-semibold text-primary-500 hover:underline">support@savvyshopperai.app</a>
                </div>
            )
        },
        {
            key: 'help',
            title: t('help'),
            icon: QuestionMarkCircleIcon,
            content: (
                <div className="space-y-3 text-sm">
                   <h4 className="font-semibold">How do I use the Recipe Finder?</h4>
                   <p>Navigate to the "Health" tab, type the name of a dish, select servings, and our AI will generate a full recipe. If you've added dietary restrictions in your settings, the recipe will be tailored to your needs!</p>
                   <h4 className="font-semibold">Is the deals information accurate?</h4>
                   <p>Our AI uses Google Search in real-time to find the latest deals. However, prices and availability can change quickly, so we recommend confirming with the store.</p>
               </div>
            )
        },
    ];
    
    return (
        <Card className="p-2">
            <div className="space-y-1">
            {sections.map(section => (
                <details key={section.key} className="p-3 rounded-lg hover:bg-gray-50/50 dark:hover:bg-gray-900/50 group" name="info-accordion">
                    <summary className="font-semibold cursor-pointer flex justify-between items-center text-gray-700 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400">
                        <div className="flex items-center gap-3">
                            <section.icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-500 dark:group-hover:text-primary-300 transition-colors" />
                            {section.title}
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transition-transform duration-300 group-open:rotate-180">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                        </svg>
                    </summary>
                    <div className="pt-4 pl-8 text-gray-600 dark:text-gray-300">
                        {section.content}
                    </div>
                </details>
            ))}
            </div>
        </Card>
    );
};

const Profile: React.FC = () => {
    const { t } = useLocalization();
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('profileAndSettings')}</h2>
                <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">{t('profileAndSettingsSubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                <div className="space-y-6">
                    <SettingsCard />
                    <FamilyCard />
                </div>
                <div className="space-y-6 lg:pt-0">
                    <InfoCard />
                </div>
            </div>
        </div>
    );
};

export default Profile;
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de';
type Translations = { [key in Language]: { [key: string]: string } };

const translations: Translations = {
  en: {
    // Onboarding
    welcome: 'Welcome to On My List AI!',
    selectLanguage: 'Please select your language.',
    english: 'English',
    spanish: 'Español (Spanish)',
    french: 'Français (French)',
    german: 'Deutsch (German)',
    findLocalDeals: 'Find Local Deals',
    locationPermission: "To find the best deals near you, we need your location. Please enable location services or enter your zip code.",
    useMyLocation: 'Use My Location',
    or: 'or',
    enterZip: 'Enter 5-digit ZIP code',
    continue: 'Continue',
    locationError: 'Could not get location: {message}. Please try entering your ZIP code.',
    zipError: 'Please enter a valid 5-digit ZIP code.',
    personalize: 'Let\'s Personalize Your Experience',
    getStarted: 'To get started, what should we call you?',
    yourName: 'Your Name',
    namePlaceholder: 'e.g., Alex',
    familyMembers: 'Family Members',
    familyHelp: "To help with recipes and shopping lists, tell us who's in your household.",
    whoIsInHousehold: 'Who is in your household?',
    familyPlaceholder: 'e.g., Jane, Tom, Fido',
    commaSeparated: 'Separate names with a comma.',
    dietaryNeeds: 'Dietary Needs',
    dietaryHelp: 'Any dietary needs or allergies? This will help us suggest better recipes for you.',
    dietaryNeedsFor: 'Dietary needs for {name}',
    dietaryPlaceholder: 'e.g., gluten-free, vegetarian, nut allergy',
    allSet: "You're all set!",
    readyToSave: "You're ready to start saving time and money on your groceries.",
    startSaving: "Let's Start Saving!",
    
    // Sidebar & Header
    deals: 'Deals',
    shoppingLists: 'Shopping Lists',
    health: 'Health',
    news: 'News',
    subscription: 'Subscription',
    profile: 'Profile',
    donate: 'Donate',

    // Deals Page
    dealsTitle: 'Find Today\'s Best Deals',
    dealsSubtitle: 'Search for any item to find the latest discounts at Walmart and Albertsons.',
    searchDealsPlaceholder: 'e.g., "coffee", "laundry detergent", "organic apples"...',
    search: 'Search',
    searching: 'Searching...',
    noDealsFound: 'No deals found for "{query}". Try another search!',
    savvyAssistantTitle: 'Your Savvy Assistant',
    savvyAssistantSubtitle: 'Ask for recipe ideas, cooking tips, or nutrition facts.',
    
    // Shopping List Page
    shoppingListTitle: 'Your Shopping Lists',
    shoppingListSubtitle: 'Create, manage, and find deals for your grocery lists.',
    listEmpty: "Your list is empty. Add items below!",
    typeOrSpeak: 'Type or paste your list here, or use the mic to speak...',
    addItems: 'Add Items',
    findDeals: 'Ready to Save?',
    comparePrices: 'Compare Prices',
    createNewList: 'Create a New List',
    listName: 'List Name',
    listNamePlaceholder: 'e.g., Weekly Groceries, Party Supplies',
    cancel: 'Cancel',
    createList: 'Create List',
    addAnotherList: 'Add Another List',
    speechError: 'Speech recognition error: {error}',
    capture: 'Capture Image',

    // Price Comparison Modal
    priceComparison: 'Price Comparison for',
    totalCost: 'Estimated Total',
    itsATie: "It's a tie!",
    cheaperBy: '{winner} is cheaper by ${difference}!',
    totalsDisclaimer: "Totals are based on available deals for items on your list and may not include all items.",
    
    // Health Page
    healthyRecipeTitle: "Healthy Recipe Makeover",
    healthyRecipeSubtitle: "Turn any dish into a healthier, delicious meal and compare ingredient prices.",
    servings: 'Servings',
    getHealthyRecipe: 'Get Healthy Recipe',
    validatingDish: 'Validating dish...',
    creatingHealthyRecipe: 'Creating healthy recipe...',
    premiumFeature: 'This is a Premium Feature!',
    premiumFeatureDesc: 'Unlock the Healthy Recipe Makeover and other advanced tools by subscribing to an On My List AI plan.',
    viewSubscriptionPlans: 'View Subscription Plans',
    healthyChanges: "Healthy Changes We've Made",
    instructions: 'Instructions',
    ingredientsPriceCheck: 'Ingredients & Price Check',
    cheaperAt: 'Cheaper at {store}',
    
    // News Page
    newsTitle: 'Food & Grocery News',
    newsSubtitle: "Stay updated with the latest trends, recalls, and news in the food world.",
    source: 'Source: {source}',
    readMore: 'Read Full Article',
    
    // Subscription Page
    choosePlan: 'Choose Your Plan',
    choosePlanSubtitle: 'Unlock premium features and get the most out of On My List AI.',
    bestValue: 'Best Value',
    perMonth: '/ month',
    perYear: '/ year',
    choose: 'Choose {plan}',
    subscribedMessage: "You're a Premium Member!",
    subscribedThanks: 'Thank you for subscribing to the {plan} plan.',

    // Chatbot
    initialGreeting: "Hi! I'm Savvy, your AI food assistant. How can I help you today? You can ask me for recipe ideas, cooking tips, or nutrition facts.",
    foodAssistant: 'Savvy Food Assistant',
    closeChat: 'Close chat',
    askMeAnything: 'Ask me anything...',
    sendMessage: 'Send message',
    
    // Profile
    mySubscription: 'My Subscription',
    myFamily: 'My Family',
    aiVersion: 'AI Version',
    appUpdates: 'App Updates',
    privacy: 'Privacy',
    settings: 'Settings',
    reportProblem: 'Report a Problem',
    help: 'Help',
    noFamilyInfo: "You haven't added any family members yet. Go to Settings to add them!",
    noRestrictionsSpecified: 'No restrictions specified.',
    anyDietaryRestrictions: 'Any dietary restrictions?',
    addFamilyNote: 'Add yourself and family members to specify dietary needs.',
    settingsSaved: 'Settings Saved!',
    save: 'Save',
    profileAndSettings: 'Profile & Settings',
    profileAndSettingsSubtitle: 'Manage your family information, preferences, and app settings.'
  },
  es: {},
  fr: {},
  de: {}
};

interface LocalizationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const savedLang = localStorage.getItem('userLanguage');
        return (savedLang && ['en', 'es', 'fr', 'de'].includes(savedLang) ? savedLang : 'en') as Language;
    });

    useEffect(() => {
        localStorage.setItem('userLanguage', language);
    }, [language]);

    const setLanguage = (lang: Language) => {
        if (['en', 'es', 'fr', 'de'].includes(lang)) {
            setLanguageState(lang);
        }
    };

    const t = (key: string, replacements?: { [key: string]: string | number }): string => {
        const langTyped = language as keyof typeof translations;
        let translation = (translations[langTyped] && translations[langTyped][key]) || translations.en[key] || key;
        
        if (replacements) {
            Object.entries(replacements).forEach(([placeholder, value]) => {
                translation = translation.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
            });
        }
        return translation;
    };

    return (
        <LocalizationContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useLocalization = (): LocalizationContextType => {
    const context = useContext(LocalizationContext);
    if (!context) {
        // FIX: Corrected a typo `new new Error` to `new Error` to resolve a "not constructable" error.
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};
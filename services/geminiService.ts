
import { GoogleGenAI, Type } from '@google/genai';
import { Deal, NewsArticle, Recipe } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable is not set. Gemini API calls will fail.");
}

// @ts-ignore
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const parseJsonFromResponse = (text: string) => {
    const cleanedText = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    return JSON.parse(cleanedText);
}

// For ShoppingList
export const processListInput = async (args: { text?: string; image?: { mimeType: string; data: string } }): Promise<string[]> => {
  const { text, image } = args;
  
  if (!text && !image) {
    throw new Error('Either text or image must be provided.');
  }

  const model = 'gemini-2.5-flash';
  
  const contents = { parts: [] as any[] };
  if (text) {
    contents.parts.push({
      text: `Extract each item from this shopping list. If there are quantities, include them with the item. Output only a comma-separated list of the items. Input: ${text}`,
    });
  }
  if (image) {
    contents.parts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.data,
      },
    });
    contents.parts.push({
        text: `List all grocery items visible in this image as a comma-separated list.`
    });
  }
  
  const response = await ai.models.generateContent({ model, contents });
  const resultText = response.text.trim();
  return resultText.split(',').map(item => item.trim()).filter(Boolean);
};

export const categorizeAndCorrectItems = async (items: string[]): Promise<{ itemName: string; category: string }[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Given this list of grocery items: [${items.join(', ')}].
    Please correct any spelling mistakes and categorize each item.
    Possible categories are: "Produce", "Meat & Seafood", "Dairy & Eggs", "Bakery & Bread", "Pantry Staples", "Frozen Foods", "Beverages", "Household", "Health & Beauty", "Baby", "Pets", "Other".`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        itemName: { type: Type.STRING },
                        category: { type: Type.STRING }
                    },
                    required: ['itemName', 'category']
                }
            }
        }
    });

    try {
        return parseJsonFromResponse(response.text);
    } catch (e) {
        console.error("Failed to parse categorization response:", response.text);
        return items.map(itemName => ({ itemName, category: 'Other' }));
    }
};

export const getDealsForShoppingList = async (items: string[], store: 'Walmart' | 'Albertsons', location: string): Promise<{ deals: Deal[] }> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Find the best current deals for the following items at ${store} near ${location}: [${items.join(', ')}].
    Respond with ONLY a JSON object containing a "deals" key, which is an array of objects.
    Each object in the array should represent a deal and have "productName" and "salePrice" keys.
    If you can't find a deal for an item, omit it from the array.
    Example response: {"deals": [{"productName": "Example Item", "salePrice": "$2.99"}]}`;
    
     const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    try {
        const parsed = parseJsonFromResponse(response.text);
        if (parsed.deals && Array.isArray(parsed.deals)) {
            parsed.deals.forEach((deal: any) => deal.store = store);
        }
        return parsed;
    } catch (e) {
        console.error(`Failed to parse deals JSON for ${store}:`, response.text);
        return { deals: [] };
    }
};

// For Deals Tab
export const searchDeals = async (query: string, location: string): Promise<Deal[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Find current deals for "${query}" at both Walmart and Albertsons near ${location}.
    Respond with ONLY a JSON object containing a "deals" key, which is an array of deal objects.
    Each deal object must have "productName", "salePrice", "store" ('Walmart' or 'Albertsons'), "regularPrice" (if available), and "imageUrl" (if available).
    If no deals are found, return an empty array.
    Example response: {"deals": [{"productName": "Tide Pods", "salePrice": "$12.99", "regularPrice": "$15.99", "store": "Walmart", "imageUrl": "http://example.com/image.png"}]}`;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    try {
        const parsed = parseJsonFromResponse(response.text);
        return parsed.deals || [];
    } catch (e) {
        console.error(`Failed to parse deals JSON for query "${query}":`, response.text);
        return [];
    }
};


// For Health
export const validateDish = async (dish: string): Promise<{ isValid: boolean; reason?: string; correctedDish?: string }> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Is "${dish}" a valid food dish? Respond in JSON format.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    isValid: { type: Type.BOOLEAN },
                    reason: { type: Type.STRING, description: "Reason why it's not a valid dish, if applicable." },
                    correctedDish: { type: Type.STRING, description: "A corrected or more specific name for the dish, if applicable." }
                },
                required: ['isValid']
            }
        }
    });

    return parseJsonFromResponse(response.text);
};


export const generateHealthyRecipe = async (dish: string, servings: number): Promise<Recipe> => {
    const model = 'gemini-2.5-flash';
    const locationData = localStorage.getItem('userLocation');
    const dietData = localStorage.getItem('familyDietaryRestrictions');
    let locationString = 'my area';
    if (locationData) {
        try {
            const parsed = JSON.parse(locationData);
            locationString = parsed.zip || `${parsed.latitude}, ${parsed.longitude}`;
        } catch (e) { /* ignore */ }
    }
    const dietString = dietData ? `Keep in mind these dietary restrictions: ${dietData}` : '';

    const prompt = `Create a healthy version of the recipe for "${dish}". The recipe should be for ${servings} servings.
    ${dietString}
    Provide a list of healthy changes made. For each ingredient, find the current price at Walmart and Albertsons near ${locationString}. Indicate which store is cheaper for each ingredient.
    Respond with ONLY a JSON object with the following keys: "recipeName", "servings", "healthNotes" (array of strings), "instructions" (array of strings), and "ingredients" (array of objects).
    Each ingredient object should have: "name", "quantity", "walmartPrice", "albertsonsPrice", and "cheaperStore" ("Walmart", "Albertsons", "Tie", or "N/A").
    `;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    return parseJsonFromResponse(response.text);
};


// For News
export const getFoodNews = async (): Promise<NewsArticle[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = `Find 5 recent and interesting news articles related to food, groceries, or nutrition.
    Respond with ONLY a JSON array of objects. Each object should have "title", "summary", "source", "url", and "imageUrl" keys.`;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });

    return parseJsonFromResponse(response.text);
};

// For Chatbot
export const sendChatMessage = async (message: string): Promise<string> => {
    const model = 'gemini-2.5-flash';
    const dietData = localStorage.getItem('familyDietaryRestrictions');
    const dietString = dietData ? `My family has these dietary restrictions: ${dietData}. Please keep this in mind.` : '';

    const response = await ai.models.generateContent({
        model,
        contents: `You are a helpful and friendly food assistant named Savvy. ${dietString} The user's message is: "${message}"`,
    });

    return response.text;
};
import React, { useState, useRef, useEffect } from 'react';
import { processListInput, getDealsForShoppingList, categorizeAndCorrectItems } from '../services/geminiService';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { MicrophoneIcon, UploadIcon, PlusIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon, ArrowDownTrayIcon, CameraIcon } from './common/icons';
import { ShoppingList as ShoppingListType, ShoppingListItem, Deal } from '../types';
import { useLocalization } from '../context/localization';

const SHOPPING_LISTS_KEY = 'shoppingLists';

interface ComparisonResult {
    itemName: string;
    walmartDeal?: Deal;
    albertsonsDeal?: Deal;
    cheaperStore: 'Walmart' | 'Albertsons' | 'Tie' | 'None';
}

interface ListColumnProps {
  list: ShoppingListType;
  itemInput: string;
  onItemInputChange: (value: string) => void;
  onTextSubmit: (e: React.FormEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStartListening: () => void;
  onCameraClick: () => void;
  onCompareDeals: () => void;
  onDownloadList: () => void;
  onDeleteList: () => void;
  onToggleItemChecked: (itemIndex: number) => void;
  isListeningForThisList: boolean;
  isLoading: boolean;
  dealsLoading: boolean;
}
  
const ListColumn: React.FC<ListColumnProps> = ({
    list,
    itemInput,
    onItemInputChange,
    onTextSubmit,
    onFileChange,
    onStartListening,
    onCameraClick,
    onCompareDeals,
    onDownloadList,
    onDeleteList,
    onToggleItemChecked,
    isListeningForThisList,
    isLoading,
    dealsLoading,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { t } = useLocalization();

    const groupedItems = list.items.reduce((acc, item) => {
      const category = item.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, ShoppingListItem[]>);

    const categoryOrder = ["Produce", "Meat & Seafood", "Dairy & Eggs", "Bakery & Bread", "Pantry Staples", "Frozen Foods", "Beverages", "Household", "Health & Beauty", "Baby", "Pets", "Other"];

    const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
        const indexA = categoryOrder.indexOf(a);
        const indexB = categoryOrder.indexOf(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    return (
        <div className="w-full sm:w-96 flex-shrink-0">
        <Card className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold truncate">{list.name}</h3>
                <div className="flex items-center gap-2">
                     <button onClick={onDownloadList} disabled={list.items.length === 0} aria-label="Download list">
                        <ArrowDownTrayIcon className="w-5 h-5 text-gray-400 hover:text-primary-500"/>
                    </button>
                    <button onClick={onDeleteList} aria-label="Delete list">
                        <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
                    </button>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2" style={{maxHeight: '40vh'}}>
                {list.items.length > 0 ? (
                    <div className="space-y-4">
                        {sortedCategories.map(category => (
                            <div key={category}>
                                <h4 className="text-lg font-semibold text-primary-600 dark:text-primary-400 border-b-2 border-gray-200/50 dark:border-gray-700/50 pb-1 mb-2">
                                    {category}
                                </h4>
                                <ul className="space-y-3">
                                    {groupedItems[category].map((item) => {
                                        const originalIndex = list.items.findIndex(originalItem => originalItem === item);
                                        return (
                                            <li key={`${originalIndex}-${item.text}`} className="flex items-center p-2 bg-white/40 dark:bg-white/10 rounded-lg">
                                                <input type="checkbox" checked={item.checked} onChange={() => onToggleItemChecked(originalIndex)} className="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-4 flex-shrink-0" />
                                                <span className={`text-lg ${item.checked ? 'line-through text-gray-500' : ''}`}>{item.text}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">{t('listEmpty')}</p>
                )}
            </div>

            <div className="mt-4 border-t-2 border-gray-100/80 dark:border-gray-700/80 pt-4 space-y-4">
                 <form onSubmit={onTextSubmit}>
                    <textarea
                        value={itemInput}
                        onChange={(e) => onItemInputChange(e.target.value)}
                        placeholder={t('typeOrSpeak')}
                        className="w-full h-24 p-2 bg-white/50 dark:bg-gray-900/50 placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                     <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                        <div className="flex gap-2">
                             <button type="button" onClick={onStartListening} className={`p-2 rounded-full transition-colors duration-200 ${isListeningForThisList ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}><MicrophoneIcon className="w-5 h-5" /></button>
                             <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full"><UploadIcon className="w-5 h-5" /></button>
                             <button type="button" onClick={onCameraClick} className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-full" aria-label="Use camera"><CameraIcon className="w-5 h-5" /></button>
                             <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />
                        </div>
                        <button type="submit" disabled={isLoading || !itemInput.trim()} className="px-4 py-2 font-semibold text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 disabled:bg-primary-300">{t('addItems')}</button>
                    </div>
                 </form>
                 <div className="border-t pt-4">
                    <h4 className="font-semibold text-center mb-2">{t('findDeals')}</h4>
                    <div className="flex justify-center gap-2">
                         <button onClick={onCompareDeals} disabled={dealsLoading || list.items.length === 0} className="w-full flex items-center justify-center gap-2 px-4 py-2 font-semibold text-white bg-primary-600 rounded-lg shadow hover:bg-primary-700 disabled:bg-primary-300">
                            <MagnifyingGlassIcon className="w-5 h-5" /> {t('comparePrices')}
                        </button>
                    </div>
                </div>
            </div>
        </Card>
        </div>
    );
};

const ShoppingList: React.FC = () => {
  const [lists, setLists] = useState<ShoppingListType[]>([]);
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');

  const [itemInputs, setItemInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for the comparison modal
  const [dealsForList, setDealsForList] = useState<ShoppingListType | null>(null);
  const [comparisonResults, setComparisonResults] = useState<ComparisonResult[] | null>(null);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [dealsError, setDealsError] = useState<string | null>(null);
  const [totals, setTotals] = useState<{walmart: number, albertsons: number}>({walmart: 0, albertsons: 0});
  
  const [speechToListId, setSpeechToListId] = useState<string | null>(null);

  // State for camera modal
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [cameraForListId, setCameraForListId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { t } = useLocalization();

  useEffect(() => {
    try {
      const savedLists = localStorage.getItem(SHOPPING_LISTS_KEY);
      if (savedLists) {
        const parsedLists = JSON.parse(savedLists);
        if (Array.isArray(parsedLists) && parsedLists.length > 0) {
          setLists(parsedLists);
        } else {
          createNewList('My First List', true);
        }
      } else {
        createNewList('My First List', true);
      }
    } catch (e) {
      console.error("Failed to parse shopping lists from localStorage", e);
      createNewList('My First List', true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (lists.length > 0) {
      localStorage.setItem(SHOPPING_LISTS_KEY, JSON.stringify(lists));
    } else {
      localStorage.removeItem(SHOPPING_LISTS_KEY);
    }
  }, [lists]);
  
  const handleSpeechResult = (transcript: string) => {
    if (speechToListId) {
        setItemInputs(prev => ({ ...prev, [speechToListId]: transcript }));
    }
  };
  const { isListening, error: speechError, startListening } = useSpeechToText({ onResult: handleSpeechResult });

  const handleStartListening = (listId: string) => {
    setSpeechToListId(listId);
    startListening();
  };

  const createNewList = (name: string, isInitial = false) => {
    const newList: ShoppingListType = {
      id: Date.now().toString(),
      name,
      items: [],
    };
    if (isInitial) {
        setLists([newList]);
    } else {
        setLists(prev => [...prev, newList]);
    }
    setIsCreateListModalOpen(false);
    setNewListName('');
  };

  const handleCreateListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      createNewList(newListName.trim());
    }
  };

  const handleDeleteList = (listId: string) => {
    if (window.confirm("Are you sure you want to delete this list?")) {
      setLists(lists.filter(list => list.id !== listId));
    }
  };
  
  const handleProcessInput = async (args: { text?: string; image?: { mimeType: string; data: string } }, listId: string) => {
    setLoading(true);
    setError(null);
    try {
      const resultItems = await processListInput(args);
      const categorizedResult = await categorizeAndCorrectItems(resultItems);
      
      const newItems: ShoppingListItem[] = categorizedResult.map(item => ({ 
          text: item.itemName, 
          checked: false,
          category: item.category
      }));
      
      setLists(lists.map(list => 
        list.id === listId ? { ...list, items: [...list.items, ...newItems] } : list
      ));
      setItemInputs(prev => ({ ...prev, [listId]: '' }));
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = (e: React.FormEvent, listId: string) => {
    e.preventDefault();
    const textInput = itemInputs[listId] || '';
    if (textInput.trim()) {
      handleProcessInput({ text: textInput }, listId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, listId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const base64Data = result.split(',')[1];
      if (file.type.startsWith('image/')) {
        handleProcessInput({ image: { mimeType: file.type, data: base64Data } }, listId);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset file input
  };

  const toggleItemChecked = (listId: string, itemIndex: number) => {
    setLists(lists.map(list => {
      if (list.id === listId) {
        const newItems = [...list.items];
        newItems[itemIndex].checked = !newItems[itemIndex].checked;
        return { ...list, items: newItems };
      }
      return list;
    }));
  };

  const parsePrice = (priceStr: string | null | undefined): number => {
    if (!priceStr) return Infinity;
    const cleaned = priceStr.replace(/[^0-9.]/g, '');
    const price = parseFloat(cleaned);
    return isNaN(price) ? Infinity : price;
  };

  const handleCompareDeals = async (list: ShoppingListType) => {
    if (!list || list.items.length === 0) {
      setDealsError("This shopping list is empty.");
      return;
    }
    const locationData = localStorage.getItem('userLocation');
    if (!locationData) {
      alert("Please set your location on the Deals page or during onboarding first.");
      return;
    }
    let locationString = '';
    try {
        const parsedLocation = JSON.parse(locationData);
        locationString = parsedLocation.zip || `${parsedLocation.latitude}, ${parsedLocation.longitude}`;
    } catch(e) { /* ignore */ }
    
    if (!locationString) {
        alert("Your saved location is invalid. Please set it again on the Deals page or during onboarding.");
        return;
    }

    setDealsLoading(true);
    setDealsError(null);
    setComparisonResults(null);
    setDealsForList(list);

    try {
      const itemNames = list.items.map(item => item.text);
      const [walmartPromise, albertsonsPromise] = await Promise.all([
        getDealsForShoppingList(itemNames, 'Walmart', locationString),
        getDealsForShoppingList(itemNames, 'Albertsons', locationString)
      ]);

      const walmartDeals = walmartPromise.deals;
      const albertsonsDeals = albertsonsPromise.deals;
      
      let walmartTotal = 0;
      let albertsonsTotal = 0;

      const results: ComparisonResult[] = list.items.map(item => {
        const walmartDeal = walmartDeals.find(d => d.productName.toLowerCase().includes(item.text.toLowerCase()));
        const albertsonsDeal = albertsonsDeals.find(d => d.productName.toLowerCase().includes(item.text.toLowerCase()));

        const walmartPrice = parsePrice(walmartDeal?.salePrice);
        const albertsonsPrice = parsePrice(albertsonsDeal?.salePrice);

        let cheaperStore: ComparisonResult['cheaperStore'] = 'None';
        if (walmartPrice !== Infinity && albertsonsPrice !== Infinity) {
          if (walmartPrice < albertsonsPrice) cheaperStore = 'Walmart';
          else if (albertsonsPrice < walmartPrice) cheaperStore = 'Albertsons';
          else cheaperStore = 'Tie';
        } else if (walmartPrice !== Infinity) {
          cheaperStore = 'Walmart';
        } else if (albertsonsPrice !== Infinity) {
          cheaperStore = 'Albertsons';
        }

        if(walmartPrice !== Infinity) walmartTotal += walmartPrice;
        if(albertsonsPrice !== Infinity) albertsonsTotal += albertsonsPrice;

        return {
          itemName: item.text,
          walmartDeal,
          albertsonsDeal,
          cheaperStore,
        };
      });
      setComparisonResults(results);
      setTotals({ walmart: walmartTotal, albertsons: albertsonsTotal });

    } catch (e: any) {
      setDealsError(e.message || 'An unknown error occurred.');
    } finally {
      setDealsLoading(false);
    }
  };

  const handleDownloadList = (list: ShoppingListType) => {
    if (!list || list.items.length === 0) return;

    const uncheckedItems = list.items.filter(item => !item.checked).map(item => `- ${item.text}`);
    const checkedItems = list.items.filter(item => item.checked).map(item => `- [x] ${item.text}`);
    
    const fileContent = `Shopping List: ${list.name}\n\nTo-Do:\n${uncheckedItems.join('\n')}\n\nCompleted:\n${checkedItems.join('\n')}`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${list.name.replace(/\s+/g, '_').toLowerCase()}_list.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleCameraClick = (listId: string) => {
    setCameraForListId(listId);
    setIsCameraModalOpen(true);
  };

  useEffect(() => {
    const startCamera = async () => {
        if (isCameraModalOpen) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                setError("Could not access the camera. Please check permissions.");
                setIsCameraModalOpen(false);
            }
        }
    };
    startCamera();

    return () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };
  }, [isCameraModalOpen]);

  const handleCaptureImage = () => {
    if (videoRef.current && cameraForListId) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            const base64Data = dataUrl.split(',')[1];
            handleProcessInput({ image: { mimeType: 'image/jpeg', data: base64Data } }, cameraForListId);
        }
        setIsCameraModalOpen(false);
    }
  };

  const renderCameraModal = () => {
    if (!isCameraModalOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col justify-center items-center p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg h-auto rounded-lg shadow-lg mb-4"></video>
            <div className="flex gap-4">
                <button onClick={handleCaptureImage} className="px-6 py-3 font-semibold text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700">{t('capture')}</button>
                <button onClick={() => setIsCameraModalOpen(false)} className="px-6 py-3 font-semibold text-gray-800 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">{t('cancel')}</button>
            </div>
        </div>
    );
  };

  const renderComparisonModal = () => {
    if (!dealsForList) return null;

    let winner = 'Tie';
    if (totals.walmart < totals.albertsons) winner = 'Walmart';
    if (totals.albertsons < totals.walmart) winner = 'Albertsons';
    const difference = Math.abs(totals.walmart - totals.albertsons);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={() => setDealsForList(null)}>
            <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold">{t('priceComparison')} <span className="text-primary-600 dark:text-primary-400">{dealsForList.name}</span></h3>
                    <button onClick={() => setDealsForList(null)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                {dealsLoading && <Spinner />}
                {dealsError && <p className="text-center text-red-500 mb-2">{dealsError}</p>}
                {comparisonResults && (
                    <div className="flex-grow overflow-y-auto pr-2">
                        <table className="w-full text-left table-fixed">
                            <thead>
                                <tr className="border-b-2 border-gray-200/50 dark:border-gray-700/50">
                                    <th className="w-2/5 pb-2">Item</th>
                                    <th className="w-1/4 pb-2 text-center">Walmart</th>
                                    <th className="w-1/4 pb-2 text-center">Albertsons</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonResults.map(item => (
                                    <tr key={item.itemName} className="border-b border-gray-100/80 dark:border-gray-700/80">
                                        <td className="py-3 font-medium truncate pr-2">{item.itemName}</td>
                                        <td className={`py-3 text-center font-bold ${item.cheaperStore === 'Walmart' ? 'text-green-600 bg-green-50/50 dark:bg-green-900/50' : ''}`}>
                                            {item.walmartDeal?.salePrice || 'N/A'}
                                        </td>
                                        <td className={`py-3 text-center font-bold ${item.cheaperStore === 'Albertsons' ? 'text-green-600 bg-green-50/50 dark:bg-green-900/50' : ''}`}>
                                            {item.albertsonsDeal?.salePrice || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-6 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-lg space-y-4">
                            <div>
                                <h4 className="text-xl font-bold text-center mb-2">{t('totalCost')}</h4>
                                <div className="flex justify-around text-center">
                                    <div>
                                        <p className="text-lg font-semibold">Walmart</p>
                                        <p className={`text-3xl font-extrabold ${winner === 'Walmart' ? 'text-green-600' : ''}`}>${totals.walmart.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold">Albertsons</p>
                                        <p className={`text-3xl font-extrabold ${winner === 'Albertsons' ? 'text-green-600' : ''}`}>${totals.albertsons.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center font-bold text-lg p-3 rounded-lg bg-primary-100/80 dark:bg-primary-900/80 text-primary-800 dark:text-primary-200">
                                {winner === 'Tie' ? t('itsATie') : t('cheaperBy', { winner, difference: difference.toFixed(2) })}
                            </div>
                            <p className="text-xs text-center text-gray-400 dark:text-gray-500 pt-2">{t('totalsDisclaimer')}</p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">{t('shoppingListTitle')}</h2>
        <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
          {t('shoppingListSubtitle')}
        </p>
      </div>

       {isCreateListModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={() => setIsCreateListModalOpen(false)}>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-lg shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">{t('createNewList')}</h3>
                <form onSubmit={handleCreateListSubmit}>
                    <label htmlFor="listName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('listName')}</label>
                    <input id="listName" type="text" value={newListName} onChange={(e) => setNewListName(e.target.value)} placeholder={t('listNamePlaceholder')} className="mt-1 w-full p-2 bg-white/50 dark:bg-gray-900/50 placeholder-gray-500 dark:placeholder-gray-400 rounded-md" required />
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={() => setIsCreateListModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">{t('cancel')}</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700">{t('createList')}</button>
                    </div>
                </form>
            </div>
        </div>
      )}
      
      <div className="flex gap-6 pb-4 -mx-4 px-4 overflow-x-auto">
        {lists.map(list => (
            <ListColumn
              key={list.id}
              list={list}
              itemInput={itemInputs[list.id] || ''}
              onItemInputChange={value => setItemInputs(prev => ({ ...prev, [list.id]: value }))}
              onTextSubmit={e => handleTextSubmit(e, list.id)}
              onFileChange={e => handleFileChange(e, list.id)}
              onStartListening={() => handleStartListening(list.id)}
              onCameraClick={() => handleCameraClick(list.id)}
              onCompareDeals={() => handleCompareDeals(list)}
              onDownloadList={() => handleDownloadList(list)}
              onDeleteList={() => handleDeleteList(list.id)}
              onToggleItemChecked={itemIndex => toggleItemChecked(list.id, itemIndex)}
              isListeningForThisList={isListening && speechToListId === list.id}
              isLoading={loading}
              dealsLoading={dealsLoading}
            />
        ))}
        <div className="w-full sm:w-96 flex-shrink-0 flex items-center justify-center">
            <button onClick={() => setIsCreateListModalOpen(true)} className="flex items-center gap-2 px-6 py-4 text-lg font-semibold text-gray-600 dark:text-gray-300 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl hover:bg-gray-200/60 dark:hover:bg-gray-700/60 border-2 border-dashed border-gray-300 dark:border-gray-600 transition-colors">
                <PlusIcon className="w-6 h-6" /> {t('addAnotherList')}
            </button>
        </div>
      </div>

       {loading && <Spinner />}
       {error && <p className="text-center text-red-500">{error}</p>}
       {speechError && <p className="mt-2 text-sm text-center text-red-500">{t('speechError', { error: speechError })}</p>}
      
       {renderComparisonModal()}
       {renderCameraModal()}
    </div>
  );
};

export default ShoppingList;
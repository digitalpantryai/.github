import React, { useState, useEffect } from 'react';
import { Camera, Plus, Calendar, List, ShoppingCart, Trash2, Search, Moon, Sun, Download, Package, Utensils, BarChart3, LogOut, Loader } from 'lucide-react';
import { signUp, signIn, signOut, onAuthChange, savePantryData, loadPantryData, saveProductToDatabase, getProductFromDatabase } from './firebaseHelpers';
import PrivacyPolicy from './PrivacyPolicy';
import Terms from './Terms';

const DigitalPantry = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  const [view, setView] = useState('list');
  const [darkMode, setDarkMode] = useState(false);
  const [pantryItems, setPantryItems] = useState([]);
  const [meals, setMeals] = useState([]);
  const [productDatabase, setProductDatabase] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showMealLog, setShowMealLog] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanningBarcode, setScanningBarcode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [saving, setSaving] = useState(false);
  
  const categories = ['all', 'Dairy', 'Produce', 'Meat', 'Pantry', 'Frozen', 'Beverages', 'Snacks', 'Other'];
  
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: 1,
    unit: 'units',
    expiryDate: '',
    category: 'Other',
    barcode: ''
  });

  const [mealLog, setMealLog] = useState({
    name: '',
    ingredients: []
  });

  // Check auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Load user's pantry data
        const result = await loadPantryData(user.uid);
        if (result.success && result.data) {
          setPantryItems(result.data.items || []);
          setMeals(result.data.meals || []);
          setProductDatabase(result.data.productDatabase || []);
        }
      } else {
        setCurrentUser(null);
        setIsAuthenticated(false);
        setPantryItems([]);
        setMeals([]);
        setProductDatabase([]);
      }
      setInitialLoading(false);
    });

    const theme = localStorage.getItem('darkMode');
    if (theme) setDarkMode(theme === 'true');

    return () => unsubscribe();
  }, []);

  // Save data to Firebase whenever it changes
  useEffect(() => {
    if (currentUser && isAuthenticated && !initialLoading) {
      const saveData = async () => {
        setSaving(true);
        await savePantryData(currentUser.uid, pantryItems, meals, productDatabase);
        setSaving(false);
      };
      
      const timeoutId = setTimeout(saveData, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [pantryItems, meals, productDatabase, currentUser, isAuthenticated, initialLoading]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogin = async () => {
    setAuthError('');
    setAuthLoading(true);
    
    const result = await signIn(loginEmail, loginPassword);
    
    if (result.success) {
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setAuthError(result.error || 'Login failed');
    }
    
    setAuthLoading(false);
  };

  const handleSignup = async () => {
    if (!signupName || !signupEmail || !signupPassword) {
      setAuthError('Please fill in all fields');
      return;
    }
    
    if (signupPassword.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }
    
    setAuthError('');
    setAuthLoading(true);
    
    const result = await signUp(signupEmail, signupPassword, signupName);
    
    if (result.success) {
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
    } else {
      setAuthError(result.error || 'Signup failed');
    }
    
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
  };

  const addPantryItem = () => {
    if (!newItem.name) return;
    
    const item = {
      id: Date.now(),
      name: newItem.name,
      quantity: newItem.quantity,
      unit: newItem.unit,
      expiryDate: newItem.expiryDate,
      category: newItem.category,
      barcode: newItem.barcode,
      addedDate: new Date().toISOString()
    };
    
    setPantryItems([...pantryItems, item]);
    setNewItem({ name: '', quantity: 1, unit: 'units', expiryDate: '', category: 'Other', barcode: '' });
    setShowAddItem(false);
  };

  const deletePantryItem = (id) => {
    setPantryItems(pantryItems.filter(item => item.id !== id));
  };

  const logMeal = () => {
    if (!mealLog.name || mealLog.ingredients.length === 0) return;

    const meal = {
      id: Date.now(),
      name: mealLog.name,
      ingredients: mealLog.ingredients,
      date: new Date().toISOString()
    };

    const updatedPantry = pantryItems.map(item => {
      const usedIngredient = mealLog.ingredients.find(ing => ing.itemId === item.id);
      if (usedIngredient) {
        return {
          ...item,
          quantity: Math.max(0, item.quantity - usedIngredient.amount)
        };
      }
      return item;
    });

    setPantryItems(updatedPantry);
    setMeals([...meals, meal]);
    setMealLog({ name: '', ingredients: [] });
    setShowMealLog(false);
  };

  const addIngredientToMeal = (itemId, amount) => {
    const ingredient = { itemId: itemId, amount: amount };
    setMealLog({
      name: mealLog.name,
      ingredients: [...mealLog.ingredients, ingredient]
    });
  };

  const scanBarcode = async (barcode) => {
    if (!barcode) return;
    
    setScanningBarcode(true);
    
    // Check Firebase shared product database first
    const firebaseResult = await getProductFromDatabase(barcode);
    if (firebaseResult.success && firebaseResult.product) {
      setNewItem({
        name: firebaseResult.product.name,
        quantity: newItem.quantity,
        unit: newItem.unit,
        expiryDate: newItem.expiryDate,
        category: firebaseResult.product.category || 'Other',
        barcode: barcode
      });
      setShowScanner(false);
      setScanningBarcode(false);
      return;
    }
    
    // Check local database
    const localProduct = productDatabase.find(p => p.barcode === barcode);
    if (localProduct) {
      setNewItem({
        name: localProduct.name,
        quantity: newItem.quantity,
        unit: newItem.unit,
        expiryDate: newItem.expiryDate,
        category: localProduct.category || 'Other',
        barcode: barcode
      });
      setShowScanner(false);
      setScanningBarcode(false);
      return;
    }
    
    // Try Open Food Facts API
    try {
      const response = await fetch('https://world.openfoodfacts.org/api/v0/product/' + barcode + '.json');
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const productName = data.product.product_name || 'Unknown Product';
        
        const newProduct = {
          barcode: barcode,
          name: productName,
          category: 'Other',
          addedDate: new Date().toISOString()
        };
        
        // Save to both local and Firebase
        setProductDatabase([...productDatabase, newProduct]);
        await saveProductToDatabase(newProduct);
        
        setNewItem({
          name: productName,
          quantity: newItem.quantity,
          unit: newItem.unit,
          expiryDate: newItem.expiryDate,
          category: 'Other',
          barcode: barcode
        });
        setShowScanner(false);
      } else {
        const manualProduct = prompt('Product not found. Enter product name:');
        if (manualProduct) {
          const newProduct = {
            barcode: barcode,
            name: manualProduct,
            category: 'Other',
            addedDate: new Date().toISOString()
          };
          setProductDatabase([...productDatabase, newProduct]);
          await saveProductToDatabase(newProduct);
          
          setNewItem({
            name: manualProduct,
            quantity: newItem.quantity,
            unit: newItem.unit,
            expiryDate: newItem.expiryDate,
            category: 'Other',
            barcode: barcode
          });
        }
        setShowScanner(false);
      }
    } catch (error) {
      console.error('Barcode error:', error);
      alert('Could not lookup barcode');
      setShowScanner(false);
    }
    
    setScanningBarcode(false);
  };

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getExpiryColor = (days, isDark) => {
    if (days === null) return isDark ? 'text-gray-400' : 'text-gray-500';
    if (days < 0) return 'text-red-500 font-semibold';
    if (days === 0) return 'text-red-400 font-semibold';
    if (days === 1) return 'text-orange-500 font-medium';
    if (days <= 3) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    if (days <= 7) return isDark ? 'text-yellow-300' : 'text-yellow-500';
    return isDark ? 'text-emerald-400' : 'text-emerald-600';
  };

  const filteredItems = pantryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const daysA = getDaysUntilExpiry(a.expiryDate);
    const daysB = getDaysUntilExpiry(b.expiryDate);
    
    if (daysA === null && daysB === null) return 0;
    if (daysA === null) return 1;
    if (daysB === null) return -1;
    return daysA - daysB;
  });

  const groupByDate = () => {
    const grouped = {};
    filteredItems.forEach(item => {
      if (item.expiryDate) {
        const date = new Date(item.expiryDate).toLocaleDateString();
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
      }
    });
    return grouped;
  };

  const lowStockCount = pantryItems.filter(item => item.quantity < 2).length;
  const expiringCount = pantryItems.filter(item => {
    const days = getDaysUntilExpiry(item.expiryDate);
    return days !== null && days <= 3;
  }).length;

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50';
  const cardClass = darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-100';
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const inputClass = darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200';

  // Loading screen
  if (initialLoading) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center`}>
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-indigo-500" size={48} />
          <p className={textClass}>Loading...</p>
        </div>
      </div>
    );
  }

  // Privacy/Terms screens
  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} darkMode={darkMode} />;
  }

  if (showTerms) {
    return <Terms onBack={() => setShowTerms(false)} darkMode={darkMode} />;
  }

  // Login/Signup screen
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
        <div className={`${cardClass} rounded-3xl shadow-2xl p-8 max-w-md w-full`}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-4">
              <Package className="text-white" size={40} />
            </div>
            <h1 className={`text-4xl font-bold ${textClass} mb-2`}>Pantry</h1>
            <p className={mutedClass}>Smart inventory management</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm">
              {authError}
            </div>
          )}

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setShowLogin(true); setAuthError(''); }}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                showLogin
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setShowLogin(false); setAuthError(''); }}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                !showLogin
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {showLogin ? (
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !authLoading && handleLogin()}
                disabled={authLoading}
              />
              <input
                type="password"
                placeholder="Password"
                className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !authLoading && handleLogin()}
                disabled={authLoading}
              />
              <button
                onClick={handleLogin}
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-4 rounded-xl hover:shadow-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authLoading ? <><Loader className="animate-spin" size={20} /> Logging in...</> : 'Login'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                disabled={authLoading}
              />
              <input
                type="email"
                placeholder="Email"
                className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                disabled={authLoading}
              />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !authLoading && handleSignup()}
                disabled={authLoading}
              />
              <button
                onClick={handleSignup}
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-4 rounded-xl hover:shadow-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {authLoading ? <><Loader className="animate-spin" size={20} /> Creating account...</> : 'Create Account'}
              </button>
            </div>
          )}

          <div className="mt-6 text-center space-x-4">
            <button 
              onClick={() => setShowPrivacy(true)} 
              className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-500'} hover:underline`}
            >
              Privacy Policy
            </button>
            <span className={`text-xs ${mutedClass}`}>•</span>
            <button 
              onClick={() => setShowTerms(true)} 
              className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-500'} hover:underline`}
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    );
  }
  // Main App (authenticated user)
  return (
    <div className={`min-h-screen ${bgClass} p-4`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className={`${cardClass} rounded-3xl shadow-xl p-6 mb-6`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Package className="text-white" size={28} />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${textClass}`}>Pantry</h1>
                <p className={`text-sm ${mutedClass}`}>Welcome, {currentUser?.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {saving && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-100 text-green-700">
                  <Loader className="animate-spin" size={16} />
                  <span className="text-xs">Saving...</span>
                </div>
              )}
              <button
                onClick={() => setShowStats(!showStats)}
                className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
              >
                <BarChart3 className={mutedClass} size={20} />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
              >
                {darkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className={mutedClass} size={20} />}
              </button>
              <button
                onClick={handleLogout}
                className="p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-blue-500/20' : 'bg-blue-50'} transition-all hover:scale-105`}>
              <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{pantryItems.length}</p>
              <p className={`text-xs ${mutedClass}`}>Total Items</p>
            </div>
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-orange-500/20' : 'bg-orange-50'} transition-all hover:scale-105`}>
              <p className={`text-3xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{expiringCount}</p>
              <p className={`text-xs ${mutedClass}`}>Expiring Soon</p>
            </div>
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-purple-500/20' : 'bg-purple-50'} transition-all hover:scale-105`}>
              <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{productDatabase.length}</p>
              <p className={`text-xs ${mutedClass}`}>Products Saved</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowAddItem(!showAddItem)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} /> Add Item
            </button>
            <button
              onClick={() => setShowMealLog(!showMealLog)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Utensils size={20} /> Log Meal
            </button>
          </div>
        </div>

        {/* Add Item Form */}
        {showAddItem && (
          <div className={`${cardClass} rounded-3xl shadow-xl p-6 mb-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${textClass}`}>Add New Item</h2>
            
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="w-full mb-4 flex items-center justify-center gap-2 bg-purple-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-600 transition-all"
            >
              <Camera size={20} /> {showScanner ? 'Close Scanner' : 'Scan Barcode'}
            </button>

            {showScanner && (
              <div className={`mb-4 p-4 rounded-xl ${darkMode ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter barcode number"
                    className={`flex-1 p-3 border rounded-xl ${inputClass}`}
                    disabled={scanningBarcode}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        scanBarcode(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousSibling;
                      if (input.value) {
                        scanBarcode(input.value);
                        input.value = '';
                      }
                    }}
                    disabled={scanningBarcode}
                    className="px-5 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50"
                  >
                    {scanningBarcode ? 'Looking up...' : 'Lookup'}
                  </button>
                </div>
                <p className={`text-xs ${mutedClass} mt-2`}>Database: {productDatabase.length} products saved</p>
              </div>
            )}
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Item name"
                className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Quantity"
                  className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})}
                />
                <select
                  className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                >
                  <option value="units">units</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="L">L</option>
                  <option value="ml">ml</option>
                  <option value="pieces">pieces</option>
                </select>
              </div>
              <select
                className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              >
                {categories.filter(c => c !== 'all').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div>
                <label className={`block text-sm font-medium mb-2 ${mutedClass}`}>Expiry Date (optional)</label>
                <input
                  type="date"
                  className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                  value={newItem.expiryDate}
                  onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                />
              </div>
              <button
                onClick={addPantryItem}
                className="w-full bg-indigo-500 text-white py-4 rounded-xl font-semibold hover:bg-indigo-600 transition-all"
              >
                Add to Pantry
              </button>
            </div>
          </div>
        )}

        {/* Meal Log Form */}
        {showMealLog && (
          <div className={`${cardClass} rounded-3xl shadow-xl p-6 mb-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${textClass}`}>Log a Meal</h2>
            <input
              type="text"
              placeholder="Meal name"
              className={`w-full p-4 border rounded-xl mb-4 ${inputClass} focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
              value={mealLog.name}
              onChange={(e) => setMealLog({...mealLog, name: e.target.value})}
            />
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {pantryItems.filter(item => item.quantity > 0).map(item => (
                <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <span className={`flex-1 ${textClass}`}>{item.name} ({item.quantity} {item.unit})</span>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Amount"
                    className={`w-20 p-2 border rounded-lg ${inputClass}`}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const amount = parseFloat(e.target.value);
                        if (amount > 0) {
                          addIngredientToMeal(item.id, amount);
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                </div>
              ))}
            </div>
            {mealLog.ingredients.length > 0 && (
              <div className={`mb-4 p-4 rounded-xl ${darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                <p className={`text-sm font-semibold mb-2 ${textClass}`}>Ingredients added:</p>
                {mealLog.ingredients.map((ing, idx) => {
                  const item = pantryItems.find(i => i.id === ing.itemId);
                  return (
                    <p key={idx} className={`text-sm ${mutedClass}`}>• {ing.amount} {item?.unit} {item?.name}</p>
                  );
                })}
              </div>
            )}
            <button
              onClick={logMeal}
              className="w-full bg-emerald-500 text-white py-4 rounded-xl font-semibold hover:bg-emerald-600 transition-all"
            >
              Log Meal
            </button>
          </div>
        )}

        {/* Search & Filter */}
        <div className={`${cardClass} rounded-xl p-4 mb-4`}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${mutedClass}`} size={20} />
              <input
                type="text"
                placeholder="Search..."
                className={`w-full pl-10 p-3 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className={`p-3 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All' : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              view === 'list' 
                ? 'bg-indigo-500 text-white shadow-lg' 
                : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
            }`}
          >
            <List size={20} /> List
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              view === 'calendar' 
                ? 'bg-indigo-500 text-white shadow-lg' 
                : darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'
            }`}
          >
            <Calendar size={20} /> Calendar
          </button>
        </div>

        {/* List View */}
        {view === 'list' && (
          <div className={`${cardClass} rounded-3xl shadow-xl p-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${textClass}`}>Your Pantry ({sortedItems.length} items)</h2>
            {sortedItems.length === 0 ? (
              <div className="text-center py-16">
                <Package className={`mx-auto mb-4 ${mutedClass}`} size={64} />
                <p className={mutedClass}>No items yet. Add some to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedItems.map(item => {
                  const days = getDaysUntilExpiry(item.expiryDate);
                  return (
                    <div 
                      key={item.id} 
                      className={`group flex items-center justify-between p-4 border rounded-2xl transition-all hover:shadow-md ${
                        darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <p className={`font-semibold ${textClass}`}>{item.name}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className={`text-sm ${mutedClass}`}>
                            {item.quantity} {item.unit}
                          </p>
                          {item.expiryDate && (
                            <p className={`text-sm ${getExpiryColor(days, darkMode)}`}>
                              {days < 0 ? `Expired ${Math.abs(days)} days ago` :
                               days === 0 ? 'Expires today!' :
                               days === 1 ? 'Expires tomorrow' :
                               `Expires in ${days} days`}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deletePantryItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 p-2 rounded-xl transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className={`${cardClass} rounded-3xl shadow-xl p-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${textClass}`}>Expiry Calendar</h2>
            {Object.keys(groupByDate()).length === 0 ? (
              <div className="text-center py-16">
                <Calendar className={`mx-auto mb-4 ${mutedClass}`} size={64} />
                <p className={mutedClass}>No expiry dates set</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupByDate())
                  .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                  .map(([date, items]) => {
                    const days = getDaysUntilExpiry(items[0].expiryDate);
                    return (
                      <div key={date} className={`border rounded-2xl p-5 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h3 className={`font-bold text-lg mb-3 ${getExpiryColor(days, darkMode)}`}>
                          {date}
                          {days !== null && (
                            <span className="ml-3 text-sm font-medium">
                              ({days < 0 ? `${Math.abs(days)} days ago` :
                                days === 0 ? 'Today' :
                                days === 1 ? 'Tomorrow' :
                                `in ${days} days`})
                            </span>
                          )}
                        </h3>
                        <div className="space-y-2">
                          {items.map(item => (
                            <div key={item.id} className={`flex justify-between p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                              <span className={textClass}>{item.name}</span>
                              <span className={mutedClass}>{item.quantity} {item.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Recent Meals */}
        {meals.length > 0 && (
          <div className={`${cardClass} rounded-3xl shadow-xl p-6 mt-6`}>
            <h2 className={`text-2xl font-bold mb-4 ${textClass}`}>Recent Meals</h2>
            <div className="space-y-3">
              {meals.slice(-10).reverse().map(meal => (
                <div key={meal.id} className={`p-4 border rounded-2xl ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex justify-between mb-2">
                    <p className={`font-semibold ${textClass}`}>{meal.name}</p>
                    <p className={`text-sm ${mutedClass}`}>{new Date(meal.date).toLocaleDateString()}</p>
                  </div>
                  <p className={`text-sm ${mutedClass}`}>
                    {meal.ingredients.map(ing => {
                      const item = pantryItems.find(i => i.id === ing.itemId);
                      return item ? `${ing.amount} ${item.unit} ${item.name}` : '';
                    }).filter(Boolean).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalPantry;

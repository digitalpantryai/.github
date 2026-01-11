import React, { useState, useEffect } from 'react';
import { Camera, Plus, Calendar, List, ShoppingCart, Trash2, CheckCircle, Search, Moon, Sun, Download, Package, Utensils, BarChart3, LogOut } from 'lucide-react';

const DigitalPantry = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  const [view, setView] = useState('list');
  const [darkMode, setDarkMode] = useState(false);
  const [pantryItems, setPantryItems] = useState([]);
  const [meals, setMeals] = useState([]);
  const [productDatabase, setProductDatabase] = useState([]);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showMealLog, setShowMealLog] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanningBarcode, setScanningBarcode] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
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

  // Check if user is logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      loadUserData(JSON.parse(savedUser).email);
    }
    const theme = localStorage.getItem('darkMode');
    if (theme) setDarkMode(theme === 'true');
  }, []);

  // Load user-specific data
  const loadUserData = (userEmail) => {
    const userDataKey = `pantryData_${userEmail}`;
    const stored = localStorage.getItem(userDataKey);
    if (stored) {
      const data = JSON.parse(stored);
      setPantryItems(data.items || []);
      setMeals(data.meals || []);
      setProductDatabase(data.productDatabase || []);
    }
  };

  // Save user-specific data
  useEffect(() => {
    if (currentUser) {
      const userDataKey = `pantryData_${currentUser.email}`;
      localStorage.setItem(userDataKey, JSON.stringify({
        items: pantryItems,
        meals: meals,
        productDatabase: productDatabase
      }));
    }
  }, [pantryItems, meals, productDatabase, currentUser]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Authentication functions
  const handleLogin = () => {
    const usersKey = 'pantryUsers';
    const users = JSON.parse(localStorage.getItem(usersKey) || '[]');
    const user = users.find(u => u.email === loginEmail && u.password === loginPassword);
    
    if (user) {
      const userObj = { name: user.name, email: user.email };
      setCurrentUser(userObj);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userObj));
      loadUserData(user.email);
      setLoginEmail('');
      setLoginPassword('');
    } else {
      alert('Invalid email or password');
    }
  };

  const handleSignup = () => {
    if (!signupName || !signupEmail || !signupPassword) {
      alert('Please fill in all fields');
      return;
    }
    
    const usersKey = 'pantryUsers';
    const users = JSON.parse(localStorage.getItem(usersKey) || '[]');
    
    if (users.find(u => u.email === signupEmail)) {
      alert('Email already registered');
      return;
    }
    
    const newUser = {
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(usersKey, JSON.stringify(users));
    
    const userObj = { name: newUser.name, email: newUser.email };
    setCurrentUser(userObj);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(userObj));
    loadUserData(newUser.email);
    
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setPantryItems([]);
    setMeals([]);
    setProductDatabase([]);
  };

  const addPantryItem = () => {
    if (!newItem.name) return;
    
    const item = {
      id: Date.now(),
      ...newItem,
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
      ...mealLog,
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
    const ingredient = { itemId, amount };
    setMealLog({
      ...mealLog,
      ingredients: [...mealLog.ingredients, ingredient]
    });
  };

  const removeIngredientFromMeal = (itemId) => {
    setMealLog({
      ...mealLog,
      ingredients: mealLog.ingredients.filter(ing => ing.itemId !== itemId)
    });
  };

  const scanBarcode = async (barcode) => {
    if (!barcode) return;
    
    setScanningBarcode(true);
    
    const localProduct = productDatabase.find(p => p.barcode === barcode);
    if (localProduct) {
      setNewItem({
        ...newItem,
        name: localProduct.name,
        category: localProduct.category || 'Other',
        barcode: barcode
      });
      setShowScanner(false);
      setScanningBarcode(false);
      return;
    }
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        const productName = data.product.product_name || data.product.product_name_en || 'Unknown Product';
        const category = data.product.categories_tags?.[0]?.replace('en:', '') || 'Other';
        
        const newProduct = {
          barcode: barcode,
          name: productName,
          category: guessCategory(category),
          brand: data.product.brands || '',
          addedDate: new Date().toISOString()
        };
        
        setProductDatabase([...productDatabase, newProduct]);
        
        setNewItem({
          ...newItem,
          name: productName,
          category: guessCategory(category),
          barcode: barcode
        });
        setShowScanner(false);
      } else {
        const manualProduct = prompt('Product not found in database. Enter product name:');
        if (manualProduct) {
          const newProduct = {
            barcode: barcode,
            name: manualProduct,
            category: 'Other',
            addedDate: new Date().toISOString()
          };
          setProductDatabase([...productDatabase, newProduct]);
          setNewItem({
            ...newItem,
            name: manualProduct,
            barcode: barcode
          });
        }
        setShowScanner(false);
      }
    } catch (error) {
      console.error('Barcode lookup error:', error);
      alert('Could not lookup barcode. Please enter manually.');
      setShowScanner(false);
    }
    
    setScanningBarcode(false);
  };

  const guessCategory = (apiCategory) => {
    const categoryMap = {
      'dairy': 'Dairy',
      'milk': 'Dairy',
      'cheese': 'Dairy',
      'yogurt': 'Dairy',
      'meat': 'Meat',
      'chicken': 'Meat',
      'beef': 'Meat',
      'pork': 'Meat',
      'fish': 'Meat',
      'fruit': 'Produce',
      'vegetable': 'Produce',
      'produce': 'Produce',
      'bread': 'Pantry',
      'pasta': 'Pantry',
      'rice': 'Pantry',
      'cereal': 'Pantry',
      'snack': 'Snacks',
      'chips': 'Snacks',
      'drink': 'Beverages',
      'beverage': 'Beverages',
      'juice': 'Beverages',
      'water': 'Beverages',
      'frozen': 'Frozen'
    };
    
    const lowerCategory = apiCategory.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (lowerCategory.includes(key)) return value;
    }
    return 'Other';
  };

  const getAIInsights = async () => {
    setLoading(true);
    setShowAIInsights(true);

    const prompt = `I have a digital pantry tracker. Here's my current inventory:

${pantryItems.map(item => `- ${item.name}: ${item.quantity} ${item.unit}${item.expiryDate ? ` (expires: ${new Date(item.expiryDate).toLocaleDateString()})` : ''}`).join('\n')}

Recent meals I've logged:
${meals.slice(-5).map(meal => `- ${meal.name}: ${meal.ingredients.map(ing => {
  const item = pantryItems.find(i => i.id === ing.itemId);
  return item ? `${ing.amount} ${item.unit} ${item.name}` : '';
}).join(', ')}`).join('\n')}

Please analyze this and provide:
1. What meals can I make with current items?
2. What items are running low and when will I need to restock based on usage?
3. What's expiring soon that I should use?
4. Suggest 3-5 budget-friendly items I could buy to maximize meal variety
5. Any efficiency tips for my current inventory

Format as JSON with keys: possibleMeals (array), lowStock (array), expiringSoon (array), shoppingRecommendations (array), tips (array)`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': localStorage.getItem('anthropicKey') || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-20250514',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      const data = await response.json();
      
      if (data.content && data.content[0]) {
        const text = data.content[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          setAiInsights(JSON.parse(jsonMatch[0]));
        } else {
          setAiInsights({ raw: text });
        }
      }
    } catch (error) {
      console.error('AI Error:', error);
      setAiInsights({ error: 'Failed to get AI insights. Check your API key.' });
    }
    
    setLoading(false);
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

  const exportShoppingList = () => {
    if (!aiInsights || !aiInsights.shoppingRecommendations) return;
    const list = aiInsights.shoppingRecommendations.join('\n');
    const blob = new Blob([list], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopping-list.txt';
    a.click();
  };

  const lowStockCount = pantryItems.filter(item => item.quantity < 2).length;
  const expiringCount = pantryItems.filter(item => {
    const days = getDaysUntilExpiry(item.expiryDate);
    return days !== null && days <= 3;
  }).length;

  const getCategoryStats = () => {
    const stats = {};
    categories.filter(c => c !== 'all').forEach(cat => {
      stats[cat] = pantryItems.filter(item => item.category === cat).length;
    });
    return stats;
  };

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50';
  const cardClass = darkMode ? 'bg-gray-800/90 backdrop-blur-xl border border-gray-700/50' : 'bg-white/80 backdrop-blur-xl border border-white/20';
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const mutedClass = darkMode ? 'text-gray-400' : 'text-gray-600';
  const inputClass = darkMode ? 'bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400' : 'bg-white/50 border-gray-200/50';

  // Login/Signup Screen
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4 transition-colors duration-500`}>
        <div className={`${cardClass} rounded-3xl shadow-2xl p-8 max-w-md w-full`}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-lg mx-auto mb-4">
              <Package className="text-white" size={40} />
            </div>
            <h1 className={`text-4xl font-bold ${textClass} mb-2`}>Pantry</h1>
            <p className={`${mutedClass}`}>Smart inventory management</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setShowLogin(true)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                showLogin
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                  : darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                !showLogin
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                  : darkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'
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
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <input
                type="password"
                placeholder="Password"
                className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-4 rounded-xl hover:shadow-xl font-semibold transition-all"
              >
                Login
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
              />
              <input
                type="email"
                placeholder="Email"
                className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSignup()}
              />
              <button
                onClick={handleSignup}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-4 rounded-xl hover:shadow-xl font-semibold transition-all"
              >
                Create Account
              </button>
            </div>
          )}

          <p className={`text-xs ${mutedClass} text-center mt-6`}>
            Note: Currently using local storage. For production, integrate Firebase for cloud sync.
          </p>
        </div>
      </div>
    );
  }

  // Main App (when authenticated)
  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        
        {/* Header */}
        <div className={`${cardClass} rounded-3xl shadow-2xl p-6 md:p-8 mb-6 transition-all duration-300`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <Package className="text-white" size={28} />
              </div>
              <div>
                <h1 className={`text-4xl font-bold ${textClass} tracking-tight`}>Pantry</h1>
                <p className={`text-sm ${mutedClass} font-medium`}>Welcome, {currentUser?.name}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowStats(!showStats)}
                className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100/50 hover:bg-gray-100'} transition-all`}
              >
                <BarChart3 className={mutedClass} size={20} />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-100/50 hover:bg-gray-100'} transition-all`}
              >
                {darkMode ? <Sun className="text-yellow-400" size={20} /> : <Moon className={mutedClass} size={20} />}
              </button>
              <button
                onClick={handleLogout}
                className={`p-3 rounded-xl ${darkMode ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-red-50 hover:bg-red-100'} transition-all text-red-500`}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20' : 'bg-gradient-to-br from-blue-50 to-blue-100'} border ${darkMode ? 'border-blue-500/20' : 'border-blue-200/50'} transition-all hover:scale-105`}>
              <p className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-1`}>{pantryItems.length}</p>
              <p className={`text-xs font-medium ${mutedClass}`}>Total Items</p>
            </div>
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-orange-500/20 to-orange-600/20' : 'bg-gradient-to-br from-orange-50 to-orange-100'} border ${darkMode ? 'border-orange-500/20' : 'border-orange-200/50'} transition-all hover:scale-105`}>
              <p className={`text-3xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'} mb-1`}>{expiringCount}</p>
              <p className={`text-xs font-medium ${mutedClass}`}>Expiring Soon</p>
            </div>
            <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/20' : 'bg-gradient-to-br from-purple-50 to-purple-100'} border ${darkMode ? 'border-purple-500/20' : 'border-purple-200/50'} transition-all hover:scale-105`}>
              <p className={`text-3xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'} mb-1`}>{productDatabase.length}</p>
              <p className={`text-xs font-medium ${mutedClass}`}>Products Saved</p>
            </div>
          </div>

          {/* Category Stats */}
          {showStats && (
            <div className={`mb-6 p-5 rounded-2xl ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50/50'} border ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
              <h3 className={`text-sm font-semibold ${textClass} mb-3`}>Category Breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(getCategoryStats()).map(([cat, count]) => (
                  <div key={cat} className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                    <p className={`text-lg font-bold ${textClass}`}>{count}</p>
                    <p className={`text-xs ${mutedClass}`}>{cat}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Key */}
          <input
            type="password"
            placeholder="Anthropic API Key (for AI features)"
            className={`w-full p-4 border rounded-2xl text-sm ${inputClass} focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all shadow-sm`}
            defaultValue={localStorage.getItem('anthropicKey') || ''}
            onChange={(e) => localStorage.setItem('anthropicKey', e.target.value)}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap mt-6">
            <button
              onClick={() => setShowAddItem(!showAddItem)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-6 py-3.5 rounded-2xl hover:shadow-xl hover:scale-105 transition-all font-semibold"
            >
              <Plus size={20} /> Add Item
            </button>
            <button
              onClick={() => setShowMealLog(!showMealLog)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3.5 rounded-2xl hover:shadow-xl hover:scale-105 transition-all font-semibold"
            >
              <Utensils size={20} /> Log Meal
            </button>
            <button
              onClick={getAIInsights}
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3.5 rounded-2xl hover:shadow-xl hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={20} /> {loading ? 'Analyzing...' : 'AI Insights'}
            </button>
          </div>
        </div>

        {/* Add Item Modal */}
        {showAddItem && (
          <div className={`${cardClass} rounded-3xl shadow-2xl p-6 md:p-8 mb-6 transition-all duration-300 animate-in`}>
            <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>Add New Item</h2>
            
            {/* Barcode Scanner Button */}
            <button
              onClick={() => setShowScanner(!showScanner)}
              className="w-full mb-4 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3.5 rounded-xl hover:shadow-lg transition-all font-medium"
            >
              <Camera size={20} /> {showScanner ? 'Close Scanner' : 'Scan Barcode'}
            </button>

            {showScanner && (
              <div className={`mb-4 p-4 rounded-xl border ${darkMode ? 'bg-purple-500/10 border-purple-500/20' : 'bg-purple-50 border-purple-200/50'}`}>
                <p className={`text-sm font-medium ${textClass} mb-3`}>🔍 Scan or enter barcode</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter barcode number"
                    className={`flex-1 p-3 border rounded-xl ${inputClass} focus:ring-2 focus:ring-purple-500 focus:outline-none`}
                    disabled={scanningBarcode}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        scanBarcode(e.target.value);
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousSibling;
                      if (input.value) scanBarcode(input.value);
                    }}
                    disabled={scanningBarcode}
                    className="px-5 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-all font-medium disabled:opacity-50"
                  >
                    {scanningBarcode ? 'Looking up...' : 'Lookup'}
                  </button>
                </div>
                <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700/30' : 'bg-white/50'}`}>
                  <p className={`text-xs ${mutedClass} mb-1`}>📦 Local Database: {productDatabase.length} products saved</p>
                  <p className={`text-xs ${mutedClass}`}>✓ Checks your saved products first, then searches UK food database</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Item name (e.g., Eggs, Milk, Bread)"
                className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-base`}
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Quantity"
                  className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all`}
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})}
                />
                <select
                  className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all`}
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
                className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all`}
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
                  className={`w-full p-4 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all`}
                  value={newItem.expiryDate}
                  onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                />
              </div>
              <button
                onClick={addPantryItem}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 text-white py-4 rounded-xl hover:shadow-xl font-semibold transition-all text-base"
              >
                Add to Pantry
              </button>
            </div>
          </div>
        )}

        {/* Meal Log Modal */}
        {showMealLog && (
          <div className={`${cardClass} rounded-3xl shadow-2xl p-6 md:p-8 mb-6 transition-all duration-300`}>
            <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>Log a Meal</h2>
            <input
              type="text"
              placeholder="Meal name (e.g., Omelette, Pasta)"
              className={`w-full p-4 border rounded-xl mb-6 ${inputClass} focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-base`}
              value={mealLog.name}
              onChange={(e) => setMealLog({...mealLog, name: e.target.value})}
            />
            <div className="mb-6">
              <p className={`text-sm font-semibold mb-4 ${textClass}`}>Select ingredients used:</p>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {pantryItems.filter(item => item.quantity > 0).map(item => (
                  <div key={item.id} className={`flex items-center gap-3 p-4 rounded-xl ${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-gray-50/50 hover:bg-gray-100/50'} transition-all`}>
                    <span className={`flex-1 font-medium ${textClass}`}>{item.name}</span>
                    <span className={`text-sm ${mutedClass}`}>({item.quantity} {item.unit})</span>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      className={`w-24 p-2 border rounded-lg text-sm ${inputClass} focus:ring-2 focus:ring-emerald-500 focus:outline-none`}
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
                    <span className={`text-sm ${mutedClass} w-12`}>{item.unit}</span>
                  </div>
                ))}
              </div>
            </div>
            {mealLog.ingredients.length > 0 && (
              <div className={`mb-6 p-5 rounded-xl ${darkMode ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200/50'}`}>
                <p className={`text-sm font-semibold mb-3 ${textClass}`}>Ingredients added:</p>
                <div className="space-y-2">
                  {mealLog.ingredients.map((ing, idx) => {
                    const item = pantryItems.find(i => i.id === ing.itemId);
                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <p className={`text-sm ${mutedClass}`}>• {ing.amount} {item?.unit} {item?.name}</p>
                        <button
                          onClick={() => removeIngredientFromMeal(ing.itemId)}
                          className="text-red-500 hover:text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <button
              onClick={logMeal}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-4 rounded-xl hover:shadow-xl font-semibold transition-all"
            >
              Log Meal
            </button>
          </div>
        )}

        {/* AI Insights */}
        {showAIInsights && aiInsights && (
          <div className={`${cardClass} rounded-3xl shadow-2xl p-6 md:p-8 mb-6 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${textClass}`}>AI Insights & Recommendations</h2>
              {aiInsights.shoppingRecommendations && (
                <button
                  onClick={exportShoppingList}
                  className="flex items-center gap-2 text-sm bg-purple-500 text-white px-4 py-2.5 rounded-xl hover:bg-purple-600 transition-all font-medium"
                >
                  <Download size={16} /> Export
                </button>
              )}
            </div>
            {aiInsights.error ? (
              <div className={`p-5 rounded-xl ${darkMode ? 'bg-red-500/10' : 'bg-red-50'} border ${darkMode ? 'border-red-500/20' : 'border-red-200/50'}`}>
                <p className="text-red-500 text-sm">{aiInsights.error}</p>
              </div>
            ) : aiInsights.raw ? (
              <pre className={`whitespace-pre-wrap text-sm ${mutedClass} p-5 rounded-xl ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50/50'}`}>{aiInsights.raw}</pre>
            ) : (
              <div className="space-y-4">
                {aiInsights.possibleMeals && aiInsights.possibleMeals.length > 0 && (
                  <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/10' : 'bg-gradient-to-br from-emerald-50 to-emerald-100'} border ${darkMode ? 'border-emerald-500/20' : 'border-emerald-200/50'}`}>
                    <h3 className={`font-semibold text-lg mb-3 ${darkMode ? 'text-emerald-400' : 'text-emerald-700'} flex items-center gap-2`}>
                      <span className="text-2xl">🍳</span> Meals You Can Make
                    </h3>
                    <div className="space-y-2">
                      {aiInsights.possibleMeals.map((meal, idx) => (
                        <p key={idx} className={`text-sm ${mutedClass} pl-4`}>• {meal}</p>
                      ))}
                    </div>
                  </div>
                )}
                {aiInsights.lowStock && aiInsights.lowStock.length > 0 && (
                  <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-orange-500/10 to-orange-600/10' : 'bg-gradient-to-br from-orange-50 to-orange-100'} border ${darkMode ? 'border-orange-500/20' : 'border-orange-200/50'}`}>
                    <h3 className={`font-semibold text-lg mb-3 ${darkMode ? 'text-orange-400' : 'text-orange-700'} flex items-center gap-2`}>
                      <span className="text-2xl">⚠️</span> Running Low
                    </h3>
                    <div className="space-y-2">
                      {aiInsights.lowStock.map((item, idx) => (
                        <p key={idx} className={`text-sm ${mutedClass} pl-4`}>• {item}</p>
                      ))}
                    </div>
                  </div>
                )}
                {aiInsights.expiringSoon && aiInsights.expiringSoon.length > 0 && (
                  <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-red-500/10 to-red-600/10' : 'bg-gradient-to-br from-red-50 to-red-100'} border ${darkMode ? 'border-red-500/20' : 'border-red-200/50'}`}>
                    <h3 className={`font-semibold text-lg mb-3 ${darkMode ? 'text-red-400' : 'text-red-700'} flex items-center gap-2`}>
                      <span className="text-2xl">⏰</span> Use Soon
                    </h3>
                    <div className="space-y-2">
                      {aiInsights.expiringSoon.map((item, idx) => (
                        <p key={idx} className={`text-sm ${mutedClass} pl-4`}>• {item}</p>
                      ))}
                    </div>
                  </div>
                )}
                {aiInsights.shoppingRecommendations && aiInsights.shoppingRecommendations.length > 0 && (
                  <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/10' : 'bg-gradient-to-br from-blue-50 to-blue-100'} border ${darkMode ? 'border-blue-500/20' : 'border-blue-200/50'}`}>
                    <h3 className={`font-semibold text-lg mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-700'} flex items-center gap-2`}>
                      <span className="text-2xl">🛒</span> Smart Shopping List
                    </h3>
                    <div className="space-y-2">
                      {aiInsights.shoppingRecommendations.map((item, idx) => (
                        <p key={idx} className={`text-sm ${mutedClass} pl-4`}>• {item}</p>
                      ))}
                    </div>
                  </div>
                )}
                {aiInsights.tips && aiInsights.tips.length > 0 && (
                  <div className={`p-5 rounded-2xl ${darkMode ? 'bg-gradient-to-br from-purple-500/10 to-purple-600/10' : 'bg-gradient-to-br from-purple-50 to-purple-100'} border ${darkMode ? 'border-purple-500/20' : 'border-purple-200/50'}`}>
                    <h3 className={`font-semibold text-lg mb-3 ${darkMode ? 'text-purple-400' : 'text-purple-700'} flex items-center gap-2`}>
                      <span className="text-2xl">💡</span> Pro Tips
                    </h3>
                    <div className="space-y-2">
                      {aiInsights.tips.map((tip, idx) => (
                        <p key={idx} className={`text-sm ${mutedClass} pl-4`}>• {tip}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className={`${cardClass} rounded-3xl shadow-lg p-5 mb-6`}>
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${mutedClass}`} size={20} />
                <input
                  type="text"
                  placeholder="Search your pantry..."
                  className={`w-full pl-12 pr-4 py-3.5 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className={`px-5 py-3.5 border rounded-xl ${inputClass} focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold transition-all ${
              view === 'list' 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-xl scale-105' 
                : darkMode ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-800' : 'bg-white/50 text-gray-700 hover:bg-white'
            }`}
          >
            <List size={20} /> List View
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold transition-all ${
              view === 'calendar' 
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-xl scale-105' 
                : darkMode ? 'bg-gray-800/50 text-gray-300 hover:bg-gray-800' : 'bg-white/50 text-gray-700 hover:bg-white'
            }`}
          >
            <Calendar size={20} /> Calendar View
          </button>
        </div>

        {/* List View */}
        {view === 'list' && (
          <div className={`${cardClass} rounded-3xl shadow-2xl p-6 md:p-8`}>
            <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>Your Pantry ({sortedItems.length} items)</h2>
            {sortedItems.length === 0 ? (
              <div className="text-center py-16">
                <Package className={`mx-auto mb-4 ${mutedClass}`} size={64} />
                <p className={`${mutedClass} text-lg font-medium`}>No items found</p>
                <p className={`${mutedClass} text-sm mt-2`}>Add items to start tracking your pantry</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedItems.map(item => {
                  const days = getDaysUntilExpiry(item.expiryDate);
                  return (
                    <div 
                      key={item.id} 
                      className={`group flex items-center justify-between p-5 border rounded-2xl transition-all hover:shadow-lg ${
                        darkMode ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-100 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className={`font-semibold text-lg ${textClass}`}>{item.name}</p>
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className={`text-sm ${mutedClass} font-medium`}>
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
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2.5 rounded-xl transition-all"
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
          <div className={`${cardClass} rounded-3xl shadow-2xl p-6 md:p-8`}>
            <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>Expiry Calendar</h2>
            {Object.keys(groupByDate()).length === 0 ? (
              <div className="text-center py-16">
                <Calendar className={`mx-auto mb-4 ${mutedClass}`} size={64} />
                <p className={`${mutedClass} text-lg font-medium`}>No expiry dates set</p>
                <p className={`${mutedClass} text-sm mt-2`}>Add expiry dates to see items here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupByDate())
                  .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
                  .map(([date, items]) => {
                    const days = getDaysUntilExpiry(items[0].expiryDate);
                    return (
                      <div key={date} className={`border rounded-2xl p-5 ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}>
                        <h3 className={`font-bold text-lg mb-4 ${getExpiryColor(days, darkMode)}`}>
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
                            <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl ${darkMode ? 'bg-gray-700/30' : 'bg-gray-50/50'}`}>
                              <span className={`${textClass} font-medium`}>{item.name}</span>
                              <span className={`text-sm ${mutedClass}`}>{item.quantity} {item.unit}</span>
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
          <div className={`${cardClass} rounded-3xl shadow-2xl p-6 md:p-8 mt-6`}>
            <h2 className={`text-2xl font-bold mb-6 ${textClass}`}>Recent Meals</h2>
            <div className="space-y-3">
              {meals.slice(-10).reverse().map(meal => (
                <div key={meal.id} className={`p-5 border rounded-2xl ${darkMode ? 'border-gray-700/50' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className={`font-semibold text-lg ${textClass}`}>{meal.name}</p>
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

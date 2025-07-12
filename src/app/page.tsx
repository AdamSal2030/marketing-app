'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Filter, Search, Database, Tv, Radio, ChevronDown, LogOut, UserPlus, ArrowUpDown, ArrowUp, ArrowDown, Download, Settings, DollarSign, List, Mail } from 'lucide-react';

// Import the invitation modal
import InvitationModal from '../components/InvitationModal';

// Add proper type for formatHeader function
const formatHeader = (header: string): string => {
  return header
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1') // Add space before capital letters
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim(); // Remove any leading/trailing spaces
};

// Define types for your data structures
interface DataItem {
  name?: string;
  price?: number | string; // Changed to accept string for listicles
  do_follow?: boolean | string;
  estimated_time?: string;
  genres?: string;
  regions?: string;
  url?: string;
  example?: string;
  logo?: string;
  // Television fields - UPDATED to match new API structure
  affiliate?: string;
  state?: string;
  calls?: string;
  market?: string;
  location?: string;
  time?: string;
  programName?: string;
  rate?: number;
  // Broadcast TV fields
  CallSign?: string;
  station?: string;
  tat?: string;
  sponsored?: string;
  indexed?: string;
  SegmentLength?: string;
  ProgramName?: string;
  InterviewType?: string;
  Example?: string;
}

interface Filters {
  publication: {
    search: string;
    minPrice: string;
    maxPrice: string;
    region: string;
    genre: string; // Added genre filter for publications
  };
  listicles: {
    search: string;
    genre: string;
  };
  television: {
    search: string;
    affiliate: string;
    state: string;
  };
  broadcast_television: {
    callSign: string;
  };
}

type TableType = 'publication' | 'listicles' | 'television' | 'broadcast_television';
type SortDirection = 'asc' | 'desc' | null;

// Component to render genre boxes with consistent dark theme styling
const GenreBoxes = ({ genres }: { genres?: string }) => {
  if (!genres) return <span className="text-gray-500">-</span>;
  
  const genreList = genres.split(',').map(g => g.trim()).filter(g => g.length > 0);
  
  if (genreList.length === 0) return <span className="text-gray-500">-</span>;
  
  return (
    <div className="flex flex-wrap gap-1.5">
      {genreList.map((genre, index) => (
        <span
          key={index}
          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-white bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-900 border border-teal-900"
        >
          {genre}
        </span>
      ))}
    </div>
  );
};

// Component to render pricing tiers with consistent dark theme styling
const PricingTiers = ({ priceText }: { priceText?: string | number }) => {
  if (!priceText) return <span className="text-gray-500">-</span>;
  
  // If it's a number, display it normally
  if (typeof priceText === 'number') {
    return <span className="text-[#cbff00] font-semibold">${priceText.toLocaleString()}</span>;
  }
  
  // If it's a string, parse pricing tiers
  let priceString = priceText.toString();
  
  // First, clean up the string - remove all markdown asterisks and commas
  priceString = priceString.replace(/\*\*/g, '').replace(/,/g, '');
  
  // Check if it contains "Top" (case insensitive)
  if (priceString.toLowerCase().includes('top')) {
    // Find all positions where "Top" appears (case insensitive)
    const topPositions = [];
    let searchString = priceString.toLowerCase();
    let position = searchString.indexOf('top');
    
    while (position !== -1) {
      topPositions.push(position);
      position = searchString.indexOf('top', position + 1);
    }
    
    // If we have more than one "Top", split at the second one
    if (topPositions.length > 1) {
      const tiers = [];
      for (let i = 0; i < topPositions.length; i++) {
        const start = topPositions[i];
        const end = i < topPositions.length - 1 ? topPositions[i + 1] : priceString.length;
        const tierText = priceString.substring(start, end).trim();
        if (tierText) tiers.push(tierText);
      }
      
      return (
        <div className="flex flex-wrap gap-2">
          {tiers.map((tier, index) => {
            // Extract numbers from the tier text
            const numbers = tier.match(/\d+/g) || [];
            const label = tier.match(/Top\s*\d+/i)?.[0] || `Tier ${index + 1}`;
            const price = numbers.length > 1 ? numbers[1] : (numbers[0] || '0');
            
            return (
              <div
                key={index}
                className="inline-flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-[#cbff00] transition-all duration-300"
              >
                <span className="text-gray-300 text-xs font-normal mb-0.5">
                  {label}
                </span>
                <span className="text-[#cbff00] font-bold">
                  ${parseInt(price).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
  }
  
  // If it doesn't match the tier format, display as is
  return <span className="text-[#cbff00] font-semibold">{priceString}</span>;
};

export default function Page() {
  // Store data for each table type separately
  const [allData, setAllData] = useState<Record<TableType, DataItem[]>>({
    publication: [],
    listicles: [],
    television: [],
    broadcast_television: []
  });

  const [data, setData] = useState<DataItem[]>([]);
  const [filters, setFilters] = useState<Filters>({ 
    publication: { search: '', minPrice: '', maxPrice: '', region: '', genre: '' }, // Added genre
    listicles: { search: '', genre: '' },
    television: { search: '', affiliate: '', state: '' }, 
    broadcast_television: { callSign: '' } 
  });
  
  const [activeTable, setActiveTable] = useState<TableType>('publication');
  const [loading, setLoading] = useState<boolean>(false);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const [invitationModalOpen, setInvitationModalOpen] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('user');
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // Check screen size for responsive behavior
  useEffect(() => {
    const checkScreenSize = () => {
      // Mobile responsive behavior can be added here if needed
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Get user role from API
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role || 'user');
        }
      } catch (error) {
        console.error('Failed to get user role:', error);
      }
    };
    
    checkUserRole();
  }, []);

  // Function to fetch data based on table type
  const fetchData = async (tableType: TableType) => {
    setLoading(true);
    try {
      let endpoint: string;
      switch (tableType) {
        case 'publication':
          endpoint = '/api/data';
          break;
        case 'listicles':
          endpoint = '/api/listicles';
          break;
        case 'television':
          endpoint = '/api/television';
          break;
        case 'broadcast_television':
          endpoint = '/api/broadcast_television';
          break;
        default:
          endpoint = '/api/data';
      }
      
      const res = await fetch(endpoint);
      const fetchedData: DataItem[] = await res.json();
      
      console.log(`Fetched ${tableType} data:`, fetchedData.slice(0, 2)); // Debug log
      
      setData(fetchedData);
      setAllData(prev => ({
        ...prev,
        [tableType]: fetchedData
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTable);
    // Reset sort when changing tables
    setSortDirection(null);
  }, [activeTable]);



  // Memoize filtered and sorted data to prevent unnecessary recalculations
  const filteredAndSortedData = useMemo(() => {
    // Enhanced filtering logic that searches within genres
    const filtered = data.filter((item: DataItem) => {
      if (activeTable === 'publication') {
        const pubFilters = filters[activeTable] as Filters['publication'];
        const searchMatch = item.name?.toLowerCase().includes(pubFilters.search?.toLowerCase() || '');
        const price = typeof item.price === 'number' ? item.price : 0;
        const minMatch = pubFilters.minPrice === '' || price >= parseFloat(pubFilters.minPrice || '0');
        const maxMatch = pubFilters.maxPrice === '' || price <= parseFloat(pubFilters.maxPrice || '100000');
        const regionMatch = pubFilters.region === '' || 
          new RegExp(pubFilters.region, 'i').test(item.regions || '');
        
        // Enhanced genre matching - searches within comma-separated genres
        const genreMatch = pubFilters.genre === '' || 
          (item.genres && item.genres.toLowerCase().includes(pubFilters.genre.toLowerCase()));
        
        return searchMatch && minMatch && maxMatch && regionMatch && genreMatch;
      } else if (activeTable === 'listicles') {
        const listFilters = filters[activeTable] as Filters['listicles'];
        const searchMatch = item.name?.toLowerCase().includes((listFilters.search || '').toLowerCase());
        
        // Enhanced genre matching for listicles too
        const genreMatch = listFilters.genre === '' || 
          (item.genres && item.genres.toLowerCase().includes(listFilters.genre.toLowerCase()));
        
        return searchMatch && genreMatch;
      } else if (activeTable === 'television') {
        const tvFilters = filters[activeTable] as Filters['television'];
        const searchMatch = tvFilters.search === '' || 
          item.calls?.toLowerCase().includes(tvFilters.search.toLowerCase()) ||
          item.programName?.toLowerCase().includes(tvFilters.search.toLowerCase());
        const affiliateMatch = tvFilters.affiliate === '' || 
          item.affiliate?.toLowerCase().includes(tvFilters.affiliate.toLowerCase());
        const stateMatch = tvFilters.state === '' ||
          item.state?.toLowerCase().includes(tvFilters.state.toLowerCase());
        return searchMatch && affiliateMatch && stateMatch;
      } else if (activeTable === 'broadcast_television') {
        const bcFilters = filters[activeTable] as Filters['broadcast_television'];
        return item.CallSign?.toLowerCase().includes((bcFilters.callSign || '').toLowerCase());
      }
      return true;
    });

    // Apply sorting to filtered data (skip for listicles)
    return [...filtered].sort((a, b) => {
      if (sortDirection === null || activeTable === 'listicles') return 0;
      
      const priceField = activeTable === 'publication' ? 'price' : 'rate';
      const aValue = a[priceField as keyof DataItem] as number || 0;
      const bValue = b[priceField as keyof DataItem] as number || 0;
      
      if (sortDirection === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }, [data, filters, activeTable, sortDirection]);

  // Memoize visible columns - Updated to use auto width instead of fixed
  const visibleColumns = useMemo(() => {
    if (!filteredAndSortedData.length) return [];
    const allKeys = Object.keys(filteredAndSortedData[0]);
    
    if (activeTable === 'publication') {
      const priorityOrder = ['name', 'price', 'genres', 'regions', 'example', 'estimated_time', 'do_follow'];
      const orderedKeys = priorityOrder.filter(key => allKeys.includes(key));
      const remainingKeys = allKeys.filter(key => !priorityOrder.includes(key) && key !== 'url' && key !== 'logo');
      return [...orderedKeys, ...remainingKeys].slice(0, 6);
    } else if (activeTable === 'listicles') {
      const priorityOrder = ['name', 'price', 'genres', 'regions', 'example', 'estimated_time'];
      return priorityOrder.filter(key => allKeys.includes(key));
    } else if (activeTable === 'television') {
      const priorityOrder = ['affiliate', 'calls', 'programName', 'state', 'market', 'location', 'rate'];
      return priorityOrder.filter(key => allKeys.includes(key));
    } else {
      return allKeys.filter(key => key !== 'url' && key !== 'logo' && key !== 'example').slice(0, 5);
    }
  }, [filteredAndSortedData, activeTable]);

  // Optimize filter updates with useCallback
  const updateFilters = useCallback((newFilters: Partial<Filters[TableType]>) => {
    setFilters(prev => ({
      ...prev,
      [activeTable]: { ...prev[activeTable], ...newFilters }
    }));
  }, [activeTable]);

  // Optimize table switch with useCallback
  const handleTableSwitch = useCallback((tableType: TableType) => {
    setActiveTable(tableType);
    setFiltersOpen(false);
  }, []);

  // Optimize sort handling with useCallback
  const handleSort = useCallback(() => {
    if (activeTable === 'listicles') return; // No sorting for listicles
    
    if (sortDirection === null) {
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortDirection(null);
    }
  }, [activeTable, sortDirection]);

  // Get sort icon
  const getSortIcon = () => {
    if (sortDirection === 'asc') return <ArrowUp size={16} className="text-black" />;
    if (sortDirection === 'desc') return <ArrowDown size={16} className="text-black" />;
    return <ArrowUpDown size={16} className="text-black" />;
  };

  // Get sort label
  const getSortLabel = () => {
    const priceField = activeTable === 'publication' ? 'price' : 'rate';
    const fieldName = priceField === 'price' ? 'Price' : 'Rate';
    
    if (sortDirection === 'asc') return `${fieldName} (Low to High)`;
    if (sortDirection === 'desc') return `${fieldName} (High to Low)`;
    return `Sort by ${fieldName}`;
  };

  // Get current filters based on active table
  const currentFilters = filters[activeTable];

  const getTableIcon = (type: TableType) => {
    switch (type) {
      case 'publication': return <Database size={18} />;
      case 'listicles': return <List size={18} />;
      case 'television': return <Tv size={18} />;
      case 'broadcast_television': return <Radio size={18} />;
      default: return <Database size={18} />;
    }
  };

  const getTableLabel = (type: TableType) => {
    switch (type) {
      case 'publication': return 'Publications';
      case 'listicles': return 'Listicles';
      case 'television': return 'Television';
      case 'broadcast_television': return 'Broadcast TV';
      default: return 'Publications';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(203, 255, 0, 0.3); }
          50% { box-shadow: 0 0 30px rgba(203, 255, 0, 0.5); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        
        .animate-pulse-custom {
          animation: pulse 2s infinite;
        }
        
        .animate-glow {
          animation: glow 2s infinite;
        }
        
        .table-row-enter {
          animation: fadeIn 0.4s ease-out;
        }
        
        .filter-panel-enter {
          animation: slideDown 0.3s ease-out;
        }
        
        .lime-gradient {
          background: linear-gradient(135deg, #cbff00 0%, #9fff00 100%);
        }
        
        .hover-lift:hover {
          transform: translateY(-1px);
          transition: transform 0.15s ease;
        }
        
        .hover-glow:hover {
          box-shadow: 0 0 15px rgba(203, 255, 0, 0.3);
          transition: box-shadow 0.15s ease;
        }
        
        .transition-fast {
          transition: all 0.15s ease;
        }
      `}</style>

      {/* Header */}
      <header className="border-b border-gray-800 lime-gradient sticky top-0 z-50 animate-slideDown shimmer-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 animate-slideInLeft">
              <div className="w-24 h-16 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/10">
                <img 
                  src="/logo.png" 
                  alt="Digital Networking Agency Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">Digital Networking Agency</h1>
                <p className="text-xs text-black/70">Publication Dashboard</p>
              </div>
            </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-6">
                <div className="text-sm">
                  <span className="text-black/70">Results:</span>
                  <span className="ml-1 text-black font-bold">{filteredAndSortedData.length}</span>
                </div>
              </div>
              {/* Admin Only - Pricing Factors Button */}
              {userRole === 'admin' && (
                <button 
                  onClick={() => window.location.href = '/pricing-factors'}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-black/20 hover:bg-black/30 rounded-lg transition-all hover-lift hover-scale"
                >
                  <DollarSign size={16} className="text-black" />
                  <span className="hidden sm:inline text-sm text-black font-medium">Pricing</span>
                </button>
              )}
              
              {/* Admin Only - Settings Button */}
              {userRole === 'admin' && (
                <button 
                  onClick={() => window.location.href = '/users'}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-black/20 hover:bg-black/30 rounded-lg transition-all hover-lift hover-scale"
                >
                  <Settings size={16} className="text-black" />
                  <span className="hidden sm:inline text-sm text-black font-medium">Settings</span>
                </button>
              )}
              
              {/* Admin Only - Send Invitation Button */}
              {userRole === 'admin' && (
                <button 
                  onClick={() => setInvitationModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-black/20 hover:bg-black/30 rounded-lg transition-all hover-lift hover-scale"
                >
                  <UserPlus size={16} className="text-black" />
                  <span className="hidden sm:inline text-sm text-black font-medium">Invite User</span>
                </button>
              )}
              
              <button 
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/login';
                  } catch (error) {
                    console.error('Logout failed:', error);
                    window.location.href = '/login';
                  }
                }}
                className="flex items-center space-x-2 px-3 py-1.5 bg-black/20 hover:bg-black/30 rounded-lg transition-all hover-lift hover-scale"
              >
                <LogOut size={16} className="text-black" />
                <span className="hidden sm:inline text-sm text-black font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Information Section */}
      <div className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-800 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 hover-glow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1">
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    <span className="text-[#cbff00] font-medium">Important Notice:</span> Once we have published the article for you, any further edits may include an extra charge.
                  </p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Digital Networking Agency will use reasonable good faith efforts to ensure that such article will remain publicly available in the applicable publication for at least 12 months.
                  </p>
                  
                  {/* Enhanced Contact Section */}
                  <div className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-xl border border-[#cbff00]/30 p-4 mt-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#cbff00] to-[#9fff00] rounded-full flex items-center justify-center shadow-lg">
                        <Mail size={18} className="text-black" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[#cbff00] text-sm font-medium">For orders please contact:</p>
                        <a 
                          className="text-white hover:text-[#cbff00] font-bold text-lg transition-colors duration-300 hover:underline"
                        >
                          sam@digitalnetworkingagency.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 lg:ml-8">
                <button
                  onClick={() => window.open('https://docs.google.com/document/d/1hFgAovf6BFj71lvEWBuj-q3I3UFxGSoWjU6KkzvUwW4/edit?usp=sharing', '_blank')}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 border border-[#cbff00] text-[#cbff00] hover:bg-[#cbff00] hover:text-black font-medium rounded-lg transition-all hover-lift"
                >
                  <Download size={16} />
                  <span>Download PR Questionnaire</span>
                </button>
                
                <button
                  onClick={() => window.open('https://docs.google.com/document/d/1VKongYU8yeVJQq8JgAmc80c8BWp2Ditj4CrQPdR77r8/edit?addon_store&tab=t.0', '_blank')}
                  className="flex items-center justify-center space-x-2 px-4 py-2.5 border border-[#cbff00] text-[#cbff00] hover:bg-[#cbff00] hover:text-black font-medium rounded-lg transition-all hover-lift"
                >
                  <Download size={16} />
                  <span>Download TV Questionnaire</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-4 overflow-x-auto">
            {(['publication', 'listicles', 'television', 'broadcast_television'] as TableType[]).map((type, index) => (
              <button
                key={type}
                onClick={() => handleTableSwitch(type)}
                style={{ animationDelay: `${index * 0.1}s` }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover-lift animate-fadeIn whitespace-nowrap ${
                  activeTable === type
                    ? 'lime-gradient text-black shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800 border border-gray-700'
                }`}
              >
                {getTableIcon(type)}
                <span>{getTableLabel(type)}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeTable === type ? 'bg-black/20 text-black' : 'bg-gray-700 text-gray-300'
                }`}>
                  {type === activeTable ? filteredAndSortedData.length : allData[type].length}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Toggle and Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all hover-lift ${
                filtersOpen
                  ? 'lime-gradient text-black border-[#cbff00] shadow-lg animate-glow'
                  : 'bg-gray-800 text-white border-gray-700 hover:border-gray-600 hover-glow'
              }`}
            >
              <Filter size={18} />
              <span className="font-medium">Filters</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${filtersOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Sort Button - Only show for publication, television, and broadcast_television */}
            {activeTable !== 'listicles' && (
              <button
                onClick={handleSort}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all hover-lift ${
                  sortDirection
                    ? 'lime-gradient text-black border-[#cbff00] shadow-lg'
                    : 'bg-gray-800 text-white border-gray-700 hover:border-gray-600 hover-glow'
                }`}
              >
                {getSortIcon()}
                <span className="font-medium hidden sm:inline">{getSortLabel()}</span>
                <span className="font-medium sm:hidden">Sort</span>
              </button>
            )}
            
            {(filtersOpen || sortDirection) && (
              <button
                onClick={() => {
                  if (activeTable === 'publication') {
                    updateFilters({ search: '', minPrice: '', maxPrice: '', region: '', genre: '' });
                  } else if (activeTable === 'listicles') {
                    updateFilters({ search: '', genre: '' });
                  } else if (activeTable === 'television') {
                    updateFilters({ search: '', affiliate: '', state: '' });
                  } else if (activeTable === 'broadcast_television') {
                    updateFilters({ callSign: '' });
                  }
                  setSortDirection(null);
                }}
                className="text-sm text-gray-400 hover:text-[#cbff00] transition-colors animate-fadeIn"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="text-sm text-gray-400">
            Showing <span className="text-[#cbff00] font-semibold">{filteredAndSortedData.length}</span> of <span className="text-white">{data.length}</span> results
            {sortDirection && activeTable !== 'listicles' && (
              <span className="ml-2 text-[#cbff00]">
                • Sorted by {activeTable === 'publication' ? 'Price' : 'Rate'} ({sortDirection === 'asc' ? 'Low to High' : 'High to Low'})
              </span>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {filtersOpen && (
          <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-800 p-6 mb-6 shadow-2xl filter-panel-enter hover-glow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeTable === 'publication' ? (
                <>
                  <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Search Publications</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter name..."
                        value={(currentFilters as Filters['publication']).search || ''}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#cbff00] focus:border-[#cbff00] text-white placeholder-gray-400 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
                    <input
                      type="text"
                      placeholder="Search genres..."
                      value={(currentFilters as Filters['publication']).genre || ''}
                      onChange={(e) => updateFilters({ genre: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#cbff00] focus:border-[#cbff00] text-white placeholder-gray-400 transition-all"
                    />
                  </div>
                  
                  <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Min Price</label>
                    <input
                      type="number"
                      placeholder="$ Min"
                      value={(currentFilters as Filters['publication']).minPrice || ''}
                      onChange={(e) => updateFilters({ minPrice: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#cbff00] focus:border-[#cbff00] text-white placeholder-gray-400 transition-all"
                    />
                  </div>
                  
                  <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Price</label>
                    <input
                      type="number"
                      placeholder="$ Max"
                      value={(currentFilters as Filters['publication']).maxPrice || ''}
                      onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#cbff00] focus:border-[#cbff00] text-white placeholder-gray-400 transition-all"
                    />
                  </div>
                  
                  <div className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Region</label>
                    <input
                      type="text"
                      placeholder="Enter region..."
                      value={(currentFilters as Filters['publication']).region || ''}
                      onChange={(e) => updateFilters({ region: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#cbff00] focus:border-[#cbff00] text-white placeholder-gray-400 transition-all"
                    />
                  </div>
                </>
              ) : activeTable === 'listicles' ? (
                <>
                  <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Search Listicles</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Enter name..."
                        value={(currentFilters as Filters['listicles']).search || ''}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#cbff00] focus:border-[#cbff00] text-white placeholder-gray-400 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
                    <input
                      type="text"
                      placeholder="Search genres..."
                      value={(currentFilters as Filters['listicles']).genre || ''}
                      onChange={(e) => updateFilters({ genre: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#cbff00] focus:border-[#cbff00] text-white placeholder-gray-400 transition-all"
                    />
                  </div>
                </>
              ) : activeTable === 'television' ? (
                <>
                  <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Search TV Shows</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Call sign or program..."
                        value={(currentFilters as Filters['television']).search || ''}
                        onChange={(e) => updateFilters({ search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#cbff00] focus:border-[#cbff00] text-white placeholder-gray-400 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Affiliate</label>
                    <input
                      type="text"
                      placeholder="CBS, NBC, ABC..."
                      value={(currentFilters as Filters['television']).affiliate || ''}
                      onChange={(e) => updateFilters({ affiliate: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#cbff00] focus:border-[#cbff00] text-white placeholder-gray-400 transition-all"
                    />
                  </div>
                  
                  <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
                    <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                    <input
                      type="text"
                      placeholder="Enter state..."
                      value={(currentFilters as Filters['television']).state || ''}
                      onChange={(e) => updateFilters({ state: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#cbff00] focus:border-[#cbff00] text-white placeholder-gray-400 transition-all"
                    />
                  </div>
                </>
              ) : (
                <div className="md:col-span-2 animate-fadeIn">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Search Call Signs</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter call sign..."
                      value={(currentFilters as Filters['broadcast_television']).callSign || ''}
                      onChange={(e) => updateFilters({ callSign: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#cbff00] focus:border-[#cbff00] text-white placeholder-gray-400 transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden shadow-2xl animate-fadeIn">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#cbff00]"></div>
                <span className="text-gray-400">Loading data...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 lime-gradient">
                    {visibleColumns.map((header, index) => (
                      <th 
                        key={header} 
                        style={{ animationDelay: `${index * 0.1}s` }}
                        className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider animate-fadeIn"
                      >
                        {formatHeader(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredAndSortedData.length > 0 ? (
                    filteredAndSortedData.map((row, idx) => (
                      <tr 
                        key={idx} 
                        style={{ animationDelay: `${idx * 0.05}s` }}
                        className="hover:bg-gray-800/50 transition-all duration-300 hover-lift table-row-enter"
                      >
                        {visibleColumns.map((key) => {
                          const cellValue = row[key as keyof DataItem];
                          return (
                            <td key={key} className="px-4 sm:px-6 py-4 text-sm">
                              {key === 'genres' ? (
                                <GenreBoxes genres={cellValue as string} />
                              ) : key === 'example' && row.example ? (
                                <a
                                  href={activeTable === 'television' ? row.example : `https://cdn.sanity.io/images/8n90kyzz/production/${row.example}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-block transition-all duration-300 hover:scale-110"
                                >
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#cbff00] to-[#9fff00] rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl">
                                    <span className="text-black text-lg">🖼️</span>
                                  </div>
                                </a>
                              ) : key === 'name' || key === 'programName' ? (
                                <div className="flex items-start space-x-3">
                                  {row.logo && (
                                    <img
                                      src={`https://cdn.sanity.io/images/8n90kyzz/production/${row.logo}`}
                                      alt="logo"
                                      className="w-8 h-8 rounded-lg object-cover border border-gray-700 hover:scale-110 transition-transform duration-300 flex-shrink-0 mt-1"
                                    />
                                  )}
                                  <div className="min-w-0">
                                    {row.url ? (
                                      <a 
                                        href={row.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-[#cbff00] hover:text-[#9fff00] font-medium transition-colors block break-words leading-5"
                                      >
                                        {cellValue}
                                      </a>
                                    ) : (
                                      <span className="text-gray-300 font-medium block break-words leading-5">{cellValue}</span>
                                    )}
                                  </div>
                                </div>
                              ) : key === 'price' ? (
                                activeTable === 'listicles' ? (
                                  <PricingTiers priceText={cellValue as string | number} />
                                ) : (
                                  <span className="text-[#cbff00] font-semibold">
                                    ${(cellValue as number)?.toLocaleString()}
                                  </span>
                                )
                              ) : key === 'rate' ? (
                                <span className="text-[#cbff00] font-semibold">
                                  ${(cellValue as number)?.toLocaleString()}
                                </span>
                              ) : key === 'affiliate' ? (
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  cellValue === 'CBS' ? 'bg-blue-900 text-blue-200' :
                                  cellValue === 'NBC' ? 'bg-purple-900 text-purple-200' :
                                  cellValue === 'ABC' ? 'bg-red-900 text-red-200' :
                                  cellValue === 'Fox' ? 'bg-orange-900 text-orange-200' :
                                  cellValue === 'CW' ? 'bg-green-900 text-green-200' :
                                  cellValue === 'INDIE' ? 'bg-gray-900 text-gray-200' :
                                  'bg-gray-800 text-gray-300'
                                }`}>
                                  {cellValue}
                                </span>
                              ) : key === 'regions' || key === 'calls' || key === 'market' || key === 'location' || key === 'state' ? (
                                <div className="text-gray-300 break-words leading-5 max-w-xs">
                                  {cellValue}
                                </div>
                              ) : (
                                <span className="text-gray-300 break-words block leading-5">{cellValue}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={visibleColumns.length} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center space-y-3 animate-fadeIn">
                          <Database size={48} className="text-gray-600" />
                          <h3 className="text-lg font-medium text-gray-300">No results found</h3>
                          <p className="text-gray-500">Try adjusting your filters to see more data</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 lime-gradient mt-12 animate-fadeIn">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <p className="text-sm text-black/80 font-medium">© 2025 Digital Networking Agency. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-black/70 hover:text-black transition-colors font-medium hover-lift">Privacy</a>
              <a href="#" className="text-sm text-black/70 hover:text-black transition-colors font-medium hover-lift">Terms</a>
              <a href="#" className="text-sm text-black/70 hover:text-black transition-colors font-medium hover-lift">Support</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Invitation Modal */}
      <InvitationModal 
        isOpen={invitationModalOpen}
        onClose={() => setInvitationModalOpen(false)}
        userRole={userRole}
      />
    </div>
  );
}
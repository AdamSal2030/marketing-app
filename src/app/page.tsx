'use client';

import { useEffect, useState } from 'react';

// Add proper type for formatHeader function
const formatHeader = (header: string): string => {
  return header
    .split('_') 
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
    .join(' '); 
};

// Define types for your data structures
interface DataItem {
  name?: string;
  price?: number;
  do_follow?: boolean | string;
  estimated_time?: string;
  genres?: string;
  regions?: string;
  url?: string;
  example?: string;
  logo?: string;
  // Television fields
  Affiliate?: string;
  State?: string;
  call?: string;
  market?: string;
  location?: string;
  time?: string;
  // Broadcast TV fields
  CallSign?: string;
  station?: string;
  rate?: number;
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
  };
  television: {
    search: string;
  };
  broadcast_television: {
    callSign: string;
  };
}

type TableType = 'publication' | 'television' | 'broadcast_television';

export default function Page() {
  const [data, setData] = useState<DataItem[]>([]);
  const [filters, setFilters] = useState<Filters>({ 
    publication: { search: '', minPrice: '', maxPrice: '', region: '' },
    television: { search: '' }, 
    broadcast_television: { callSign: '' } 
  });
  
  const [activeTable, setActiveTable] = useState<TableType>('publication');
  const [loading, setLoading] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
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
      
      setData(fetchedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTable);
  }, [activeTable]);

  // Handle table switch
  const handleTableSwitch = (tableType: TableType) => {
    setActiveTable(tableType);
    if (isMobile) setSidebarOpen(false);
  };

  // Get current filters based on active table
  const currentFilters = filters[activeTable];

  // Update filters for current table
  const updateFilters = (newFilters: Partial<Filters[TableType]>) => {
    setFilters(prev => ({
      ...prev,
      [activeTable]: { ...prev[activeTable], ...newFilters }
    }));
  };

  const filteredData = data.filter((item: DataItem) => {
    if (activeTable === 'publication') {
      const pubFilters = currentFilters as Filters['publication'];
      const searchMatch = item.name?.toLowerCase().includes(pubFilters.search?.toLowerCase() || '');
      const price = item.price || 0;
      const minMatch = pubFilters.minPrice === '' || price >= parseFloat(pubFilters.minPrice || '0');
      const maxMatch = pubFilters.maxPrice === '' || price <= parseFloat(pubFilters.maxPrice || '100000');
      const regionMatch = pubFilters.region === '' || 
        new RegExp(pubFilters.region, 'i').test(item.regions || '');
      return searchMatch && minMatch && maxMatch && regionMatch;
    } else if (activeTable === 'television') {
      const tvFilters = currentFilters as Filters['television'];
      return item.call?.toLowerCase().includes((tvFilters.search || '').toLowerCase());
    } else if (activeTable === 'broadcast_television') {
      const bcFilters = currentFilters as Filters['broadcast_television'];
      return item.CallSign?.toLowerCase().includes((bcFilters.callSign || '').toLowerCase());
    }
    return true;
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={styles.page}>
      <style>{animationStyles}</style>

      {/* Floating Background Elements */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* Header */}
      <header style={styles.header} className="glass-morphism slide-down">
        <div style={styles.headerLeft}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>📊</div>
            <div style={styles.logoText}>
              <h1 style={styles.brandName}>MediaMetrics</h1>
              <p style={styles.tagline}>Professional Analytics Dashboard</p>
            </div>
          </div>
          {isMobile && (
            <button 
              style={styles.mobileMenuButton}
              onClick={toggleSidebar}
              className="mobile-menu-hover pulse"
            >
              <span>🔍</span> Filters
            </button>
          )}
        </div>
        <div style={styles.headerRight}>
          <div style={styles.statsContainer}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>{filteredData.length}</span>
              <span style={styles.statLabel}>Results</span>
            </div>
          </div>
          <button style={styles.logoutButton} className="logout-hover glow-on-hover">
            <span>👤</span> Logout
          </button>
        </div>
        <div className="logout-popup">🚀 See you soon!</div>
      </header>

      {/* Navigation Section */}
      <nav style={styles.navigation} className="glass-morphism">
        <div style={styles.navContainer}>
          <h2 style={styles.navTitle}>Data Sources</h2>
          <div style={styles.navTabs}>
            <button
              style={{
                ...styles.navTab,
                ...(activeTable === 'publication' ? styles.activeTab : {})
              }}
              data-active={activeTable === 'publication'}
              onClick={() => handleTableSwitch('publication')}
              className="nav-tab floating-button"
            >
              <span className="tab-icon">📰</span>
              <span>Publications</span>
              <span className="tab-badge">{activeTable === 'publication' ? filteredData.length : ''}</span>
            </button>
            <button
              style={{
                ...styles.navTab,
                ...(activeTable === 'television' ? styles.activeTab : {})
              }}
              data-active={activeTable === 'television'}
              onClick={() => handleTableSwitch('television')}
              className="nav-tab floating-button"
            >
              <span className="tab-icon">📺</span>
              <span>Television</span>
              <span className="tab-badge">{activeTable === 'television' ? filteredData.length : ''}</span>
            </button>
            <button
              style={{
                ...styles.navTab,
                ...(activeTable === 'broadcast_television' ? styles.activeTab : {})
              }}
              data-active={activeTable === 'broadcast_television'}
              onClick={() => handleTableSwitch('broadcast_television')}
              className="nav-tab floating-button"
            >
              <span className="tab-icon">📡</span>
              <span>Broadcast TV</span>
              <span className="tab-badge">{activeTable === 'broadcast_television' ? filteredData.length : ''}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} className="fade-in" />
      )}

      {/* Content */}
      <div style={styles.contentWrapper}>
        {/* Sidebar */}
        <aside 
          style={{
            ...styles.sidebar,
            ...(isMobile ? {
              ...styles.mobileSidebar,
              transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
            } : {})
          }}
          className="glass-morphism slide-in-left"
        >
          <div style={styles.sidebarContent}>
            <div style={styles.sidebarHeader}>
              <div style={styles.filterTitle}>
                <span style={styles.filterIcon}>🎯</span>
                <h3 style={styles.filterHeading}>Smart Filters</h3>
                {isMobile && (
                  <button 
                    style={styles.closeSidebar}
                    onClick={() => setSidebarOpen(false)}
                    className="close-button"
                  >
                    ✕
                  </button>
                )}
              </div>
              <p style={styles.filterSubtext}>
                Refine your {activeTable.replace('_', ' ')} analysis
              </p>
            </div>

            <div style={styles.filtersContainer}>
              {activeTable === 'publication' ? (
                <>
                  <div style={styles.filterGroup} className="filter-card">
                    <label style={styles.filterLabel}>
                      <span>🔍</span> Search Publications
                    </label>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="Enter publication name..."
                      value={(currentFilters as Filters['publication']).search || ''}
                      onChange={(e) => updateFilters({ search: e.target.value })}
                      className="modern-input"
                    />
                  </div>

                  <div style={styles.filterGroup} className="filter-card">
                    <label style={styles.filterLabel}>
                      <span>💰</span> Minimum Price
                    </label>
                    <input
                      type="number"
                      style={styles.input}
                      placeholder="$ Min"
                      value={(currentFilters as Filters['publication']).minPrice || ''}
                      onChange={(e) => updateFilters({ minPrice: e.target.value })}
                      className="modern-input"
                    />
                  </div>

                  <div style={styles.filterGroup} className="filter-card">
                    <label style={styles.filterLabel}>
                      <span>📊</span> Maximum Price: <span style={styles.priceDisplay}>${(currentFilters as Filters['publication']).maxPrice || 100000}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="100"
                      value={(currentFilters as Filters['publication']).maxPrice || 100000}
                      onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                      style={styles.slider}
                      className="modern-slider"
                    />
                  </div>

                  <div style={styles.filterGroup} className="filter-card">
                    <label style={styles.filterLabel}>
                      <span>🌍</span> Region
                    </label>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="Enter region..."
                      value={(currentFilters as Filters['publication']).region || ''}
                      onChange={(e) => updateFilters({ region: e.target.value })}
                      className="modern-input"
                    />
                  </div>
                </>
              ) : activeTable === 'television' ? (
                <div style={styles.filterGroup} className="filter-card">
                  <label style={styles.filterLabel}>
                    <span>📞</span> Search Call Signs
                  </label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="Enter call sign..."
                    value={(currentFilters as Filters['television']).search || ''}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="modern-input"
                  />
                </div>
              ) : (
                <div style={styles.filterGroup} className="filter-card">
                  <label style={styles.filterLabel}>
                    <span>📡</span> Search Call Signs
                  </label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="Enter call sign..."
                    value={(currentFilters as Filters['broadcast_television']).callSign || ''}
                    onChange={(e) => updateFilters({ callSign: e.target.value })}
                    className="modern-input"
                  />
                </div>
              )}

              <div style={styles.filterGroup}>
                <button
                  style={styles.clearButton}
                  className="clear-button glow-on-hover"
                  onClick={() => {
                    if (activeTable === 'publication') {
                      updateFilters({ search: '', minPrice: '', maxPrice: '', region: '' });
                    } else if (activeTable === 'television') {
                      updateFilters({ search: '' });
                    } else if (activeTable === 'broadcast_television') {
                      updateFilters({ callSign: '' });
                    }
                  }}
                >
                  <span>🗑️</span> Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main style={styles.container}>
          {loading ? (
            <div style={styles.loadingContainer} className="loading-pulse">
              <div style={styles.loadingContent}>
                <div style={styles.spinner} className="spinning"></div>
                <h3 style={styles.loadingTitle}>Loading Analytics</h3>
                <p style={styles.loadingText}>Fetching {activeTable.replace('_', ' ')} data...</p>
              </div>
            </div>
          ) : (
            <div style={styles.tableContainer} className="fade-in-up">
              <div style={styles.tableHeader}>
                <h2 style={styles.tableTitle}>
                  {activeTable === 'publication' ? '📰 Publications' : 
                   activeTable === 'television' ? '📺 Television' : '📡 Broadcast TV'} Analytics
                </h2>
                <div style={styles.tableStats}>
                  <span style={styles.resultCount}>{filteredData.length} results found</span>
                </div>
              </div>
              <div style={styles.tableWrapper} className="glass-morphism">
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {filteredData[0] && Object.keys(filteredData[0]).map((header: string) =>
                        header !== 'url' && header !== 'logo' && (
                          <th key={header} style={styles.headerCell} className="table-header">
                            {formatHeader(header)}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((row: DataItem, idx: number) => (
                        <tr key={idx} style={styles.row} className="table-row">
                          {Object.keys(row).map((key: string, i: number) => {
                            if (key === 'url' || key === 'logo') return null;

                            if (key === 'example' && row.example) {
                              return (
                                <td key={i} style={styles.cell}>
                                  <a
                                    href={`https://cdn.sanity.io/images/8n90kyzz/production/${row.example}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={styles.exampleLink}
                                    className="image-preview"
                                  >
                                    <div style={styles.imageContainer}>
                                      <span>🖼️</span>
                                    </div>
                                  </a>
                                </td>
                              );
                            }

                            const cellValue = row[key as keyof DataItem];

                            return (
                              <td key={i} style={styles.cell}>
                                {key === 'name' && row.url ? (
                                  <div style={styles.nameCell}>
                                    {row.logo && (
                                      <img
                                        src={`https://cdn.sanity.io/images/8n90kyzz/production/${row.logo}`}
                                        alt="logo"
                                        style={styles.logoImage}
                                        className="logo-hover"
                                      />
                                    )}
                                    <a href={row.url} target="_blank" rel="noopener noreferrer" style={styles.link} className="name-link">
                                      {cellValue}
                                    </a>
                                  </div>
                                ) : key === 'price' || key === 'rate' ? (
                                  <div style={styles.priceCell}>
                                    <span style={styles.currency}>$</span>
                                    <span style={styles.amount}>{cellValue}</span>
                                  </div>
                                ) : (
                                  <div style={styles.regularCell}>
                                    {cellValue}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={Object.keys(filteredData[0] || {}).length} style={styles.emptyCell}>
                          <div style={styles.emptyState}>
                            <span style={styles.emptyIcon}>📭</span>
                            <h3 style={styles.emptyTitle}>No Results Found</h3>
                            <p style={styles.emptyText}>Try adjusting your filters to see more data</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      <footer style={styles.footer} className="glass-morphism">
        <div style={styles.footerContent}>
          <div style={styles.footerLeft}>
            <p style={styles.copyright}>© 2025 MediaMetrics. All rights reserved.</p>
          </div>
          <div style={styles.footerRight}>
            <a href="#" style={styles.footerLink} className="footer-link">Privacy Policy</a>
            <a href="#" style={styles.footerLink} className="footer-link">Terms of Service</a>
            <a href="#" style={styles.footerLink} className="footer-link">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: { 
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh', 
    display: 'flex', 
    flexDirection: 'column' as const,
    position: 'relative' as const,
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem 3rem',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
    borderRadius: '0 0 2rem 2rem',
    margin: '0 1rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoIcon: {
    fontSize: '2.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
  },
  logoText: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  brandName: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },
  tagline: {
    margin: 0,
    fontSize: '0.9rem',
    color: 'rgba(102, 126, 234, 0.8)',
    fontWeight: '500',
  },
  mobileMenuButton: {
    padding: '0.75rem 1.5rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    color: '#667eea',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  statsContainer: {
    display: 'flex',
    gap: '1rem',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '0.5rem 1rem',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
  },
  statNumber: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#667eea',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: 'rgba(102, 126, 234, 0.8)',
    fontWeight: '500',
  },
  logoutButton: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)',
  },
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 500,
    backdropFilter: 'blur(5px)',
  },
  navigation: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '1.5rem 3rem',
    margin: '1rem',
    borderRadius: '1.5rem',
    position: 'sticky' as const,
    top: '120px',
    zIndex: 900,
  },
  navContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    alignItems: 'center',
  },
  navTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center' as const,
  },
  navTabs: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
  },
  navTab: {
    padding: '1rem 2rem',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    position: 'relative' as const,
    backdropFilter: 'blur(10px)',
    minWidth: '160px',
    justifyContent: 'center',
  },
  activeTab: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)',
    color: '#fff',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 32px rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  contentWrapper: { 
    display: 'flex', 
    flex: 1, 
    gap: '2rem',
    padding: '2rem',
    position: 'relative' as const,
  },
  sidebar: {
    width: '350px',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    height: 'fit-content',
    maxHeight: 'calc(100vh - 300px)',
    overflowY: 'auto' as const,
    position: 'sticky' as const,
    top: '200px',
    flexShrink: 0,
  },
  mobileSidebar: {
    position: 'fixed' as const,
    top: '200px',
    left: '2rem',
    zIndex: 600,
    transform: 'translateX(-100%)',
    width: '320px',
  },
  sidebarContent: {
    padding: '2rem',
  },
  sidebarHeader: {
    marginBottom: '2rem',
    textAlign: 'center' as const,
  },
  filterTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  filterIcon: {
    fontSize: '1.5rem',
  },
  filterHeading: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#fff',
  },
  closeSidebar: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#fff',
    fontSize: '1.2rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginLeft: 'auto',
  },
  filterSubtext: {
    margin: 0,
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '400',
  },
  filtersContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  filterGroup: { 
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    fontSize: '0.9rem',
    marginBottom: '0.75rem',
    color: '#fff',
  },
  input: { 
    width: '100%',
    padding: '0.875rem 1.25rem',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    outline: 'none',
    backdropFilter: 'blur(10px)',
    fontWeight: '500',
  },
  priceDisplay: {
    color: '#4ade80',
    fontWeight: '700',
    fontSize: '1rem',
  },
  slider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: 'rgba(255, 255, 255, 0.2)',
    outline: 'none',
    appearance: 'none' as const,
  },
  container: { 
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem',
    minHeight: 'calc(100vh - 300px)',
  },
  tableContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
    flex: 1,
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1rem',
  },
  tableTitle: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#fff',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  tableStats: {
    display: 'flex',
    alignItems: 'center',
  },
  resultCount: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
  },
  tableWrapper: { 
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(20px)',
    overflow: 'hidden',
    flex: 1,
    maxHeight: 'calc(100vh - 400px)',
    overflowY: 'auto' as const,
  },
  table: { 
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  headerCell: { 
    padding: '1.5rem',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%)',
    color: '#fff',
    textAlign: 'left' as const,
    position: 'sticky' as const,
    top: 0,
    zIndex: 10,
    fontSize: '0.9rem',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
  },
  row: { 
    transition: 'all 0.3s ease',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    cursor: 'pointer',
  },
  cell: { 
    padding: '1.25rem 1.5rem',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.9rem',
    lineHeight: '1.6',
    verticalAlign: 'middle' as const,
  },
  nameCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    minWidth: '200px',
  },
  logoImage: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    objectFit: 'cover' as const,
    flexShrink: 0,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  link: {
    color: '#4ade80',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  priceCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontWeight: '600',
  },
  currency: {
    color: '#4ade80',
    fontSize: '0.8rem',
  },
  amount: {
    color: '#fff',
    fontSize: '1rem',
  },
  regularCell: {
    minWidth: '120px',
    wordBreak: 'break-word' as const,
  },
  exampleLink: {
    display: 'inline-block',
    transition: 'all 0.3s ease',
  },
  imageContainer: {
    width: '40px',
    height: '40px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
  },
  emptyCell: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1rem',
  },
  emptyIcon: {
    fontSize: '3rem',
    opacity: 0.5,
  },
  emptyTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyText: {
    margin: 0,
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  clearButton: {
    width: '100%',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: '400px',
  },
  loadingContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2rem',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '4rem',
    borderRadius: '24px',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '4px solid rgba(255, 255, 255, 0.2)',
    borderTop: '4px solid #4ade80',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingTitle: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#fff',
  },
  loadingText: {
    margin: 0,
    fontSize: '1rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  footer: { 
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    margin: '2rem 1rem 1rem',
    borderRadius: '1.5rem',
    padding: '2rem 3rem',
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
  },
  copyright: {
    margin: 0,
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  footerRight: {
    display: 'flex',
    gap: '2rem',
  },
  footerLink: { 
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
};

const animationStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideDown {
  from { 
    opacity: 0; 
    transform: translateY(-50px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes slideInLeft {
  from { 
    opacity: 0; 
    transform: translateX(-50px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
}

@keyframes fadeInUp {
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes pulse {
  0%, 100% { 
    transform: scale(1); 
  }
  50% { 
    transform: scale(1.05); 
  }
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0px); 
  }
  50% { 
    transform: translateY(-20px); 
  }
}

@keyframes glow {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.5); 
  }
  50% { 
    box-shadow: 0 0 40px rgba(102, 126, 234, 0.8); 
  }
}

/* Floating background shapes */
.floating-shapes {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  top: 80%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  top: 30%;
  right: 30%;
  animation-delay: 1s;
}

/* Glass morphism effect */
.glass-morphism {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Animation classes */
.slide-down {
  animation: slideDown 0.8s ease-out;
}

.slide-in-left {
  animation: slideInLeft 0.6s ease-out;
}

.fade-in {
  animation: fadeIn 0.5s ease-out;
}

.fade-in-up {
  animation: fadeInUp 0.8s ease-out;
}

.pulse {
  animation: pulse 2s infinite;
}

.spinning {
  animation: spin 1s linear infinite;
}

.loading-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Hover effects */
.floating-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 40px rgba(255, 255, 255, 0.2);
}

.glow-on-hover:hover {
  animation: glow 1s ease-in-out infinite;
  transform: scale(1.05);
}

.mobile-menu-hover:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-2px);
}

.logout-hover:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 30px rgba(255, 107, 107, 0.5);
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: rotate(90deg);
}

.filter-card:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.1);
}

.modern-input:focus {
  border-color: #4ade80 !important;
  box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.2) !important;
  background: rgba(255, 255, 255, 0.15) !important;
  transform: translateY(-1px);
}

.modern-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(74, 222, 128, 0.4);
  transition: all 0.3s ease;
}

.modern-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 15px rgba(74, 222, 128, 0.6);
}

.modern-slider::-webkit-slider-track {
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
}

.clear-button:hover {
  background: linear-gradient(135deg, #ee5a24 0%, #c0392b 100%) !important;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
}

.nav-tab:hover:not([data-active="true"]) {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.15);
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-badge {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: #fff;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
}

.table-header {
  position: relative;
  overflow: hidden;
}

.table-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.table-header:hover::before {
  left: 100%;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.1);
}

.table-row:nth-child(even) {
  background: rgba(255, 255, 255, 0.05);
}

.table-row:nth-child(even):hover {
  background: rgba(255, 255, 255, 0.1);
}

.logo-hover:hover {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
}

.name-link:hover {
  color: #22c55e !important;
  text-decoration: underline;
}

.image-preview:hover .image-container {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.footer-link:hover {
  color: #4ade80 !important;
  text-decoration: underline;
  transform: translateY(-2px);
}

.logout-popup {
  display: none;
  position: absolute;
  top: 110%;
  right: 0;
  background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
  color: #667eea;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: fadeInUp 0.3s ease-out;
  white-space: nowrap;
  z-index: 9999;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.logout-hover:hover + .logout-popup {
  display: block;
}

/* Responsive design */
@media (max-width: 1024px) {
  .contentWrapper {
    flex-direction: column;
    gap: 1rem;
  }
  
  .sidebar {
    width: 100% !important;
    position: static !important;
    max-height: 400px;
  }
  
  .floating-shapes {
    display: none;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 1rem 1.5rem !important;
    margin: 0 0.5rem !important;
    border-radius: 0 0 1rem 1rem !important;
  }
  
  .navigation {
    padding: 1rem 1.5rem !important;
    margin: 0.5rem !important;
    border-radius: 1rem !important;
  }
  
  .navTabs {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }
  
  .navTab {
    min-width: auto !important;
    padding: 0.75rem 1rem !important;
  }
  
  .contentWrapper {
    padding: 1rem !important;
  }
  
  .footer {
    margin: 1rem 0.5rem 0.5rem !important;
    padding: 1.5rem !important;
  }
  
  .footerContent {
    flex-direction: column;
    text-align: center;
  }
  
  .headerLeft {
    flex-direction: column;
    gap: 1rem !important;
  }
  
  .headerRight {
    flex-direction: column;
    gap: 1rem !important;
  }
}

@media (max-width: 480px) {
  .logoContainer {
    flex-direction: column;
    text-align: center;
  }
  
  .brandName {
    font-size: 1.4rem !important;
  }
  
  .tableTitle {
    font-size: 1.3rem !important;
  }
  
  .sidebarContent {
    padding: 1.5rem !important;
  }
  
  .filterGroup {
    padding: 1rem !important;
  }
}
`;
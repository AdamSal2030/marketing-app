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
      // Television: Only filter by Calls column using the search filter
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

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src="https://pricing.ascendagency.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F8n90kyzz%2Fproduction%2F2d6f32c86f9c769c3657299a40ee3dba591af66d-1200x1200.png%3Fw%3D100%26h%3D100&w=256&q=75" alt="Logo" style={styles.logo} />
          {isMobile && (
            <button 
              style={styles.mobileMenuButton}
              onClick={toggleSidebar}
              className="mobile-menu-hover"
            >
              🔍 Filters
            </button>
          )}
        </div>
        <button style={styles.logoutButton} className="logout-hover">Logout</button>
        <div className="logout-popup">😢 Tussi ja rhe hoo?</div>
      </header>

      {/* Navigation Section */}
      <nav style={styles.navigation}>
        <div style={styles.navTabs}>
          <button
            style={{
              ...styles.navTab,
              ...(activeTable === 'publication' ? styles.activeTab : {})
            }}
            data-active={activeTable === 'publication'}
            onClick={() => handleTableSwitch('publication')}
            className="nav-tab"
          >
            📰 Publications
          </button>
          <button
            style={{
              ...styles.navTab,
              ...(activeTable === 'television' ? styles.activeTab : {})
            }}
            data-active={activeTable === 'television'}
            onClick={() => handleTableSwitch('television')}
            className="nav-tab"
          >
            📺 Television
          </button>
          <button
            style={{
              ...styles.navTab,
              ...(activeTable === 'broadcast_television' ? styles.activeTab : {})
            }}
            data-active={activeTable === 'broadcast_television'}
            onClick={() => handleTableSwitch('broadcast_television')}
            className="nav-tab"
          >
            📡 Broadcast TV
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
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
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={styles.sidebarHeader}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>🔍 Filters</h3>
              {isMobile && (
                <button 
                  style={styles.closeSidebar}
                  onClick={() => setSidebarOpen(false)}
                >
                  ✕
                </button>
              )}
            </div>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
              Refine your {activeTable.replace('_', ' ')} search
            </p>
          </div>

          {activeTable === 'publication' ? (
            <>
              {/* Publication filters */}
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Search:</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Search publications..."
                  value={(currentFilters as Filters['publication']).search || ''}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Min Price:</label>
                <input
                  type="number"
                  style={styles.input}
                  placeholder="Min Price"
                  value={(currentFilters as Filters['publication']).minPrice || ''}
                  onChange={(e) => updateFilters({ minPrice: e.target.value })}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>
                  Max Price: ${(currentFilters as Filters['publication']).maxPrice || 100000}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100000"
                  step="100"
                  value={(currentFilters as Filters['publication']).maxPrice || 100000}
                  onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                  style={styles.slider}
                />
              </div>

              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Region:</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Region"
                  value={(currentFilters as Filters['publication']).region || ''}
                  onChange={(e) => updateFilters({ region: e.target.value })}
                />
              </div>
            </>
          ) : activeTable === 'television' ? (
            <>
              {/* Television filters - Only search calls */}
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Search Calls:</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Search calls..."
                  value={(currentFilters as Filters['television']).search || ''}
                  onChange={(e) => updateFilters({ search: e.target.value })}
                />
              </div>
            </>
          ) : (
            <>
              {/* Broadcast Television filters - Only callsign */}
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Search Callsign:</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Search callsign..."
                  value={(currentFilters as Filters['broadcast_television']).callSign || ''}
                  onChange={(e) => updateFilters({ callSign: e.target.value })}
                />
              </div>
            </>
          )}

          {/* Clear Filters Button */}
          <div style={styles.filterGroup}>
            <button
              style={styles.clearButton}
              className="clear-button"
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
              🗑️ Clear Filters
            </button>
          </div>
        </aside>

        <main style={styles.container}>
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading {activeTable.replace('_', ' ')} data...</p>
            </div>
          ) : (
            <div style={styles.tableContainer}>
              <div style={styles.tableWrapper}>
                <table style={styles.table} className="fade-in">
                  <thead>
                    <tr>
                      {filteredData[0] && Object.keys(filteredData[0]).map((header: string) =>
                        header !== 'url' && header !== 'logo' && (
                          <th key={header} style={styles.headerCell}>
                            {formatHeader(header)}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((row: DataItem, idx: number) => (
                        <tr key={idx} style={styles.row}>
                          {Object.keys(row).map((key: string, i: number) => {
                            if (key === 'url' || key === 'logo') return null;

                            if (key === 'example' && row.example) {
                              return (
                                <td key={i} style={styles.cell}>
                                  <a
                                    href={`https://cdn.sanity.io/images/8n90kyzz/production/${row.example}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ display: 'inline-block' }}
                                  >
                                    <img
                                      src="/picture.png"
                                      alt="example"
                                      style={{ width: 40, height: 40, borderRadius: '4px', objectFit: 'cover' }}
                                    />
                                  </a>
                                </td>
                              );
                            }

                            const cellValue = row[key as keyof DataItem];

                            return (
                              <td key={i} style={styles.cell}>
                                {key === 'name' && row.url ? (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '200px' }}>
                                    {row.logo && (
                                      <img
                                        src={`https://cdn.sanity.io/images/8n90kyzz/production/${row.logo}`}
                                        alt="logo"
                                        style={{ width: 30, height: 30, borderRadius: '2px', objectFit: 'cover', flexShrink: 0 }}
                                      />
                                    )}
                                    <a href={row.url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                                      {cellValue}
                                    </a>
                                  </div>
                                ) : (
                                  <div style={{ minWidth: key === 'name' ? '200px' : '120px', wordBreak: 'break-word' }}>
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
                        <td colSpan={Object.keys(filteredData[0] || {}).length} style={styles.cell}>
                          No {activeTable.replace('_', ' ')} data available
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

      <footer style={styles.footer}>
        <div style={styles.footerLeft}>© 2025 YourCompany</div>
        <div style={styles.footerRight}>
          <a href="#" style={styles.footerLink}>Terms & Services</a>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: { 
    fontFamily: 'Arial, sans-serif', 
    backgroundColor: '#f9fafb', 
    minHeight: '100vh', 
    display: 'flex', 
    flexDirection: 'column' as const,
    position: 'relative' as const
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    backgroundColor: '#1e3a8a',
    color: 'white',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logo: {
    height: 40,
    flexShrink: 0,
  },
  mobileMenuButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#1e3a8a',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, background-color 0.2s ease',
    whiteSpace: 'nowrap' as const,
  },
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 50,
    backdropFilter: 'blur(4px)',
  },
  navigation: {
    backgroundColor: '#ffffff',
    borderBottom: '2px solid #e5e7eb',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    position: 'sticky' as const,
    top: '72px',
    zIndex: 90,
    overflowX: 'auto' as const,
  },
  navTabs: {
    display: 'flex',
    gap: '0.5rem',
    minWidth: 'fit-content',
  },
  navTab: {
    padding: '0.75rem 1.5rem',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    color: '#6b7280',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    outline: 'none',
    whiteSpace: 'nowrap' as const,
  },
  activeTab: {
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    borderColor: '#1e3a8a',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(30, 58, 138, 0.3)',
  },
  contentWrapper: { 
    display: 'flex', 
    flex: 1, 
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  sidebar: {
    width: '300px',
    padding: '2rem',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1d3461 100%)',
    color: '#fff',
    borderRight: '1px solid #e5e7eb',
    boxShadow: '4px 0 16px rgba(0,0,0,0.1)',
    height: 'calc(100vh - 144px)',
    position: 'sticky' as const,
    top: '144px',
    overflowY: 'auto' as const,
    transition: 'all 0.3s ease',
    flexShrink: 0,
  },
  mobileSidebar: {
    position: 'fixed' as const,
    top: '144px',
    left: 0,
    height: 'calc(100vh - 144px)',
    zIndex: 60,
    transform: 'translateX(-100%)',
    width: '280px',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  closeSidebar: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    color: '#fff',
    fontSize: '1.2rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  filterGroup: { 
    marginBottom: '2rem', 
    display: 'flex', 
    flexDirection: 'column' as const, 
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    backdropFilter: 'blur(10px)',
  },
  filterLabel: {
    fontWeight: '600',
    fontSize: '0.95rem',
    marginBottom: '0.25rem',
    display: 'block',
  },
  input: { 
    padding: '0.75rem', 
    borderRadius: '8px', 
    border: '2px solid #e5e7eb',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  },
  container: { 
    flex: 1, 
    padding: '2rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    minHeight: 'calc(100vh - 144px)',
    overflow: 'hidden' as const,
  },
  tableContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  tableWrapper: { 
    flex: 1,
    overflowX: 'auto' as const,
    overflowY: 'auto' as const,
    borderRadius: '12px', 
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
    maxHeight: 'calc(100vh - 200px)'
  },
  table: { 
    width: '100%', 
    minWidth: '600px',
    borderCollapse: 'collapse' as const, 
    backgroundColor: '#fff', 
    animation: 'slideInUp 0.6s ease-out',
  },
  headerCell: { 
    padding: '1.25rem', 
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
    color: '#fff', 
    textAlign: 'left' as const, 
    position: 'sticky' as const, 
    top: 0, 
    zIndex: 10,
    fontSize: '1rem',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap' as const,
  },
  row: { 
    transition: 'all 0.3s ease', 
    cursor: 'pointer',
    borderBottom: '1px solid #f1f5f9',
  },
  cell: { 
    padding: '1rem 1.25rem', 
    color: '#334155',
    fontSize: '0.80rem',
    lineHeight: '1.5',
    verticalAlign: 'top' as const,
  },
  footer: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '1rem 2rem', 
    backgroundColor: '#1e3a8a', 
    color: '#ffffff',
    flexWrap: 'wrap' as const,
    gap: '1rem',
  },
  footerLeft: { fontSize: '0.9rem' },
  footerRight: { fontSize: '0.9rem' },
  footerLink: { 
    color: '#ffffff', 
    textDecoration: 'underline', 
    transition: 'opacity 0.2s ease' 
  },
  slider: {
    width: '100%',
    accentColor: '#1e3a8a',
  },
  clearButton: {
    padding: '0.875rem 1.25rem',
    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem',
    color: '#64748b',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '12px',
    margin: '2rem',
    backdropFilter: 'blur(10px)',
  },
  spinner: {
    width: '48px',
    height: '48px',
    borderWidth: '4px',
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
    borderTopColor: '#1e3a8a',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1.5rem',
  },
  link: {
    color: '#1e3a8a',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    wordBreak: 'break-word' as const,
  },
};

const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInUp {
  from { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

/* Enhanced hover effects */
tbody tr {
  transition: all 0.3s ease;
}

tbody tr:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

tbody tr:nth-child(even) {
  background-color: rgba(248, 250, 252, 0.5);
}

tbody tr:nth-child(even):hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
}

/* Input focus effects */
input:focus, select:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  transform: translateY(-1px);
}

/* Button hover effects */
.logout-hover:hover {
  transform: scale(1.05);
  background-color: #dc2626 !important;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

.mobile-menu-hover:hover {
  background-color: rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-1px);
}

.logout-popup {
  display: none;
  position: absolute;
  top: 130%;
  right: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  color: #1e3a8a;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideInUp 0.3s ease-out;
  white-space: nowrap;
  z-index: 999;
  border: 1px solid #e2e8f0;
}

.logout-hover:hover + .logout-popup {
  display: block;
}

.nav-tab:hover:not([data-active="true"]) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.clear-button:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 12px -2px rgba(220, 38, 38, 0.4);
}

.close-sidebar:hover {
  background-color: rgba(255, 255, 255, 0.3) !important;
}

/* Filter group animations */
.filter-group {
  transition: all 0.3s ease;
}

.filter-group:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
  transform: translateY(-1px);
}

/* Link hover effects */
a:hover {
  color: #3b82f6 !important;
  text-decoration: underline;
}

/* Slider styling */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(30, 58, 138, 0.3);
}

input[type="range"]::-webkit-slider-track {
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%);
}

/* Responsive styles */
@media (max-width: 1024px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100% !important;
    height: auto !important;
    position: static !important;
    border-right: none !important;
    border-bottom: 2px solid #e2e8f0;
    max-height: 320px;
    overflow-y: auto;
  }
  
  .sidebar h3 {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
  }
  
  .filter-group {
    margin-bottom: 1.25rem !important;
  }
  
  .container {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
  }
}

@media (max-width: 768px) {
  .navigation {
    flex-direction: column;
    gap: 1.5rem;
    align-items: flex-start;
    padding: 1.25rem 1rem;
  }
  
  .nav-tabs {
    width: 100%;
    justify-content: center;
  }
  
  .nav-tab {
    flex: 1;
    justify-content: center;
    padding: 0.875rem 1rem;
  }
  
  .sidebar {
    padding: 1.5rem !important;
  }
  
  .container {
    padding: 1.5rem !important;
  }
  
  .table-wrapper {
    margin: 0 -0.5rem;
  }
}

@media (max-width: 600px) {
  header {
    flex-direction: column;
    align-items: flex-start;
  }

  .logout-popup {
    right: auto;
    left: 0;
  }
  
  .nav-tabs {
    flex-direction: column;
    width: 100%;
  }
  
  .sidebar {
    max-height: 250px !important;
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  
  .filter-group label {
    font-size: 0.9rem;
  }
  
  .input, .slider {
    font-size: 0.9rem;
    padding: 0.4rem;
  }
}
`;
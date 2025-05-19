'use client';

import { useEffect, useState } from 'react';

// Function to format headers into a readable format (e.g., 'name' to 'Name')
const formatHeader = (header) => {
  return header
    .split('_') // Split by underscores
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' '); // Join words with spaces
};

export default function Page() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ publication: '', minPrice: '', maxPrice: '', region: '' });

  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then((fetchedData) => {
        console.log(fetchedData);
        setData(fetchedData);
      });
  }, []);

  const filteredData = data.filter((item) => {
    const pubMatch = item.name?.toLowerCase().includes(filters.publication.toLowerCase());
    const price = item.price;
    const maxMatch = filters.maxPrice === '' || price <= parseFloat(filters.maxPrice);
    const regionMatch =
      filters.region === '' ||
      new RegExp(filters.region, 'i').test(item.regions); // updated line
  
    return pubMatch && price >= 0 && maxMatch && regionMatch;
  });
  
  console.log(filteredData); // Log filtered data to check its structure

  return (
    <div style={styles.page}>
      <style>{animationStyles}</style>

      {/* Header */}
      <header style={styles.header}>
        <img src="https://pricing.ascendagency.com/_next/image?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F8n90kyzz%2Fproduction%2F2d6f32c86f9c769c3657299a40ee3dba591af66d-1200x1200.png%3Fw%3D100%26h%3D100&w=256&q=75" alt="Logo" style={styles.logo} />
        <button style={styles.logoutButton} className="logout-hover">Logout</button>
        <div className="logout-popup">😢 Tussi ja rhe hoo?</div>
      </header>

      {/* Content */}
      <div style={styles.contentWrapper}>
        <aside style={styles.sidebar}>
          <h3>🔍 Filters</h3>

          <div style={styles.filterGroup}>
            <label>Publication:</label>
            <input
              type="text"
              style={styles.input}
              onChange={(e) => setFilters({ ...filters, publication: e.target.value })}
            />
          </div>

          <div style={styles.filterGroup}>
            <label>Price Range: 0 - {filters.maxPrice || 100000}</label>
            <input
              type="range"
              min="0"
              max="100000"
              step="100"
              value={filters.maxPrice || 100000}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              style={styles.slider}
            />
          </div>

          <div style={styles.filterGroup}>
            <label>Region:</label>
            <select
              style={styles.input}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            >
              <option value="">Any</option>
              <option value="Global">Global</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="United States">United States</option>
              <option value="Louisiana">Louisiana</option>
              <option value="South Carolina">South Carolina</option>
              <option value="India">India</option>
              <option value="Montana">Montana</option>
              <option value="Texas">Texas</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Virginia">Virginia</option>
              <option value="Tennessee">Tennessee</option>
              <option value="Florida">Florida</option>
              <option value="Wisconsin">Wisconsin</option>
              <option value="Turkey">Turkey</option>
              <option value="Oregon">Oregon</option>
              <option value="Minnesota">Minnesota</option>
              <option value="Idaho">Idaho</option>
              <option value="Delaware">Delaware</option>
              <option value="Ghana">Ghana</option>
              <option value="Arizona">Arizona</option>
            </select>
          </div>
        </aside>

        <main style={styles.container}>
          <div style={styles.tableWrapper}>
          <table style={styles.table} className="fade-in">
           <thead>
              <tr>
                {filteredData[0] && Object.keys(filteredData[0]).map((header) =>
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
                filteredData.map((row, idx) => (
                  <tr key={idx} style={styles.row}>
                    {Object.keys(row).map((key, i) => {
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

                      return (
                        <td key={i} style={styles.cell}>
                          {key === 'name' && row.url ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {row.logo && (
                                <img
                                  src={`https://cdn.sanity.io/images/8n90kyzz/production/${row.logo}`}
                                  alt="logo"
                                  style={{ width: 30, height: 30, borderRadius: '2px', objectFit: 'cover' }}
                                />
                              )}
                              <a href={row.url} target="_blank" rel="noopener noreferrer" style={styles.link}>
                                {row[key]}
                              </a>
                            </div>
                          ) : (
                            row[key]
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={Object.keys(filteredData[0] || {}).length} style={styles.cell}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
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

// Your existing styles
const styles = {
  page: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column' as const },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    backgroundColor: '#1e3a8a',
    color: 'white',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logo: {
    height: 40,
    marginBottom: '0.5rem',
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
    whiteSpace: 'nowrap',
  },
  contentWrapper: { display: 'flex', flex: 1 },
  sidebar: {
    width: '250px',
    padding: '1.5rem',
    backgroundColor: '#1d3461',
    color: '#fff',
    borderRight: '1px solid #e5e7eb',
    boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
    height: '100vh',
    position: 'sticky',
    top: '80px', // adjust if your header is taller
    overflowY: 'auto',
  },
  filterGroup: { marginBottom: '1.5rem', display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' },
  input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db' },
  container: { flex: 1, padding: '2rem' },
  tableWrapper: { overflowX: 'auto', borderRadius: '8px', boxShadow: '0 0 20px rgba(0,0,0,0.05)' },
  table: { width: '100%', minWidth: 600, borderCollapse: 'collapse' as const, backgroundColor: '#fff', animation: 'fadeIn 0.7s ease-out' },
  headerCell: { padding: '1rem', backgroundColor: '#1e3a8a', color: '#fff', textAlign: 'left' as const, position: 'sticky', top: 0, zIndex: 1 },
  row: { transition: 'background-color 0.3s', cursor: 'pointer' },
  cell: { padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', color: '#333' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#1e3a8a', color: '#ffffff' },
  footerLeft: { fontSize: '0.9rem' },
  footerRight: { fontSize: '0.9rem' },
  footerLink: { color: '#ffffff', textDecoration: 'underline', transition: 'opacity 0.2s ease' },
  slider: {
    width: '100%',
    accentColor: '#1e3a8a',
  }
};

const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

tbody tr:hover {
  background-color: rgb(147, 156, 173);
}

.logout-hover:hover {
  transform: scale(1.1);
  background-color: #dc2626;
}

.logout-popup {
  display: none;
  position: absolute;
  top: 130%;
  right: 0;
  background-color: #ffffff;
  color: #1e3a8a;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: fadeIn 0.3s ease-out;
  white-space: nowrap;
  z-index: 999;
}

.logout-hover:hover + .logout-popup {
  display: block;
}

/* Responsive styles */
@media (max-width: 600px) {
  header {
    flex-direction: column;
    align-items: flex-start;
  }

  .logout-popup {
    right: auto;
    left: 0;
  }

  aside {
    position: static !important;
    height: auto !important;
  }
}
`;


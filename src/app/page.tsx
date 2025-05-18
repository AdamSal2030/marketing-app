import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'

export default function Page() {
  const filePath = path.join(process.cwd(), 'data', 'data.csv')
  const fileContent = fs.readFileSync(filePath, 'utf8')

  const parsed = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  })

  const data = parsed.data

  return (
    <div style={styles.page}>
      <style>{animationStyles}</style>

      {/* Header */}
      <header style={styles.header}>
        <img src="vercel.svg" alt="Logo" style={styles.logo} />
        <button style={styles.logoutButton} className="logout-hover">
          Logout
        </button>
      </header>

      {/* Content Wrapper */}
      <div style={styles.contentWrapper}>
        {/* Sidebar Filters */}
        <aside style={styles.sidebar}>
          <h3>🔍 Filters</h3>

          <div style={styles.filterGroup}>
            <label>Publication:</label>
            <input type="text" placeholder="Search by name" style={styles.input} />
          </div>

          <div style={styles.filterGroup}>
            <label>Price Range:</label>
            <input type="number" placeholder="Min Price" style={styles.input} />
            <input type="number" placeholder="Max Price" style={styles.input} />
          </div>

          <div style={styles.filterGroup}>
            <label>Region:</label>
            <select style={styles.input}>
              <option value="">Any</option>
              <option value="US">US</option>
              <option value="UK">UK</option>
              <option value="Global">Global</option>
            </select>
          </div>
        </aside>

        {/* Main Table Section */}
        <main style={styles.container}>
          <div style={styles.tableWrapper}>
            <table style={styles.table} className="fade-in">
              <thead>
                <tr>
                  {data.length > 0 &&
                    Object.keys(data[0]).map((header) => (
                      <th key={header} style={styles.headerCell}>
                        {header}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} style={styles.row}>
                    {Object.values(row).map((val, i) => (
                      <td key={i} style={styles.cell}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerLeft}>© 2025 YourCompany</div>
        <div style={styles.footerRight}>
          <a href="#" style={styles.footerLink}>Terms & Services</a>
        </div>
      </footer>
    </div>
  )
}

const styles = {
  page: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1e3a8a',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logo: {
    height: 40,
    marginRight: '1rem',
  },
  logoutButton: {
    marginLeft: 'auto',
    padding: '0.5rem 1rem',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, background-color 0.2s ease',
  },
  contentWrapper: {
    display: 'flex',
    flex: 1,
  },
  sidebar: {
    width: '250px',
    padding: '1.5rem',
    backgroundColor: '#1d3461',
    color: '#fff',
    borderRight: '1px solid #e5e7eb',
    boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
  },
  filterGroup: {
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  input: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
  },
  container: {
    flex: 1,
    padding: '2rem',
  },
  tableWrapper: {
    overflowX: 'auto',
    borderRadius: '8px',
    boxShadow: '0 0 20px rgba(0,0,0,0.05)',
  },
  table: {
    width: '100%',
    minWidth: 600,
    borderCollapse: 'collapse' as const,
    backgroundColor: '#fff',
    animation: 'fadeIn 0.7s ease-out',
  },
  headerCell: {
    padding: '1rem',
    backgroundColor: '#1e3a8a',
    color: '#fff',
    textAlign: 'left' as const,
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  row: {
    transition: 'background-color 0.3s',
    cursor: 'pointer',
  },
  cell: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #e5e7eb',
    color: '#333',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1e3a8a',
    color: '#ffffff',
    borderTop: '1px solid #e5e7eb',
  },
  footerLeft: {
    fontSize: '0.9rem',
  },
  footerRight: {
    fontSize: '0.9rem',
  },
  footerLink: {
    color: '#ffffff',
    textDecoration: 'underline',
    transition: 'opacity 0.2s ease',
  },
}

const animationStyles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
`

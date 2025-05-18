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

      <header style={styles.header}>
        <img src="vercel.svg" alt="Logo" style={styles.logo} />
        <button style={styles.logoutButton} className="logout-hover">
          Logout
        </button>
      </header>

      {/* Table */}
      <div style={styles.container}>
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
      </div>
    </div>
  )
}

const styles = {
  page: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
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
  brand: {
    fontSize: '1.5rem',
    margin: 0,
  },
  container: {
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
    borderCollapse: 'collapse',
    backgroundColor: '#fff',
    animation: 'fadeIn 0.7s ease-out',
  },
  headerCell: {
    padding: '1rem',
    backgroundColor: '#2563eb',
    color: '#fff',
    textAlign: 'left',
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


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
    <div style={styles.container}>
      <style>{animationStyles}</style>
      <h1 style={styles.title}>📊 CSV Data Table</h1>
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
  )
}

const styles = {
  container: {
    padding: '2rem',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '1.5rem',
    color: '#333',
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
  animation: fadeIn 0.5s ease-in;
}

tbody tr:hover {
  background-color: #f0f9ff;
}
`

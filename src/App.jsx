import NorthAmericaRevenueChart from './components/NorthAmericaRevenueChart.jsx';

function App() {
  return (
    <div className="app">
      <h1>KPI Dashboard</h1>
      <h2>Key metrics analysis</h2>
      
      {/* North America Revenue Chart */}
      <div className="chart-container">
        <NorthAmericaRevenueChart />
      </div>
      
      <p>Dashboard features will be built by Epicraft agent.</p>
    </div>
  )
}

export default App
import NorthAmericaRevenueChart from './components/NorthAmericaRevenueChart.jsx';
import ActiveUsersCard from './components/ActiveUsersCard.jsx';

function App() {
  return (
    <div className="app">
      <h1>KPI Dashboard</h1>
      <h2>Key metrics analysis</h2>
      
      {/* Top row with metric cards */}
      <div className="metrics-row">
        <ActiveUsersCard />
      </div>
      
      {/* North America Revenue Chart */}
      <div className="chart-container">
        <NorthAmericaRevenueChart />
      </div>
      
      <p>Dashboard features will be built by Epicraft agent.</p>
    </div>
  )
}

export default App
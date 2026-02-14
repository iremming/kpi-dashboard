import RevenueByRegionTrendChart from './components/NorthAmericaRevenueChart.jsx';
import RevenueByRegionChart from './components/RevenueByRegionChart.jsx';
import ActiveUsersCard from './components/ActiveUsersCard.jsx';
import ChurnRateCard from './components/ChurnRateCard.jsx';

function App() {
  return (
    <div className="app">
      <h1>KPI Dashboard</h1>
      <h2>Key metrics analysis</h2>
      
      {/* Top row with metric cards */}
      <div className="metrics-row">
        <ActiveUsersCard />
        <ChurnRateCard />
      </div>
      
      {/* Charts container */}
      <div className="chart-container">
        <RevenueByRegionTrendChart />
      </div>
      
      <div className="chart-container">
        <RevenueByRegionChart />
      </div>
      
      <p>Dashboard features will be built by Epicraft agent.</p>
    </div>
  )
}

export default App
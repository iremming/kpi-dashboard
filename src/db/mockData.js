/**
 * Generate mock data for KPI dashboard
 * Creates realistic SaaS business growth data for 12 months (Jan 2025 - Dec 2025)
 */

/**
 * Generate monthly metrics data showing business growth
 * @returns {Array} Array of monthly metrics objects
 */
export function generateMonthlyMetrics() {
  const data = [];
  
  // Starting values for January 2025
  const baseDate = new Date('2025-01-01');
  let currentMRR = 50000; // Starting MRR: $50k
  let currentChurn = 3.5; // Starting churn rate: 3.5%
  let currentActiveUsers = 2500; // Starting active users
  
  for (let month = 0; month < 12; month++) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() + month, 1);
    
    // Calculate growth rates with some variance
    const mrrGrowthRate = 0.08 + (Math.random() * 0.04 - 0.02); // 6-10% monthly growth
    const userGrowthRate = 0.06 + (Math.random() * 0.03 - 0.015); // 4.5-7.5% user growth
    const churnReduction = 0.15; // 15% churn improvement per month
    
    // Update MRR (growing from $50k to ~$120k)
    currentMRR *= (1 + mrrGrowthRate);
    
    // Update churn rate (decreasing from 3.5% to ~1.8%)
    currentChurn *= (1 - churnReduction);
    if (currentChurn < 1.5) currentChurn = 1.5 + Math.random() * 0.5; // Floor at ~1.5%
    
    // Update active users
    currentActiveUsers *= (1 + userGrowthRate);
    
    // Calculate new signups (based on user growth and churn)
    const churnedUsers = Math.floor(currentActiveUsers * (currentChurn / 100));
    const netNewUsers = Math.floor(currentActiveUsers * userGrowthRate);
    const newSignups = Math.floor(netNewUsers + churnedUsers + (Math.random() * 100 - 50));
    
    data.push({
      date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      mrr: Math.round(currentMRR * 100) / 100, // Round to 2 decimals
      churn_rate: Math.round(currentChurn * 100) / 100, // Round to 2 decimals
      active_users: Math.floor(currentActiveUsers),
      new_signups: Math.max(0, newSignups) // Ensure non-negative
    });
  }
  
  return data;
}

/**
 * Generate revenue by region data for all months
 * @returns {Array} Array of revenue by region objects
 */
export function generateRevenueByRegion() {
  const regions = [
    { name: 'North America', share: 0.45, variance: 0.05 }, // 40-50%
    { name: 'Europe', share: 0.30, variance: 0.05 }, // 25-35%
    { name: 'Asia Pacific', share: 0.18, variance: 0.03 }, // 15-21%
    { name: 'Latin America', share: 0.07, variance: 0.02 } // 5-9%
  ];
  
  const monthlyMetrics = generateMonthlyMetrics();
  const data = [];
  
  monthlyMetrics.forEach(metric => {
    regions.forEach(region => {
      // Calculate regional share with some monthly variance
      const actualShare = region.share + (Math.random() * region.variance * 2 - region.variance);
      const revenue = metric.mrr * actualShare;
      
      data.push({
        date: metric.date,
        region: region.name,
        revenue: Math.round(revenue * 100) / 100 // Round to 2 decimals
      });
    });
  });
  
  return data;
}

/**
 * Generate all mock data for seeding
 * @returns {Object} Object containing all mock data arrays
 */
export function generateAllMockData() {
  return {
    monthlyMetrics: generateMonthlyMetrics(),
    revenueByRegion: generateRevenueByRegion()
  };
}
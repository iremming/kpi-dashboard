---
title: "Expand revenue analytics with multi-region support"
date: 2026-02-14
ticket: KPI-35
author: epicraft
status: draft
---
# Expand revenue analytics with multi-region support

We've enhanced the KPI Dashboard's revenue analytics by expanding the North America revenue chart to display data for all four regions: North America, Europe, Asia Pacific, and Latin America. This improvement provides stakeholders with a comprehensive view of global revenue performance trends.

The revenue line chart now displays four distinct trend lines, each color-coded by region for easy identification. North America maintains its original light blue styling, while Europe, Asia Pacific, and Latin America are represented in progressively darker blue shades. An interactive legend allows users to focus on specific regions by clicking to show/hide individual trend lines.

Behind the scenes, we updated the API endpoint to fetch revenue data for all regions and transformed the chart component to handle multi-region datasets. The chart maintains its responsive design and 12-month historical view, now showing comparative performance across all markets. This enhancement enables better strategic decision-making by revealing regional performance patterns and growth opportunities.

The update maintains backward compatibility while significantly expanding the analytical value of the dashboard. Teams can now quickly identify top-performing regions, spot seasonal trends across different markets, and make more informed decisions about resource allocation and market strategy.
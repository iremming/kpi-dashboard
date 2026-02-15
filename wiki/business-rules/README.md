# Business Rules

<!-- PMs: Document domain logic, feature requirements, and edge cases here -->
<!-- Epicraft reads these pages to understand the business context behind tickets -->

## Active Users Growth Calculation

- **Domain Logic:** The `ActiveUsersCard` component displays the total number of active users for the most recent month available in the `monthly_metrics` table.
- **Growth Metric:** It calculates the month-over-month growth percentage of active users based on the data from the last two months.
- **Formula:** `((current_month_users - previous_month_users) / previous_month_users) * 100`.
- **Edge Cases:**
    - If data for less than two months is available, the growth percentage defaults to 0%.
    - If `previous_month_users` is 0, growth is calculated as infinite or handled as a special case (currently defaults to 0% if percentage logic applies).
    - The API (`/api/active-users`) handles fetching the last two months of data and performing this calculation.

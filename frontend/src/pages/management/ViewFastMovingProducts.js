import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../includes/header';
import "../../css/css.css";
import "../../css/no-data.css";
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const ViewFastMovingProducts = () => {
    const [salesData, setSalesData] = useState([]);
    const [expenseData, setExpenseData] = useState([]);
    const [marketPriceData, setMarketPriceData] = useState([]);
    const [customerPreferences, setCustomerPreferences] = useState([]);
    const [activeTab, setActiveTab] = useState('sales');
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                // Fetch sales data from the API
                const salesResponse = await axios.get('http://localhost:5000/analytics/sales/monthly');
                setSalesData(salesResponse.data);

                // Set the most recent month as the default selected month
                if (salesResponse.data && salesResponse.data.length > 0) {
                    setSelectedMonth(salesResponse.data[salesResponse.data.length - 1].month);
                }

                // Fetch expense data from the API
                const expenseResponse = await axios.get('http://localhost:5000/analytics/expenses/monthly');
                setExpenseData(expenseResponse.data);

                // Fetch market price data from the API
                const marketResponse = await axios.get('http://localhost:5000/analytics/market-prices');
                setMarketPriceData(marketResponse.data);

                // Fetch customer preferences data from the API
                const preferencesResponse = await axios.get('http://localhost:5000/analytics/customer-preferences');
                setCustomerPreferences(preferencesResponse.data);
            } catch (error) {
                console.error('Error fetching analytics data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderSalesAnalytics = () => {
        if (salesData.length === 0) {
            return <div className="no-data-message">
                <p>No sales data available in the database.</p>
                <p>Please add some orders to see sales analytics.</p>
            </div>;
        }

        // Get the selected month's data
        const selectedMonthData = selectedMonth
            ? salesData.find(data => data.month === selectedMonth)
            : salesData[salesData.length - 1]; // Default to most recent month if none selected

        // Calculate order status counts - ensuring we have valid numbers by explicitly converting to integers
        const completedCount = parseInt(selectedMonthData.completedOrders || 0, 10);
        const processingCount = parseInt(selectedMonthData.processingOrders || 0, 10);
        const pendingCount = parseInt(selectedMonthData.pendingOrders || 0, 10);

        // Calculate total orders from the status counts
        const totalStatusCount = completedCount + processingCount + pendingCount;

        // Calculate percentages
        let completedPercent = 0;
        let processingPercent = 0;
        let pendingPercent = 0;

        if (totalStatusCount > 0) {
            completedPercent = (completedCount / totalStatusCount * 100).toFixed(1);
            processingPercent = (processingCount / totalStatusCount * 100).toFixed(1);
            pendingPercent = (pendingCount / totalStatusCount * 100).toFixed(1);
        }
        // Create pie chart data
        const pieChartData = [];
        if (completedCount > 0) pieChartData.push({ name: 'Completed', value: completedCount, percent: completedPercent });
        if (processingCount > 0) pieChartData.push({ name: 'Processing', value: processingCount, percent: processingPercent });
        if (pendingCount > 0) pieChartData.push({ name: 'Pending', value: pendingCount, percent: pendingPercent });

        const COLORS = ['#28a745', '#17a2b8', '#ffc107'];

        // Create a custom label formatter
        const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);

            return (
                <text
                    x={x}
                    y={y}
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="central"
                >
                    {`${name}: ${percent}%`}
                </text>
            );
        };

        return (
            <div className="analytics-section">
                <h2>Monthly Sales Breakdown</h2>

                {/* Month selector */}
                <div className="month-selector">
                    <label htmlFor="month-select">Select Month: </label>
                    <select
                        id="month-select"
                        value={selectedMonth || ''}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="form-select"
                    >
                        {salesData.map((data, index) => (
                            <option key={index} value={data.month}>{data.month}</option>
                        ))}
                    </select>
                </div>

                <table className="analytics-table">
                    <thead>
                    <tr>
                        <th>Month</th>
                        <th>Total Sales</th>
                        <th>Order Count</th>
                        <th>Completed Orders</th>
                        <th>Processing Orders</th>
                        <th>Pending Orders</th>
                        <th>Average Order Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    {salesData.map((monthData, index) => (
                        <tr key={index} className={monthData.month === selectedMonth ? 'selected-row' : ''}>
                            <td>{monthData.month}</td>
                            <td>${monthData.totalSales.toFixed(2)}</td>
                            <td>{monthData.orderCount}</td>
                            <td>{monthData.completedOrders || 0}</td>
                            <td>{monthData.processingOrders || 0}</td>
                            <td>{monthData.pendingOrders || 0}</td>
                            <td>${(monthData.totalSales / monthData.orderCount).toFixed(2)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <div className="sales-charts">
                    <div className="chart-container">
                        <h3>Monthly Sales Chart</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={salesData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => typeof value === 'number' ? ['$' + value.toFixed(2), 'Total Sales'] : ['$0.00', 'Total Sales']} />
                                <Legend />
                                <Bar dataKey="totalSales" name="Total Sales" fill="#3a6ea5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="chart-container">
                        <h3>Order Status Distribution for {selectedMonthData.month}</h3>
                        {pieChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={true}
                                        label={renderCustomizedLabel}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name, props) => {
                                            // Find the corresponding item to get its percent
                                            const item = pieChartData.find(item => item.name === name);
                                            return [`${value} (${item ? item.percent : 0}%)`, name];
                                        }}
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="no-data-message">
                                <p>No order status data available for {selectedMonthData.month}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderExpenseAnalytics = () => {
        if (expenseData.length === 0) {
            return <div className="no-data-message">
                <p>No expense data available in the database.</p>
                <p>Please add expenses to see expense analytics.</p>
            </div>;
        }

        // Group expenses by month
        const expensesByMonth = {};
        expenseData.forEach(expense => {
            if (!expensesByMonth[expense.month]) {
                expensesByMonth[expense.month] = [];
            }
            expensesByMonth[expense.month].push(expense);
        });

        // Calculate monthly totals - ensure we're working with numbers
        const monthlyTotals = {};
        Object.keys(expensesByMonth).forEach(month => {
            monthlyTotals[month] = expensesByMonth[month].reduce((total, expense) => {
                // Explicitly convert expense amount to a number
                let amount = 0;
                if (typeof expense.amount === 'string') {
                    amount = parseFloat(expense.amount) || 0;
                } else if (typeof expense.amount === 'number' && !isNaN(expense.amount)) {
                    amount = expense.amount;
                }
                return total + amount;
            }, 0);
        });

        return (
            <div className="analytics-section">
                <h2>Monthly Expense Breakdown</h2>

                {Object.keys(expensesByMonth).map(month => (
                    <div key={month} className="month-expense-section">
                        <h3>{month} - Total: ${typeof monthlyTotals[month] === 'number' ? monthlyTotals[month].toFixed(2) : '0.00'}</h3>
                        <table className="analytics-table">
                            <thead>
                            <tr>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Percentage</th>
                            </tr>
                            </thead>
                            <tbody>
                            {expensesByMonth[month].map((expense, index) => {
                                // Convert expense amount to a number
                                let expenseAmount = 0;
                                if (typeof expense.amount === 'string') {
                                    expenseAmount = parseFloat(expense.amount) || 0;
                                } else if (typeof expense.amount === 'number' && !isNaN(expense.amount)) {
                                    expenseAmount = expense.amount;
                                }

                                // Calculate percentage using numeric values
                                const monthTotal = monthlyTotals[month] || 0;
                                const percentage = monthTotal > 0 ? ((expenseAmount / monthTotal) * 100).toFixed(1) : '0.0';

                                return (
                                    <tr key={index}>
                                        <td>{expense.category}</td>
                                        <td>${expenseAmount.toFixed(2)}</td>
                                        <td>{percentage}%</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>

                        {/* Prepare chart data with proper numeric conversion */}
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={expensesByMonth[month].map(expense => {
                                        // Ensure we have numeric values for the chart
                                        let amount = 0;
                                        if (typeof expense.amount === 'string') {
                                            amount = parseFloat(expense.amount) || 0;
                                        } else if (typeof expense.amount === 'number' && !isNaN(expense.amount)) {
                                            amount = expense.amount;
                                        }

                                        return {
                                            ...expense,
                                            amount: amount // Override with guaranteed numeric value
                                        };
                                    })}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="category" />
                                    <YAxis domain={[0, 'dataMax + 500']} />
                                    <Tooltip formatter={(value) => typeof value === 'number' ? ['$' + value.toFixed(2), 'Amount'] : ['$0.00', 'Amount']} />
                                    <Legend />
                                    <Bar dataKey="amount" name="Expense Amount" fill="#ff6b6b" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}

                <div className="profit-loss-section">
                    <h3>Monthly Profit & Loss</h3>
                    <table className="analytics-table">
                        <thead>
                        <tr>
                            <th>Month</th>
                            <th>Total Sales</th>
                            <th>Total Expenses</th>
                            <th>Net Profit</th>
                            <th>Profit Margin</th>
                        </tr>
                        </thead>
                        <tbody>
                        {salesData.map((monthData, index) => {
                            // Ensure we have valid numeric values
                            const totalSales = typeof monthData.totalSales === 'number' && !isNaN(monthData.totalSales)
                                ? monthData.totalSales : 0;

                            const monthExpenses = typeof monthlyTotals[monthData.month] === 'number' && !isNaN(monthlyTotals[monthData.month])
                                ? monthlyTotals[monthData.month] : 0;

                            const profit = totalSales - monthExpenses;
                            const margin = totalSales > 0 ? (profit / totalSales) * 100 : 0;

                            return (
                                <tr key={index}>
                                    <td>{monthData.month}</td>
                                    <td>${totalSales.toFixed(2)}</td>
                                    <td>${monthExpenses.toFixed(2)}</td>
                                    <td className={profit >= 0 ? 'profit' : 'loss'}>
                                        ${profit.toFixed(2)}
                                    </td>
                                    <td className={margin >= 0 ? 'profit' : 'loss'}>
                                        {margin.toFixed(1)}%
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>

                    <div className="chart-container">
                        <h3>Profit & Loss Comparison</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={salesData.map(month => {
                                    // Ensure we have valid numeric values
                                    const totalSales = typeof month.totalSales === 'number' && !isNaN(month.totalSales)
                                        ? month.totalSales : 0;

                                    const expenses = typeof monthlyTotals[month.month] === 'number' && !isNaN(monthlyTotals[month.month])
                                        ? monthlyTotals[month.month] : 0;

                                    return {
                                        month: month.month,
                                        sales: totalSales,
                                        expenses: expenses,
                                        profit: totalSales - expenses
                                    };
                                })}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => typeof value === 'number' ? ['$' + value.toFixed(2)] : ['$0.00']} />
                                <Legend />
                                <Bar dataKey="sales" name="Sales" fill="#3a6ea5" />
                                <Bar dataKey="expenses" name="Expenses" fill="#ff6b6b" />
                                <Bar dataKey="profit" name="Profit" fill="#28a745" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    };

    const renderMarketPriceAnalytics = () => {
        if (marketPriceData.length === 0) {
            return <div className="no-data-message">
                <p>No market price data available in the database.</p>
                <p>Please add market price data to see price trend analytics.</p>
            </div>;
        }

        // Group by item
        const itemsData = {};
        marketPriceData.forEach(entry => {
            if (!itemsData[entry.item]) {
                itemsData[entry.item] = [];
            }
            itemsData[entry.item].push(entry);
        });

        return (
            <div className="analytics-section">
                <h2>Market Price Trends</h2>
                <p className="info-text">
                    Analysis of price trends can help identify the best times to purchase inventory
                    at lower prices. The chart below shows weekly price fluctuations for key items.
                </p>

                {Object.keys(itemsData).map(itemName => {
                    const itemData = itemsData[itemName];

                    // Enhanced price conversion and validation
                    const validPrices = itemData
                        .map(d => {
                            // Convert price to number, handling different input types
                            let price = 0;
                            if (typeof d.price === 'number' && !isNaN(d.price)) {
                                price = d.price;
                            } else if (typeof d.price === 'string') {
                                price = parseFloat(d.price);
                            }
                            return isNaN(price) ? 0 : price;
                        })
                        .filter(price => price > 0);

                    // Fallback to [0] if no valid prices
                    const pricesForCalculation = validPrices.length > 0 ? validPrices : [0];

                    const minPrice = Math.min(...pricesForCalculation);
                    const maxPrice = Math.max(...pricesForCalculation);
                    const avgPrice = pricesForCalculation.reduce((sum, price) => sum + price, 0) / pricesForCalculation.length;

                    // Find weeks with the lowest prices
                    const lowestPriceWeeks = itemData
                        .filter(d => {
                            // Ensure consistent price comparison
                            let price = 0;
                            if (typeof d.price === 'number' && !isNaN(d.price)) {
                                price = d.price;
                            } else if (typeof d.price === 'string') {
                                price = parseFloat(d.price);
                            }
                            return !isNaN(price) && price === minPrice;
                        })
                        .map(d => d.week)
                        .join(', ');

                    return (
                        <div key={itemName} className="item-price-section">
                            <h3>{itemName}</h3>
                            <div className="price-summary">
                                <div className="summary-stat">
                                    <span className="stat-label">Minimum Price:</span>
                                    <span className="stat-value">${minPrice.toFixed(2)}</span>
                                    <span className="stat-detail">in {lowestPriceWeeks || 'N/A'}</span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-label">Maximum Price:</span>
                                    <span className="stat-value">${maxPrice.toFixed(2)}</span>
                                </div>
                                <div className="summary-stat">
                                    <span className="stat-label">Average Price:</span>
                                    <span className="stat-value">${avgPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart
                                        data={itemData.map(entry => ({
                                            ...entry,
                                            price: typeof entry.price === 'string'
                                                ? parseFloat(entry.price) || 0
                                                : entry.price || 0
                                        }))}
                                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="week" />
                                        <YAxis
                                            domain={[minPrice * 0.95, maxPrice * 1.05]}
                                            tickFormatter={(value) => Math.round(value).toFixed(0)}
                                        />
                                        <Tooltip formatter={(value) => typeof value === 'number' ? ['$' + value.toFixed(2), 'Price'] : ['$0.00', 'Price']} />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="price"
                                            name={`${itemName} Price`}
                                            stroke="#4e79a7"
                                            activeDot={{ r: 8 }}
                                            strokeWidth={2}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {minPrice > 0 && maxPrice > minPrice && (
                                <div className="recommendation-box">
                                    <h4>Purchasing Recommendation</h4>
                                    <p>
                                        {lowestPriceWeeks ?
                                            `Based on historical data, the best time to purchase ${itemName} is during ${lowestPriceWeeks}, when prices reach a low of $${minPrice.toFixed(2)}. This represents a savings of $${(maxPrice - minPrice).toFixed(2)} per unit compared to peak prices.` :
                                            `Monitor pricing trends for ${itemName} to identify optimal purchase times.`
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };
    const renderDiscountAnalytics = () => {
        if (customerPreferences.length === 0) {
            return <div className="no-data-message">
                <p>No customer preference data available in the database.</p>
                <p>Please add customer orders to see discount analytics.</p>
            </div>;
        }

        // Sort by order count (descending)
        const sortedPreferences = [...customerPreferences].sort((a, b) => b.orderCount - a.orderCount);

        return (
            <div className="analytics-section">
                <h2>Customer Preference Analysis & Discount Tracking</h2>
                <p className="info-text">
                    This analysis identifies customers' most frequently ordered items
                    and tracks discount eligibility based on ordering patterns.
                </p>

                <table className="analytics-table">
                    <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Favorite Item</th>
                        <th>Order Count</th>
                        <th>Discount Eligible</th>
                        <th>Recommended Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedPreferences.map((pref, index) => (
                        <tr key={index}>
                            <td>{pref.customer}</td>
                            <td>{pref.item}</td>
                            <td>{pref.orderCount}</td>
                            <td>
                                    <span className={`eligibility-badge ${pref.discount ? 'eligible' : 'not-eligible'}`}>
                                        {pref.discount ? 'Eligible' : 'Not Eligible'}
                                    </span>
                            </td>
                            <td>
                                {pref.discount
                                    ? `Eligible for discount on ${pref.item}`
                                    : `Needs ${Math.max(5 - pref.orderCount, 0)} more orders to qualify for discount`
                                }
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {/* Customer loyalty distribution chart */}
                {customerPreferences.length > 0 && (
                    <div className="chart-container">
                        <h3>Customer Loyalty Distribution</h3>

                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={(() => {
                                        // Calculate loyalty distribution
                                        const loyal = customerPreferences.filter(p => p.orderCount >= 5).length;
                                        const regular = customerPreferences.filter(p => p.orderCount >= 3 && p.orderCount < 5).length;
                                        const occasional = customerPreferences.filter(p => p.orderCount < 3).length;

                                        // Calculate percentages
                                        const total = loyal + regular + occasional;
                                        const loyalPercent = total > 0 ? (loyal / total * 100).toFixed(1) : 0;
                                        const regularPercent = total > 0 ? (regular / total * 100).toFixed(1) : 0;
                                        const occasionalPercent = total > 0 ? (occasional / total * 100).toFixed(1) : 0;

                                        return [
                                            { name: 'Loyal Customers (5+ orders)', value: loyal || 1, percent: loyalPercent },
                                            { name: 'Regular Customers (3-4 orders)', value: regular || 1, percent: regularPercent },
                                            { name: 'Occasional Customers (1-2 orders)', value: occasional || 1, percent: occasionalPercent }
                                        ];
                                    })()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    label={({ name, percent }) => `${name}: ${percent}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    <Cell fill="#28a745" />
                                    <Cell fill="#3a6ea5" />
                                    <Cell fill="#6c757d" />
                                </Pie>
                                <Tooltip formatter={(value, name, props) => {
                                    // Find the corresponding data item
                                    const dataArray = [
                                        { name: 'Loyal Customers (5+ orders)', value: customerPreferences.filter(p => p.orderCount >= 5).length || 1 },
                                        { name: 'Regular Customers (3-4 orders)', value: customerPreferences.filter(p => p.orderCount >= 3 && p.orderCount < 5).length || 1 },
                                        { name: 'Occasional Customers (1-2 orders)', value: customerPreferences.filter(p => p.orderCount < 3).length || 1 }
                                    ];
                                    const item = dataArray.find(item => item.name === name);
                                    const total = dataArray.reduce((sum, item) => sum + item.value, 0);
                                    const percent = total > 0 ? (item.value / total * 100).toFixed(1) : 0;

                                    return [`${value} (${percent}%)`, name];
                                }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Discount program analysis */}
                {customerPreferences.length > 0 && (
                    <div className="discount-impact-section">
                        <h3>Discount Program Analysis</h3>
                        <p className="info-text">This section shows the impact of discount programs based on actual customer data.</p>
                        <p className="info-text">There are {customerPreferences.filter(p => p.discount).length} customers currently eligible for discounts.</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="analytics-container">
            <Header />
            <h1>Restaurant Analytics Dashboard</h1>

            <div className="analytics-tabs">
                <button
                    className={`tab-button ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales')}
                >
                    Sales Analysis
                </button>
                <button
                    className={`tab-button ${activeTab === 'expenses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expenses')}
                >
                    Expense Tracking
                </button>
                <button
                    className={`tab-button ${activeTab === 'market' ? 'active' : ''}`}
                    onClick={() => setActiveTab('market')}
                >
                    Market Price Analysis
                </button>
                <button
                    className={`tab-button ${activeTab === 'discounts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('discounts')}
                >
                    Customer Discounts
                </button>
            </div>

            {loading ? (
                <div className="loading-indicator">Loading analytics data...</div>
            ) : (

                <div className="analytics-content">
                    {activeTab === 'sales' && renderSalesAnalytics()}
                    {activeTab === 'expenses' && renderExpenseAnalytics()}
                    {activeTab === 'market' && renderMarketPriceAnalytics()}
                    {activeTab === 'discounts' && renderDiscountAnalytics()}
                </div>
            )}
        </div>
    );
};

export default ViewFastMovingProducts;
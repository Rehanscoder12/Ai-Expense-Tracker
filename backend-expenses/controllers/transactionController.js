const Transaction = require("../models/transactionSchema")
const User = require("../models/userSchema")
const { Op } = require("sequelize")
const asyncHandler = require("express-async-handler")

const createTransaction = asyncHandler(async (req, res) => {
    const { type, amount, category, description, date } = req.body;
    if (!type || !amount || !category) {
        res.status(400);
        throw new Error("All fields are mandatory!")
    }
    const transactionDate = date ? new Date(date) : new Date();
    if (Number.isNaN(transactionDate.getTime())) {
        res.status(400);
        throw new Error("Invalid transaction date");
    }
    const savedTransaction = await Transaction.create({
        userId: req.user._id,
        type,
        amount: Number(amount),
        category,
        description,
        date: transactionDate,
    });
    res.status(201).json(savedTransaction)
})

const getTransaction = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findAll({
        where: { userId: req.user._id },
        include: [{ model: User, attributes: ["id", "userName", "email"] }],
        order: [["createdAt", "DESC"]]
    });
    if (transaction.length === 0) {
        res.status(404)
        throw new Error("No transactions")
    }
    res.status(200).json(transaction)
})

const deleteTransaction = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findOne({ where: { id: req.params.id, userId: req.user._id } });
    if (!transaction) {
        res.status(404)
        throw new Error("Transaction not found!")
    }
    await transaction.destroy();
    res.status(200).json({ message: "Transaction deleted successfully" });
})

const updateTransaction = asyncHandler(async (req, res) => {
    const transaction = await Transaction.findByPk(req.params.id)
    if (!transaction) {
        res.status(404)
        throw new Error("Transaction not found!")
    }
    if (String(transaction.userId) !== String(req.user._id)) {
        res.status(403);
        throw new Error("User not authorized to update this transaction");
    }
    const allowedFields = ["type", "amount", "category", "description", "date"];
    const updates = Object.fromEntries(
        allowedFields.filter(field => req.body[field] !== undefined).map(field => [field, req.body[field]])
    );
    if (updates.amount !== undefined) updates.amount = Number(updates.amount);
    if (updates.date !== undefined) updates.date = new Date(updates.date);
    await transaction.update(updates);
    res.status(200).json(transaction)
})

const getStats = asyncHandler(async (req, res) => {
    console.log("User ID:", req.user._id);
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const transactions = await Transaction.findAll({ where: { userId: req.user._id } });
    const monthTransactions = await Transaction.findAll({
        where: {
        userId: req.user._id,
        date: { [Op.gte]: startOfMonth, [Op.lte]: endOfMonth }
        }
    });
    if (transactions.length === 0) {
        console.log("No transactions found");
        return res.status(200).json({
            incomeSum: 0,
            expenseSum: 0,
            balance: 0,
            saving: 0
        });
    }
    let incomeSum = 0;
    let expenseSum = 0;
    transactions.forEach(t => {
        if (t.type === "income") {
            incomeSum += Number(t.amount);
        }
        else {
            expenseSum += Number(t.amount);
        }
    });

    let monthIncome = 0;
    let monthExpense = 0;
    let categoryMap = {}
    monthTransactions.forEach(t => {
        if (t.type === 'income') {
            monthIncome += Number(t.amount);
        }
        else {
            monthExpense += Number(t.amount);
            if (!categoryMap[t.category]) {
                categoryMap[t.category] = 0;
            }
            categoryMap[t.category] += Number(t.amount);
        }

    })
    const categories = Object.entries(categoryMap).map(([cat, amount]) => ({
        cat,
        amount,
        expensePercentage: monthExpense > 0 ? parseFloat((amount / monthExpense) * 100).toFixed(1) : 0
    })).sort((a, b) => b.amount - a.amount)
    const balance = incomeSum - expenseSum;
    const saving = balance;
    res.send({ incomeSum, expenseSum, balance, saving, categories });
})

const getChartData = asyncHandler(async (req, res) => {
    const { range } = req.query;
    const where = { userId: req.user._id }
    if (range === "7d") {
        let sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        where.date = { [Op.gte]: sevenDaysAgo }
    }
    else if (range === "30d") {
        let thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        where.date = { [Op.gte]: thirtyDaysAgo }
    } else {
        console.log("Showing all time transactions");
    }
    const transactions = await Transaction.findAll({ where, order: [["date", "DESC"]] });
    let balance = 0;
    let balanceData = {}
    let trendData = {}
    transactions.forEach(e => {
        const day = e.date.toISOString().split("T")[0];

        if (!balanceData[day]) balanceData[day] = { date: day, balance };
        if (e.type === "income") balance += Number(e.amount);
        if (e.type === "expense") balance -= Number(e.amount);
        balanceData[day].balance = balance;

        if (!trendData[day]) trendData[day] = { date: day, income: 0, expense: 0 }
        if (e.type === "income") trendData[day].income += Number(e.amount)
        if (e.type === "expense") trendData[day].expense += Number(e.amount)
    });

    const balanceArray = Object.values(balanceData).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    )
    const trendArray = Object.values(trendData).sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    )
    res.send({ balanceData: balanceArray, trendData: trendArray, recentTransactions: transactions })
})

const getCategoryState = asyncHandler(async (req, res) => {
    const transactions = await Transaction.findAll({ where: { userId: req.user._id } });
    if (transactions.length == 0) {
        res.status(200).json([])
        return
    }
    let categorytotal = {}
    transactions.forEach(t => {
        if (!categorytotal[t.category]) {
            categorytotal[t.category] = {
                total: 0,
                type: t.type
            }
        }
        categorytotal[t.category].total += Number(t.amount)
    });
    const sorted = Object.entries(categorytotal)
        .map(([category, data]) => ({ category, total: data.total, type: data.type }))
        .sort((a, b) => b.total - a.total)
    res.json(sorted)
})

module.exports = { createTransaction, getTransaction, deleteTransaction, updateTransaction, getStats, getChartData, getCategoryState }
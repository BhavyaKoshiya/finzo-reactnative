# Finzo — Navigation Architecture & Screen Hierarchy (Phase 18)

This document outlines the complete navigation structure, screen responsibilities, stack hierarchy, and entry point policies for **Finzo**.

---

## 1. Top-Level Navigation Structure

```
RootNavigator (Native Stack)
├── MainTabNavigator (Bottom Tabs)
│   ├── Home Tab (HomeScreen)
│   ├── Calculators Tab (CalculatorCatalogScreen)
│   ├── My Loans Tab (MyLoansScreen)
│   └── Profile Tab (ProfileScreen)
│
├── Calculator Family Stack Screens
│   ├── EMICalculatorScreen (Home, Personal, Car, Education, Business)
│   ├── InvestmentCalculators (SIP, FD, RD, CAGR, ROI)
│   ├── BusinessCalculators (GST)
│   └── EverydayCalculators (Simple Interest, Compound Interest, Percentage)
│
├── Loan Management Stack Screens
│   ├── LoanDetailsScreen
│   ├── AddLoanScreen
│   ├── EditLoanScreen
│   ├── AddPaymentScreen
│   ├── EditPaymentScreen
│   ├── LoanPaymentHistoryScreen
│   ├── LoanPrepaymentSimulatorScreen
│   ├── LoanInsightsScreen
│   ├── LoanPayoffPlannerScreen
│   ├── LoanGoalsScreen & LoanGoalDetailsScreen
│   ├── LoanPrivateDetailsScreen
│   └── LoanNotesScreen
│
└── System & Auxiliary Screens
    ├── CalculatorSearchScreen
    ├── RewardsScreen
    ├── LocalDataPrivacyScreen
    └── ComponentShowcaseScreen (__DEV__ Only)
```

---

## 2. Key Screen Responsibilities

| Screen Name | Primary Purpose | Primary Action (CTA) | Secondary Action |
|---|---|---|---|
| **HomeScreen** | Quick calculator access & overdue loan alert widget | Search Calculators / Open Loan | Explore Categories |
| **MyLoansScreen** | Authoritative multi-loan management & saved calculations ledger | Add Another Loan | View Loan Details |
| **LoanDetailsScreen** | Single loan dashboard & tools portal | Record Payment | Loan Tools (Prepayment, Goals, Notes) |
| **AddLoanScreen** | Creating new loan profile | Save Loan | Cancel |
| **AddPaymentScreen** | Recording EMI / prepayment / full settlement | Save Payment | Cancel |
| **LoanInsightsScreen** | Analytics, schedule & payoff insights | Export PDF Report | View Schedule |
| **ProfileScreen** | Personal dashboard & Ad-Free status | View Rewards | Settings / Privacy |

---

## 3. Back Behavior & Destructive Navigation Rules

1. **Header Left Action**: All secondary stack screens provide an explicit left arrow icon back button mapping to `navigation.goBack()`.
2. **Post-Save Navigation**: Saving a loan, recording a payment, updating balance, or saving a note confirms success via alert/toast and navigates back to the parent screen.
3. **Destructive Actions**: Deleting a payment, deleting a loan, or clearing notes requires explicit confirmation before performing state mutation.

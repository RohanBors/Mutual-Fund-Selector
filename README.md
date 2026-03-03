# 📊 MF Selector — Mutual Fund Decision Tree

A structured, factor-by-factor decision framework for evaluating Indian mutual funds — built for investors who sort by Sharpe ratio on Morningstar India and need a rigorous way to decide whether to select a fund or move to the next one.

> **Disclaimer:** This tool is for **educational purposes only**. It does not constitute SEBI-registered investment advice. Always consult a qualified financial advisor before making investment decisions. Past performance is not indicative of future results.

---

## 🌐 Live Demo

👉 **[Try it here](https://mutual-funds-selector-sajq.vercel.app/)** *(update this after deploying)*

---

## 🧠 What This Tool Does

Most investors on Morningstar India sort funds by Sharpe ratio — but then get stuck deciding *which* fund in the sorted list to actually pick. This tool solves that by walking you through a structured 9-step evaluation:

1. **Select your fund category** — all 54 Morningstar India categories supported
2. **Sharpe Ratio gate** — is the risk-adjusted return acceptable for this category?
3. **Fee check** — is the expense ratio justified?
4. **R-Squared check** — are you paying active fees for active management?
5. **Alpha check** — is the manager genuinely adding value?
6. **Standard Deviation** — is volatility commensurate with returns?
7. **Beta check** — does market sensitivity match your risk profile?
8. **Long-term return consistency** — are returns durable across 1/3/5/10 year periods?
9. **Final verdict** — SELECT / CAUTION / CONSIDER NEXT / SKIP

Every threshold is **calibrated per category** — a 22% standard deviation is fine for Small Cap but a red flag for Large Cap. The tool knows the difference.

---

## 📂 Repository Structure

```
mf-selector/
├── public/
│   └── index.html              # HTML entry point
├── src/
│   ├── index.js                # React entry point
│   ├── App.js                  # Root component
│   └── MutualFundDecisionTree.jsx  # Main tool (all logic + UI)
├── .gitignore
├── LICENSE                     # MIT License
├── package.json
└── README.md
```

---

## 🚀 Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher
- npm (comes with Node.js)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/mf-selector.git

# 2. Navigate into the project
cd mf-selector

# 3. Install dependencies
npm install

# 4. Start the development server
npm start
```

The app will open at **http://localhost:3000** in your browser.

---

## 📋 Supported Fund Categories (54 Total)

| Group | Categories |
|-------|-----------|
| **Equity** | Large Cap, Mid Cap, Small Cap, Multi Cap, Large & Mid Cap, Flexi Cap, Focused, ELSS, Contra, Value, Dividend Yield, Equity — Consumption, Equity — ESG, Equity — Infrastructure, Equity — Others, Equity — Savings |
| **Sectoral** | Energy, Financial Services, FMCG, Healthcare, Precious Metals, Tech |
| **Hybrid & Allocation** | Aggressive Allocation, Balanced Allocation, Conservative Allocation, Dynamic Asset Allocation, Multi-Asset Allocation, Retirement, Arbitrage |
| **Debt** | Liquid, Overnight, Ultra Short Duration, Low Duration, Money Market, Short Duration, Medium Duration, Medium to Long Duration, Long Duration, Dynamic Bond, Corporate Bond, Banking & PSU, Credit Risk, Government Bond, 10yr Gov Bond, Floating Rate, Other Bond |
| **Fixed Maturity** | Intermediate Term, Short Term, Ultrashort |
| **Index & Passive** | Index Fund (Equity), Index Fund (Fixed Income) |
| **Global & Alternative** | Global — Other, Alternative — Other |

---

## 🧮 The Factor Framework

Factors are ranked in order of importance:

| Rank | Factor | Why It Matters |
|------|--------|---------------|
| 1 | **Fees** | Only guaranteed drag on returns — every basis point compounds negatively |
| 2 | **Sharpe Ratio** | True risk-adjusted return — the primary sort key |
| 3 | **Long-term Returns** | Weighted 40/30/20/10 across 10Y/5Y/3Y/1Y periods |
| 4 | **Alpha** | Manager's genuine value-add above benchmark |
| 5 | **Standard Deviation** | Volatility must be commensurate with returns |
| 6 | **Beta** | Market sensitivity matched to investor risk profile |
| 7 | **R-Squared** | Detects closet indexers — are you paying active fees? |

---

## 🤝 Contributing

Contributions are welcome! Some ideas:

- **Update thresholds** as market conditions evolve
- **Add new categories** if SEBI introduces them
- **Add fund comparison** mode (evaluate 2 funds side by side)
- **Add export** — download your evaluation as a PDF
- **Add manager tenure check** as a step
- **Localise** for other markets (US Morningstar categories, etc.)

### How to contribute
```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/mf-selector.git
git checkout -b feature/your-feature-name
# Make your changes
git commit -m "Add: your feature description"
git push origin feature/your-feature-name
# Open a Pull Request on GitHub
```

---

## ⚖️ License

MIT License — free to use, modify, and distribute with attribution. See [LICENSE](./LICENSE).

---

## 🙏 Acknowledgements

- Framework inspired by 20+ years of mutual fund portfolio management experience
- Categories aligned to [Morningstar India](https://www.morningstar.in) classifications
- SEBI mutual fund categorisation guidelines (circular dated October 2017)

---

*Built with ❤️ for the Indian retail investor community*

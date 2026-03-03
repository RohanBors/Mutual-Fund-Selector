import { useState, useMemo } from "react";

const COLORS = {
  bg: "#0a0e1a",
  card: "#111827",
  cardBorder: "#1e2a3a",
  accent: "#00d4aa",
  accentDim: "#00d4aa22",
  accentBorder: "#00d4aa55",
  warn: "#f59e0b",
  warnDim: "#f59e0b22",
  danger: "#ef4444",
  dangerDim: "#ef444422",
  pass: "#10b981",
  passDim: "#10b98122",
  text: "#e2e8f0",
  textDim: "#64748b",
  textMid: "#94a3b8",
};

const CATEGORY_THRESHOLDS = {
  // ── EQUITY ──
  largecap: { label:"Large Cap", group:"Equity", fees:0.8, sd:15, alpha:0, beta:[0.85,1.05], rsq:85, sharpeMin:0.9, hint:"Top 100 stocks by mkt cap. Highly efficient — index funds consistently beat active managers here.", alphaNote:"Post-SEBI 2018 recategorisation, most managers struggle to beat Nifty TRI. Near-zero alpha with low fees is acceptable." },
  midcap: { label:"Mid Cap", group:"Equity", fees:1.2, sd:20, alpha:1.0, beta:[0.9,1.15], rsq:75, sharpeMin:0.75, hint:"Companies ranked 101–250. Less efficient — skilled active managers can add genuine value.", alphaNote:"Active alpha of 1%+ is achievable and expected. Reward managers who demonstrate consistent stock-picking skill." },
  smallcap: { label:"Small Cap", group:"Equity", fees:1.5, sd:25, alpha:1.5, beta:[0.9,1.25], rsq:65, sharpeMin:0.65, hint:"Ranked 251+. Structurally volatile & illiquid. Best long-term wealth creator but needs 7–10yr horizon.", alphaNote:"Highest alpha potential. Deep research on promoters, order books & liquidity is where the fees are justified." },
  multicap: { label:"Multi Cap", group:"Equity", fees:1.2, sd:20, alpha:1.0, beta:[0.9,1.15], rsq:70, sharpeMin:0.75, hint:"SEBI mandates minimum 25% each in Large, Mid & Small Cap. Inherently more volatile than FlexiCap.", alphaNote:"The forced small/mid allocation creates natural volatility. Look for managers who use this mandate wisely." },
  largemidcap: { label:"Large & Mid Cap", group:"Equity", fees:1.1, sd:18, alpha:0.8, beta:[0.88,1.1], rsq:78, sharpeMin:0.78, hint:"Min 35% each in Large & Mid Cap. Good balance of stability and growth potential.", alphaNote:"Blend of large cap stability and mid cap growth. Alpha of 0.8%+ expected from the mid cap portion." },
  flexicap: { label:"Flexi Cap", group:"Equity", fees:1.0, sd:17, alpha:0.5, beta:[0.85,1.1], rsq:78, sharpeMin:0.8, hint:"Unrestricted allocation across market caps. Dynamic allocation skill is the key differentiator.", alphaNote:"With full flexibility, a skilled manager should navigate market cycles. Penalise benchmark-hugging in this category." },
  focused: { label:"Focused", group:"Equity", fees:1.2, sd:19, alpha:1.0, beta:[0.85,1.15], rsq:68, sharpeMin:0.75, hint:"Maximum 30 stocks. High conviction concentrated bets. Low R² is expected and desirable.", alphaNote:"Concentration is the point. Low R² + high alpha is the ideal signature. High R² means the manager is diluting the mandate." },
  elss: { label:"ELSS", group:"Equity", fees:1.2, sd:18, alpha:0.5, beta:[0.85,1.1], rsq:78, sharpeMin:0.75, hint:"3-year lock-in with 80C tax benefit. Lock-in prevents panic-selling — slight SD tolerance justified.", alphaNote:"Similar to flexi/large-midcap mandate. The lock-in is a behavioural advantage, not an excuse for poor management." },
  contra: { label:"Contra", group:"Equity", fees:1.3, sd:20, alpha:1.0, beta:[0.8,1.1], rsq:65, sharpeMin:0.68, hint:"Invests against prevailing sentiment — beaten-down or out-of-favour stocks. Needs patience.", alphaNote:"Alpha may be lumpy — years of underperformance followed by sharp outperformance. Judge over full market cycles." },
  value: { label:"Value", group:"Equity", fees:1.2, sd:18, alpha:0.8, beta:[0.82,1.08], rsq:68, sharpeMin:0.70, hint:"Buys fundamentally undervalued stocks. Like Contra, performance is cycle-dependent — rewards patience.", alphaNote:"Value strategies can lag for extended periods in momentum markets. A 5–10yr lens is more appropriate than 3yr alpha." },
  dividendyield: { label:"Dividend Yield", group:"Equity", fees:1.1, sd:15, alpha:0.5, beta:[0.78,1.0], rsq:72, sharpeMin:0.78, hint:"Focuses on high dividend-paying stocks. Naturally more defensive — lower beta and SD expected.", alphaNote:"Defensive posturing means lower beta. Reward consistent dividends + capital appreciation combination." },
  equityconsumption: { label:"Equity — Consumption", group:"Equity", fees:1.5, sd:18, alpha:1.0, beta:[0.82,1.1], rsq:65, sharpeMin:0.68, hint:"Thematic bet on India's consumer spending — FMCG, retail, durables, QSR. Structural long-term theme.", alphaNote:"Consumption as a theme has decade-long tailwinds in India. Cyclically sensitive to rural income and urban sentiment." },
  equityesg: { label:"Equity — ESG", group:"Equity", fees:1.3, sd:16, alpha:0.5, beta:[0.83,1.05], rsq:72, sharpeMin:0.75, hint:"Screens for Environmental, Social & Governance criteria. Universe restriction may limit alpha.", alphaNote:"ESG screening excludes high-polluting sectors. In India, ESG data quality is still maturing — verify screening methodology." },
  equityinfra: { label:"Equity — Infrastructure", group:"Equity", fees:1.5, sd:22, alpha:1.0, beta:[0.88,1.25], rsq:62, sharpeMin:0.60, hint:"Roads, ports, power, construction. Highly policy-sensitive and cyclical. Had a lost decade 2010–2020.", alphaNote:"Infrastructure has enormous mean-reversion potential. Performance is deeply tied to government capex cycles." },
  equityothers: { label:"Equity — Others", group:"Equity", fees:1.3, sd:20, alpha:0.8, beta:[0.82,1.2], rsq:65, sharpeMin:0.65, hint:"Catch-all for thematic funds not fitting standard categories. Extra scrutiny of mandate required.", alphaNote:"Benchmark carefully — many use custom or blended benchmarks. R² may not be meaningful; focus on Sharpe and absolute returns." },
  equitysavings: { label:"Equity — Savings", group:"Equity", fees:0.9, sd:8, alpha:0.3, beta:[0.3,0.6], rsq:50, sharpeMin:0.85, hint:"~30% equity + ~65% debt/arbitrage. Designed as a tax-efficient FD alternative with equity taxation.", alphaNote:"Very low equity exposure means alpha from equity portion is muted. Focus on Sharpe, consistency and downside protection." },
  // ── SECTORAL ──
  sectorenergy: { label:"Sector — Energy", group:"Sectoral", fees:1.5, sd:24, alpha:1.0, beta:[0.88,1.3], rsq:62, sharpeMin:0.55, hint:"Oil, gas, renewables, utilities. Policy-sensitive. Renewable energy has strong structural tailwinds.", alphaNote:"Global commodity cycles and domestic policy are dominant drivers. Manager's macro view matters as much as stock picking." },
  sectorfinancial: { label:"Sector — Financial Services", group:"Sectoral", fees:1.5, sd:22, alpha:1.0, beta:[0.92,1.25], rsq:72, sharpeMin:0.60, hint:"Banks, NBFCs, insurance, AMCs. Largest sector in Indian indices — high R² vs broader indices is expected.", alphaNote:"Given the weight of financials in Nifty 50, R² will naturally be higher. Focus on NBFC/bank quality vs benchmark." },
  sectorfmcg: { label:"Sector — FMCG", group:"Sectoral", fees:1.5, sd:14, alpha:0.8, beta:[0.72,1.0], rsq:65, sharpeMin:0.70, hint:"Defensive sector — low volatility, high quality businesses. Natural hedge during market downturns.", alphaNote:"FMCG valuations are usually expensive. Alpha comes from picking winners among rural-urban shift beneficiaries." },
  sectorhealthcare: { label:"Sector — Healthcare", group:"Sectoral", fees:1.5, sd:20, alpha:1.2, beta:[0.78,1.15], rsq:60, sharpeMin:0.62, hint:"Pharma + hospitals + diagnostics. Regulatory cycles (US FDA, DCGI) create sharp episodic volatility.", alphaNote:"USFDA compliance is a major alpha/risk driver. Deep pharma research skill matters enormously in this category." },
  sectormetals: { label:"Sector — Precious Metals", group:"Sectoral", fees:1.0, sd:22, alpha:0.5, beta:[0.4,0.9], rsq:35, sharpeMin:0.40, hint:"Gold/silver ETFs and FoFs. Low correlation to equity — useful as portfolio hedge, not a core holding.", alphaNote:"Gold is a hedge, not an alpha generator. Low R² vs equity is the point. Evaluate on correlation benefit to your portfolio." },
  sectortech: { label:"Sector — Tech", group:"Sectoral", fees:1.5, sd:22, alpha:1.2, beta:[0.88,1.3], rsq:65, sharpeMin:0.62, hint:"IT services + digital/internet plays. Highly sensitive to INR/USD and global tech spending cycles.", alphaNote:"Currency tailwinds (INR depreciation) have been a silent alpha driver. Assess manager's view on global tech capex." },
  // ── HYBRID & ALLOCATION ──
  aggressivealloc: { label:"Aggressive Allocation", group:"Hybrid & Allocation", fees:1.2, sd:16, alpha:0.5, beta:[0.72,1.0], rsq:72, sharpeMin:0.82, hint:"65–80% equity + 20–35% debt. Designed for growth with some cushion. Equity allocation drives most returns.", alphaNote:"Asset allocation skill + equity stock picking combine here. Strong Sharpe with smooth drawdowns is the hallmark." },
  balancedalloc: { label:"Balanced Allocation", group:"Hybrid & Allocation", fees:1.0, sd:12, alpha:0.3, beta:[0.55,0.82], rsq:65, sharpeMin:0.85, hint:"~50% equity / ~50% debt. Classic balanced portfolio in a single fund. Prioritise Sharpe over raw returns.", alphaNote:"Balance is the mandate. A fund with high alpha but poor Sharpe is defeating its own purpose here." },
  conservativealloc: { label:"Conservative Allocation", group:"Hybrid & Allocation", fees:0.9, sd:7, alpha:0.2, beta:[0.25,0.55], rsq:45, sharpeMin:0.88, hint:"20–30% equity + 70–80% debt. Closest to capital-preservation within hybrid space.", alphaNote:"Sharpe should be highest in this category due to low SD. Focus rigorously on credit quality of the debt portion." },
  dynamicassetalloc: { label:"Dynamic Asset Allocation", group:"Hybrid & Allocation", fees:1.0, sd:12, alpha:0.3, beta:[0.45,0.85], rsq:58, sharpeMin:0.88, hint:"BAF — dynamically manages equity-debt mix based on valuations (P/E, P/B). Best for nervous investors.", alphaNote:"The model-driven allocation IS the alpha here. Verify the model's track record across market cycles." },
  multiassetalloc: { label:"Multi-Asset Allocation", group:"Hybrid & Allocation", fees:1.1, sd:13, alpha:0.5, beta:[0.5,0.88], rsq:55, sharpeMin:0.85, hint:"Min 3 asset classes — equity, debt, gold/REITs/InvITs. True diversification across uncorrelated assets.", alphaNote:"Low R² is structurally correct here. The portfolio diversification IS the strategy. Compare Sharpe vs peers only." },
  retirement: { label:"Retirement", group:"Hybrid & Allocation", fees:1.1, sd:14, alpha:0.3, beta:[0.55,0.9], rsq:62, sharpeMin:0.82, hint:"5-year lock-in. Often lifecycle-based — equity-heavy when young, shifts toward debt over time.", alphaNote:"Lock-in is intentional. Focus on consistent Sharpe over the full lock-in horizon, not just last 3 years." },
  arbitrage: { label:"Arbitrage Fund", group:"Hybrid & Allocation", fees:0.5, sd:1.5, alpha:0.0, beta:[0.0,0.15], rsq:5, sharpeMin:0.6, hint:"Exploits cash-futures price gaps. Essentially liquid-fund equivalent with equity taxation. Capital preservation.", alphaNote:"Beta and R² are near-meaningless here — these are market-neutral by design. Compare returns vs liquid funds after tax." },
  // ── DEBT ──
  liquid: { label:"Liquid", group:"Debt", fees:0.2, sd:0.5, alpha:0.0, beta:[0.0,0.05], rsq:5, sharpeMin:0.5, hint:"Instruments maturing in up to 91 days. Nearest equivalent to a savings account. Safety > returns.", alphaNote:"Alpha is irrelevant. Prioritise: (1) low fees, (2) AAA/sovereign-only portfolio, (3) no credit risk surprises." },
  overnight: { label:"Overnight", group:"Debt", fees:0.1, sd:0.1, alpha:0.0, beta:[0.0,0.02], rsq:2, sharpeMin:0.3, hint:"1-day maturity instruments only. Absolute safest debt category. Park emergency funds here.", alphaNote:"Returns will be near the overnight RBI repo rate. No alpha, no credit risk — that is the entire point." },
  ultrashorttduration: { label:"Ultra Short Duration", group:"Debt", fees:0.4, sd:1.0, alpha:0.0, beta:[0.0,0.08], rsq:8, sharpeMin:0.6, hint:"3–6 month Macaulay duration. Slightly better yield than liquid with marginally more rate sensitivity.", alphaNote:"Watch credit quality carefully — some funds chase yield by adding lower-rated paper. Stick to AA+ and above." },
  lowduration: { label:"Low Duration", group:"Debt", fees:0.5, sd:1.5, alpha:0.1, beta:[0.02,0.15], rsq:12, sharpeMin:0.65, hint:"6–12 month Macaulay duration. Good for short-term parking with marginally better returns than ultra-short.", alphaNote:"Duration risk is low. Credit risk is the main lever — scrutinise the portfolio's credit rating distribution carefully." },
  moneymkt: { label:"Money Market", group:"Debt", fees:0.3, sd:0.8, alpha:0.0, beta:[0.0,0.08], rsq:6, sharpeMin:0.55, hint:"Up to 1 year maturity. Treasury bills, CPs, CDs. High quality, low risk, and liquid.", alphaNote:"Portfolio quality is everything. Fees above 0.3% are unjustified in this category." },
  shorttduration: { label:"Short Duration", group:"Debt", fees:0.6, sd:2.5, alpha:0.2, beta:[0.05,0.25], rsq:20, sharpeMin:0.70, hint:"1–3 year Macaulay duration. First category where interest rate changes meaningfully impact NAV.", alphaNote:"Active duration management starts to matter here. Good fund managers call rate cycles to add value." },
  mediumduration: { label:"Medium Duration", group:"Debt", fees:0.8, sd:4.5, alpha:0.3, beta:[0.1,0.45], rsq:35, sharpeMin:0.72, hint:"3–4 year Macaulay duration. Meaningful interest rate risk — only hold if confident on rate direction.", alphaNote:"Rate call skill matters significantly. Evaluate manager's track record across the last 2 RBI rate cycles." },
  mediumlongduration: { label:"Medium to Long Duration", group:"Debt", fees:0.9, sd:6.5, alpha:0.4, beta:[0.15,0.6], rsq:45, sharpeMin:0.68, hint:"4–7 year Macaulay duration. Significant rate sensitivity. Returns can be equity-like in falling rate environments.", alphaNote:"Duration bet is the dominant driver. Best entered at peak rate cycles. Not a buy-and-hold-forever product." },
  longduration: { label:"Long Duration", group:"Debt", fees:1.0, sd:9.0, alpha:0.5, beta:[0.2,0.75], rsq:55, sharpeMin:0.62, hint:"7+ year Macaulay duration. Very high rate sensitivity. For tactical positioning in rate cut cycles only.", alphaNote:"Conviction in a sustained rate cut cycle is prerequisite. Do not hold across rate hike cycles — NAV erosion can be severe." },
  dynamicbond: { label:"Dynamic Bond", group:"Debt", fees:0.9, sd:5.0, alpha:0.4, beta:[0.05,0.6], rsq:38, sharpeMin:0.70, hint:"No duration constraint — manager moves freely across 1-day to 30-year bonds. Pure active debt management.", alphaNote:"Manager's rate cycle conviction IS the product. Evaluate their historical track record of duration calls." },
  corporatebond: { label:"Corporate Bond", group:"Debt", fees:0.6, sd:3.0, alpha:0.3, beta:[0.05,0.3], rsq:25, sharpeMin:0.75, hint:"Minimum 80% in AA+ and above corporate bonds. Good yield pickup over government bonds with managed credit risk.", alphaNote:"Credit quality floor is AA+. Any fund deviating below this for yield is taking inappropriate risk in this category." },
  bankingpsu: { label:"Banking & PSU", group:"Debt", fees:0.4, sd:2.5, alpha:0.1, beta:[0.03,0.22], rsq:18, sharpeMin:0.78, hint:"Only banks and PSU bonds — quasi-sovereign quality with better yields than pure government bonds.", alphaNote:"Lowest credit risk in corporate debt. Fees must be low — minimal active skill is required here." },
  creditrisk: { label:"Credit Risk", group:"Debt", fees:1.0, sd:5.5, alpha:0.8, beta:[0.1,0.55], rsq:30, sharpeMin:0.55, hint:"Min 65% in AA and below — deliberate credit risk for yield. Franklin Templeton 2020 is the cautionary tale.", alphaNote:"Credit research quality is everything. Manager's ability to avoid defaults is the only alpha that matters here." },
  govbond: { label:"Government Bond", group:"Debt", fees:0.5, sd:7.0, alpha:0.2, beta:[0.15,0.65], rsq:50, sharpeMin:0.62, hint:"Sovereign paper only — zero credit risk, pure duration/rate risk. Safe but volatile in rising rate environments.", alphaNote:"No credit risk at all — only duration management matters. Ideal during RBI rate cut cycles." },
  "10yrgovbond": { label:"10yr Gov Bond", group:"Debt", fees:0.3, sd:8.0, alpha:0.1, beta:[0.2,0.8], rsq:60, sharpeMin:0.55, hint:"Benchmark 10-year G-Sec funds. Highly sensitive to RBI policy and global bond yields (especially US Fed).", alphaNote:"Essentially a pure rate duration bet. Fees above 0.3% are hard to justify. Evaluate exclusively on rate cycle positioning." },
  floating: { label:"Floating Rate", group:"Debt", fees:0.4, sd:1.2, alpha:0.1, beta:[0.0,0.1], rsq:8, sharpeMin:0.68, hint:"Invests in floating rate bonds — yields reset with market rates. Natural hedge in rising rate environments.", alphaNote:"Best held during rate hike cycles. Low duration risk by design. Complement to fixed-rate debt funds." },
  otherbond: { label:"Other Bond", group:"Debt", fees:0.7, sd:4.0, alpha:0.3, beta:[0.05,0.4], rsq:28, sharpeMin:0.65, hint:"Catch-all for debt funds not fitting standard SEBI categories. Requires careful mandate examination.", alphaNote:"Scrutinise the actual portfolio — mandate ambiguity can mask unexpected credit or duration risks." },
  // ── FIXED MATURITY ──
  fmpintermediate: { label:"Fixed Maturity — Intermediate", group:"Fixed Maturity", fees:0.5, sd:2.5, alpha:0.1, beta:[0.02,0.2], rsq:15, sharpeMin:0.70, hint:"Closed-ended 1–3 year horizon. Locks in prevailing yields — avoids reinvestment risk. Tax-efficient vs FDs.", alphaNote:"Returns are largely locked at inception. Evaluate at NFO stage based on portfolio yield and credit quality." },
  fmpshort: { label:"Fixed Maturity — Short Term", group:"Fixed Maturity", fees:0.4, sd:1.5, alpha:0.1, beta:[0.01,0.1], rsq:10, sharpeMin:0.65, hint:"Closed-ended, 1 year or less. Predictable returns — useful for specific near-term financial goals.", alphaNote:"Treat like a fixed deposit. Credit quality of the initial portfolio is the only thing to evaluate carefully." },
  fmpultrashort: { label:"Fixed Maturity — Ultrashort", group:"Fixed Maturity", fees:0.3, sd:0.8, alpha:0.0, beta:[0.0,0.05], rsq:5, sharpeMin:0.55, hint:"Under 1 year closed-ended FMP. Near-liquid returns in a closed structure. Minimal risk.", alphaNote:"Essentially a structured liquid instrument. Keep fees minimal and credit quality pristine." },
  // ── INDEX & PASSIVE ──
  indexfund: { label:"Index Fund", group:"Index & Passive", fees:0.2, sd:15, alpha:-0.1, beta:[0.97,1.03], rsq:99, sharpeMin:0.80, hint:"Passive replication of equity indices — Nifty 50, Sensex, Nifty Next 50. Low cost is paramount.", alphaNote:"Alpha must be near zero. Negative alpha = tracking error drag. Fees above 0.2% and R² below 98 are both red flags." },
  indexfixedincome: { label:"Index Fund — Fixed Income", group:"Index & Passive", fees:0.15, sd:3.5, alpha:-0.05, beta:[0.96,1.04], rsq:98, sharpeMin:0.72, hint:"Passively tracks debt indices (G-Sec, SDL, corporate bond indices). Emerging category in India.", alphaNote:"Tracking error is the only metric that matters. Fees must be lowest in debt category — no active skill, no active fee." },
  // ── GLOBAL & ALTERNATIVE ──
  globalother: { label:"Global — Other", group:"Global & Alternative", fees:1.5, sd:18, alpha:0.5, beta:[0.5,1.1], rsq:40, sharpeMin:0.60, hint:"Fund of Funds investing globally — US equities, EM, global themes. Tax treated as debt in India.", alphaNote:"Currency risk (INR vs USD/EUR) is a silent but powerful return driver. Factor in the FoF double-layer of fees carefully." },
  alternativeother: { label:"Alternative — Other", group:"Global & Alternative", fees:1.5, sd:15, alpha:0.5, beta:[0.1,0.7], rsq:25, sharpeMin:0.55, hint:"REITs, InvITs, market-neutral strategies. Low correlation to equity is the primary value proposition.", alphaNote:"Correlation benefit to a broader portfolio is the main evaluation lens. Low R² vs equity indices is structurally correct." },
};

const CATEGORY_GROUP_MAP = {
  "Equity": ["largecap","midcap","smallcap","multicap","largemidcap","flexicap","focused","elss","contra","value","dividendyield","equityconsumption","equityesg","equityinfra","equityothers","equitysavings"],
  "Sectoral": ["sectorenergy","sectorfinancial","sectorfmcg","sectorhealthcare","sectormetals","sectortech"],
  "Hybrid & Allocation": ["aggressivealloc","balancedalloc","conservativealloc","dynamicassetalloc","multiassetalloc","retirement","arbitrage"],
  "Debt": ["liquid","overnight","ultrashorttduration","lowduration","moneymkt","shorttduration","mediumduration","mediumlongduration","longduration","dynamicbond","corporatebond","bankingpsu","creditrisk","govbond","10yrgovbond","floating","otherbond"],
  "Fixed Maturity": ["fmpintermediate","fmpshort","fmpultrashort"],
  "Index & Passive": ["indexfund","indexfixedincome"],
  "Global & Alternative": ["globalother","alternativeother"],
};

const GROUP_COLORS = {
  "Equity":"#f59e0b","Sectoral":"#ef4444","Hybrid & Allocation":"#8b5cf6",
  "Debt":"#06b6d4","Fixed Maturity":"#10b981","Index & Passive":"#00d4aa","Global & Alternative":"#f97316",
};

const steps = [
  { id:"category", type:"category" },
  { id:"sharpe", type:"gate", title:"Sharpe Ratio Gate", subtitle:"Primary filter — risk-adjusted return quality", question:"3-Year Sharpe Ratio", placeholder:"e.g. 1.2",
    evaluate:(val,cat)=>{ const t=CATEGORY_THRESHOLDS[cat],v=parseFloat(val); if(v>=1.0)return{status:"pass",label:"Excellent ≥1.0",msg:"Strong risk-adjusted returns. High conviction to proceed."}; if(v>=t.sharpeMin)return{status:"warn",label:`Acceptable ≥${t.sharpeMin}`,msg:`Above category minimum of ${t.sharpeMin}. Proceed carefully — check all other factors rigorously.`}; return{status:"fail",label:"Below threshold",msg:`Sharpe of ${v.toFixed(2)} is below the ${t.sharpeMin} minimum for ${t.label}. Move to the next fund unless no alternatives exist.`}; }},
  { id:"fees", type:"gate", title:"Fee Check", subtitle:"The only guaranteed drag on your returns", question:"Expense Ratio (%)", placeholder:"e.g. 0.85",
    evaluate:(val,cat)=>{ const t=CATEGORY_THRESHOLDS[cat],v=parseFloat(val); if(v<=t.fees*0.6)return{status:"pass",label:"Very low — excellent",msg:"Cost efficiency is a strong structural advantage."}; if(v<=t.fees)return{status:"pass",label:"Within range",msg:`At or below the ${t.fees}% ceiling for ${t.label}. Acceptable.`}; if(v<=t.fees*1.3)return{status:"warn",label:"Slightly high",msg:`Marginally above ${t.fees}% threshold. Only acceptable if alpha clearly compensates.`}; return{status:"fail",label:"Too expensive",msg:`Fees of ${v}% significantly exceed the ${t.fees}% ceiling for ${t.label}. This compounds negatively over time. Skip.`}; }},
  { id:"rsq", type:"gate", title:"R-Squared Check", subtitle:"Are you paying active fees for active management?", question:"3-Year R-Squared", placeholder:"e.g. 88",
    evaluate:(val,cat)=>{ const t=CATEGORY_THRESHOLDS[cat],v=parseFloat(val); if(cat==="indexfund"||cat==="indexfixedincome"){if(v>=98)return{status:"pass",label:"Perfect tracking",msg:"Near-perfect replication. Exactly what you want from a passive fund."};if(v>=95)return{status:"warn",label:"Minor tracking gap",msg:"Small deviation. Check tracking error separately."};return{status:"fail",label:"Poor index tracking",msg:"Too much deviation for an index fund. Skip."};} if(["arbitrage","liquid","overnight","sectormetals","alternativeother","multiassetalloc"].includes(cat))return{status:"pass",label:"N/A for this category",msg:`R² vs equity benchmark is structurally low for ${t.label}. This is expected and correct.`}; if(v>95)return{status:"fail",label:"Closet indexer!",msg:`R² of ${v} means this fund mirrors its benchmark. With fees above 0.5%, this is unjustifiable. Skip.`}; if(v>=70&&v<=t.rsq)return{status:"pass",label:"Genuine active mgmt",msg:"Manager is making real active bets away from the benchmark."}; if(v>t.rsq&&v<=95)return{status:"warn",label:"Benchmark-hugging",msg:`R² of ${v} is above the ${t.rsq} ideal. Justify the active fee with strong sustained alpha.`}; return{status:"warn",label:"Very differentiated",msg:`R² of ${v} — benchmark is a poor reference. Focus on absolute Sharpe and SD rather than relative metrics.`}; }},
  { id:"alpha", type:"gate", title:"Alpha Check", subtitle:"Is the manager genuinely adding value above benchmark?", question:"3-Year Alpha (%)", placeholder:"e.g. 2.1",
    evaluate:(val,cat)=>{ const t=CATEGORY_THRESHOLDS[cat],v=parseFloat(val); if(cat==="indexfund"||cat==="indexfixedincome"){if(v>=-0.3&&v<=0.3)return{status:"pass",label:"Correct for passive",msg:"Near-zero alpha is exactly right for an index fund."};if(v<-0.5)return{status:"fail",label:"Excessive drag",msg:"Too much negative alpha indicates high tracking error or hidden costs."};return{status:"warn",label:"Minor variance",msg:"Slight deviation. Acceptable but monitor."};} if(["arbitrage","liquid","overnight"].includes(cat))return{status:"pass",label:"N/A for this category",msg:"Alpha vs equity benchmark is not meaningful for this fund type."}; if(v>=t.alpha+2)return{status:"pass",label:"Exceptional alpha",msg:`Strong manager value-add of ${v}% above benchmark. High conviction.`}; if(v>=t.alpha)return{status:"pass",label:"Positive alpha",msg:`Alpha of ${v}% meets the ${t.alpha}%+ threshold for ${t.label}. Manager is adding value.`}; if(v>=0)return{status:"warn",label:"Marginally positive",msg:"Low but positive. Acceptable only if Sharpe is strong and fees are low."}; return{status:"warn",label:"Negative alpha",msg:`Manager underperforming benchmark by ${Math.abs(v)}%. Only acceptable in defensive/hybrid categories if Sharpe compensates.`}; }},
  { id:"sd", type:"gate", title:"Standard Deviation", subtitle:"Is the volatility commensurate with the returns?", question:"3-Year Standard Deviation (%)", placeholder:"e.g. 17.5",
    evaluate:(val,cat)=>{ const t=CATEGORY_THRESHOLDS[cat],v=parseFloat(val); if(v<=t.sd*0.85)return{status:"pass",label:"Below avg — excellent",msg:`SD of ${v}% is well below the ${t.sd}% category ceiling. Smoother ride than peers.`}; if(v<=t.sd)return{status:"pass",label:"Within category norms",msg:`SD of ${v}% is within the expected ${t.sd}% range for ${t.label}.`}; if(v<=t.sd*1.15)return{status:"warn",label:"Slightly elevated",msg:"Marginally above category norm. Only acceptable if Sharpe is ≥1.0 to compensate."}; return{status:"fail",label:"Excessive volatility",msg:`SD of ${v}% significantly exceeds ${t.sd}% for ${t.label}. Investor experience will suffer during drawdowns. Skip.`}; }},
  { id:"beta", type:"gate", title:"Beta Check", subtitle:"Market sensitivity — match to your risk profile & horizon", question:"3-Year Beta", placeholder:"e.g. 0.95",
    evaluate:(val,cat)=>{ const t=CATEGORY_THRESHOLDS[cat],v=parseFloat(val),[lo,hi]=t.beta; if(["arbitrage","liquid","overnight","sectormetals"].includes(cat))return{status:"pass",label:"N/A for this category",msg:"Beta vs equity benchmark is not a meaningful metric for this fund type."}; if(v>=lo&&v<=hi)return{status:"pass",label:`Ideal ${lo}–${hi}`,msg:`Beta of ${v} is within the ideal range for ${t.label}.`}; if(v<lo)return{status:"warn",label:"Defensively positioned",msg:`Beta of ${v} is below ideal. Good for conservative profiles — may lag in strong bull markets.`}; if(v>hi&&v<=hi+0.15)return{status:"warn",label:"Slightly aggressive",msg:`Beta of ${v} slightly above range. Acceptable for growth-oriented, long-horizon investors.`}; return{status:"warn",label:"High market sensitivity",msg:`Beta of ${v} amplifies both gains and losses. Only appropriate for aggressive investors with 8+ year horizon.`}; }},
  { id:"returns", type:"returns" },
  { id:"verdict", type:"verdict" },
];

const StatusBadge = ({ status, label }) => {
  const cfg={pass:{bg:COLORS.passDim,border:COLORS.pass,color:COLORS.pass,icon:"✓"},warn:{bg:COLORS.warnDim,border:COLORS.warn,color:COLORS.warn,icon:"⚠"},fail:{bg:COLORS.dangerDim,border:COLORS.danger,color:COLORS.danger,icon:"✗"}}[status]||{bg:COLORS.accentDim,border:COLORS.accent,color:COLORS.accent,icon:"•"};
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,background:cfg.bg,border:`1px solid ${cfg.border}`,color:cfg.color,borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700,letterSpacing:"0.05em",fontFamily:"'DM Mono',monospace"}}>{cfg.icon} {label}</span>;
};

const ProgressBar = ({ current, total }) => (
  <div style={{display:"flex",gap:3,marginBottom:26}}>
    {Array.from({length:total}).map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<current?COLORS.accent:COLORS.cardBorder,transition:"background 0.3s"}}/>)}
  </div>
);

export default function MutualFundDecisionTree() {
  const [stepIndex, setStepIndex] = useState(0);
  const [category, setCategory] = useState("");
  const [inputs, setInputs] = useState({});
  const [results, setResults] = useState({});
  const [returnInputs, setReturnInputs] = useState({r1:"",r3:"",r5:"",r10:""});
  const [search, setSearch] = useState("");
  const [expandedGroup, setExpandedGroup] = useState(null);

  const currentStep = steps[stepIndex];

  const filteredGroups = useMemo(()=>{
    if(!search)return CATEGORY_GROUP_MAP;
    const q=search.toLowerCase();
    const out={};
    for(const[g,keys]of Object.entries(CATEGORY_GROUP_MAP)){const m=keys.filter(k=>CATEGORY_THRESHOLDS[k]?.label.toLowerCase().includes(q));if(m.length)out[g]=m;}
    return out;
  },[search]);

  const handleCategorySelect=(cat)=>{setCategory(cat);setStepIndex(1);};

  const handleGateNext=(stepId)=>{
    const val=inputs[stepId];
    if(val===""||val===undefined)return;
    const step=steps.find(s=>s.id===stepId);
    const result=step.evaluate(val,category);
    setResults(prev=>({...prev,[stepId]:result}));
    setStepIndex(prev=>prev+1);
  };

  const evaluateReturns=()=>{
    const{r1,r3,r5,r10}=returnInputs;
    const flags=[];
    const filled=[{label:"1Y",val:parseFloat(r1)},{label:"3Y",val:parseFloat(r3)},{label:"5Y",val:parseFloat(r5)},{label:"10Y",val:parseFloat(r10)}].filter(v=>!isNaN(v.val));
    if(filled.length===0){setStepIndex(prev=>prev+1);return;}
    if(!filled.every(v=>v.val>0))flags.push({status:"fail",msg:"One or more return periods are negative. Significant concern for a long-term holding."});
    let consistent=true;
    for(let i=0;i<filled.length-1;i++)if(Math.abs(filled[i].val-filled[i+1].val)>10)consistent=false;
    if(!consistent)flags.push({status:"warn",msg:"Large variance between periods — verify if manager changed or category had a structural shift."});
    if(filled.length>=2&&filled[filled.length-1].val<filled[0].val*0.65)flags.push({status:"warn",msg:"Long-term returns significantly lag short-term. Recent surge may not be sustained historically."});
    if(flags.length===0)flags.push({status:"pass",msg:"Return history is consistent across all available periods. Durable performance signature."});
    setResults(prev=>({...prev,returns:flags}));
    setStepIndex(prev=>prev+1);
  };

  const computeVerdict=()=>{
    const all=Object.values(results);
    const fails=all.filter(r=>Array.isArray(r)?r.some(x=>x.status==="fail"):r.status==="fail").length;
    const warns=all.filter(r=>Array.isArray(r)?r.some(x=>x.status==="warn"):r.status==="warn").length;
    if(fails===0&&warns<=1)return{decision:"SELECT THIS FUND",color:COLORS.pass,bg:COLORS.passDim,border:COLORS.pass,icon:"✓",msg:"Passes all critical checks with strong or acceptable marks across every factor. High conviction pick."};
    if(fails===0&&warns<=3)return{decision:"PROCEED WITH CAUTION",color:COLORS.warn,bg:COLORS.warnDim,border:COLORS.warn,icon:"⚠",msg:"Multiple caution flags raised. Acceptable if no better alternatives exist — monitor closely after investing."};
    if(fails===1&&warns<=2)return{decision:"CONSIDER NEXT FUND",color:COLORS.warn,bg:COLORS.warnDim,border:COLORS.warn,icon:"⚠",msg:"One hard fail detected. Move to the next fund in your Sharpe-sorted list unless this fund has a uniquely compelling attribute."};
    return{decision:"SKIP — MOVE TO NEXT",color:COLORS.danger,bg:COLORS.dangerDim,border:COLORS.danger,icon:"✗",msg:`${fails} hard fail(s) and ${warns} warning(s). This fund does not meet your standards. Move down your Sharpe-sorted list.`};
  };

  const reset=()=>{setStepIndex(0);setCategory("");setInputs({});setResults({});setReturnInputs({r1:"",r3:"",r5:"",r10:""});setSearch("");setExpandedGroup(null);};
  const stepResultSummary=()=>["sharpe","fees","rsq","alpha","sd","beta"].filter(id=>results[id]).map(id=>({id,label:{sharpe:"Sharpe Ratio",fees:"Fees",rsq:"R-Squared",alpha:"Alpha",sd:"Std Deviation",beta:"Beta"}[id],result:results[id]}));
  const cat=CATEGORY_THRESHOLDS[category];

  return (
    <div style={{minHeight:"100vh",background:COLORS.bg,fontFamily:"Georgia,serif",color:COLORS.text,padding:"34px 16px"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;}
        .fi{width:100%;background:#0d1420;border:1px solid ${COLORS.cardBorder};color:${COLORS.text};padding:11px 14px;border-radius:8px;font-size:15px;font-family:'DM Mono',monospace;outline:none;transition:border-color 0.2s;}
        .fi:focus{border-color:${COLORS.accent};}
        .fb{background:${COLORS.accent};color:#0a0e1a;border:none;padding:11px 26px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:0.08em;font-family:'DM Sans',sans-serif;text-transform:uppercase;transition:opacity 0.2s,transform 0.1s;}
        .fb:hover{opacity:0.88;transform:translateY(-1px);}
        .fb:disabled{opacity:0.35;cursor:not-allowed;transform:none;}
        .sb{background:transparent;border:1px solid ${COLORS.cardBorder};color:${COLORS.textDim};padding:11px 18px;border-radius:8px;font-size:13px;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;}
        .sb:hover{border-color:${COLORS.textDim};color:${COLORS.textMid};}
        .cat-item{background:#0d1420;border:1px solid ${COLORS.cardBorder};color:${COLORS.textMid};padding:9px 13px;border-radius:7px;font-size:12px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all 0.15s;display:flex;align-items:flex-start;gap:8px;text-align:left;width:100%;}
        .cat-item:hover{background:${COLORS.accentDim};border-color:${COLORS.accent};color:${COLORS.accent};}
        .grp-hdr{display:flex;align-items:center;justify-content:space-between;padding:9px 12px;border-radius:8px;cursor:pointer;transition:background 0.15s;margin-bottom:4px;}
        .grp-hdr:hover{background:#ffffff08;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#1e2a3a;border-radius:4px;}
      `}</style>
      <div style={{maxWidth:680,margin:"0 auto"}}>

        {/* Header */}
        <div style={{marginBottom:32,textAlign:"center"}}>
          <div style={{display:"inline-block",background:COLORS.accentDim,border:`1px solid ${COLORS.accentBorder}`,color:COLORS.accent,borderRadius:20,padding:"4px 14px",fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:"0.12em",marginBottom:14,textTransform:"uppercase"}}>
            Portfolio Manager Framework · Morningstar India · 54 Categories
          </div>
          <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(20px,5vw,32px)",fontWeight:400,margin:"0 0 8px",color:"#f1f5f9",lineHeight:1.2}}>
            Mutual Fund Selection Decision Tree
          </h1>
          <p style={{color:COLORS.textMid,fontSize:13,fontFamily:"'DM Sans',sans-serif",margin:0}}>
            Start from your Sharpe-sorted Morningstar list · Evaluate each fund factor by factor
          </p>
        </div>

        {stepIndex>0&&<ProgressBar current={stepIndex} total={steps.length}/>}

        {/* MAIN CARD */}
        <div style={{background:COLORS.card,border:`1px solid ${COLORS.cardBorder}`,borderRadius:16,padding:"24px 26px",marginBottom:14}}>

          {/* CATEGORY SELECT */}
          {currentStep.type==="category"&&(
            <div>
              <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:COLORS.accent,letterSpacing:"0.1em",marginBottom:6}}>STEP 1 OF 9</div>
              <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,fontWeight:400,margin:"0 0 4px",color:"#f1f5f9"}}>Select Fund Category</h2>
              <p style={{color:COLORS.textMid,fontSize:13,fontFamily:"'DM Sans',sans-serif",margin:"0 0 18px"}}>All 54 Morningstar India categories — thresholds auto-calibrate per selection</p>
              <input className="fi" placeholder="🔍  Search category..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}/>
              <div style={{maxHeight:430,overflowY:"auto",paddingRight:2}}>
                {Object.entries(filteredGroups).map(([group,keys])=>{
                  const gColor=GROUP_COLORS[group]||COLORS.accent;
                  const isOpen=expandedGroup===group||!!search;
                  return(
                    <div key={group} style={{marginBottom:6}}>
                      <div className="grp-hdr" onClick={()=>setExpandedGroup(isOpen&&!search?null:group)} style={{background:isOpen?"#ffffff06":"transparent"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:9,height:9,borderRadius:"50%",background:gColor}}/>
                          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:COLORS.text}}>{group}</span>
                          <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:COLORS.textDim}}>{keys.length}</span>
                        </div>
                        <span style={{color:COLORS.textDim,fontSize:11}}>{isOpen?"▲":"▼"}</span>
                      </div>
                      {isOpen&&(
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,paddingLeft:6,paddingBottom:2}}>
                          {keys.map(k=>{
                            const c=CATEGORY_THRESHOLDS[k];
                            if(!c)return null;
                            return(
                              <button key={k} className="cat-item" onClick={()=>handleCategorySelect(k)}>
                                <div style={{width:6,height:6,borderRadius:"50%",background:gColor,flexShrink:0,marginTop:3}}/>
                                <div>
                                  <div style={{fontWeight:600,fontSize:12,lineHeight:1.3}}>{c.label}</div>
                                  <div style={{fontSize:10,opacity:0.5,marginTop:2}}>Fee≤{c.fees}% · Sharpe≥{c.sharpeMin}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GATE STEPS */}
          {currentStep.type==="gate"&&cat&&(
            <div>
              <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:COLORS.accent,letterSpacing:"0.1em",marginBottom:6}}>
                STEP {stepIndex+1} OF 9 · <span style={{color:GROUP_COLORS[cat.group]||COLORS.accent}}>{cat.label}</span>
              </div>
              <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,fontWeight:400,margin:"0 0 4px",color:"#f1f5f9"}}>{currentStep.title}</h2>
              <p style={{color:COLORS.textMid,fontSize:13,fontFamily:"'DM Sans',sans-serif",margin:"0 0 16px"}}>{currentStep.subtitle}</p>
              <div style={{background:COLORS.accentDim,border:`1px solid ${COLORS.accentBorder}`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,fontFamily:"'DM Sans',sans-serif",color:COLORS.accent,lineHeight:1.5}}>
                <strong>📌 {cat.label}: </strong>
                {currentStep.id==="sharpe"&&`Minimum: ${cat.sharpeMin} · Excellent: ≥1.0`}
                {currentStep.id==="fees"&&`Ceiling: ${cat.fees}% · ${cat.hint}`}
                {currentStep.id==="rsq"&&`Target: 70–${cat.rsq} for active funds · >95 = closet indexer`}
                {currentStep.id==="alpha"&&cat.alphaNote}
                {currentStep.id==="sd"&&`Ceiling: ${cat.sd}% · ${cat.hint}`}
                {currentStep.id==="beta"&&`Ideal range: ${cat.beta[0]}–${cat.beta[1]}`}
              </div>
              <label style={{display:"block",marginBottom:8,fontSize:13,color:COLORS.textMid,fontFamily:"'DM Sans',sans-serif"}}>{currentStep.question}</label>
              <input className="fi" type="number" step="0.01" placeholder={currentStep.placeholder}
                value={inputs[currentStep.id]||""}
                onChange={e=>setInputs(prev=>({...prev,[currentStep.id]:e.target.value}))}
                onKeyDown={e=>e.key==="Enter"&&handleGateNext(currentStep.id)}/>
              <div style={{display:"flex",gap:10,marginTop:16}}>
                <button className="fb" onClick={()=>handleGateNext(currentStep.id)} disabled={!inputs[currentStep.id]&&inputs[currentStep.id]!==0}>Evaluate →</button>
                <button className="sb" onClick={()=>setStepIndex(prev=>prev+1)}>Skip (N/A)</button>
              </div>
            </div>
          )}

          {/* RETURNS */}
          {currentStep.type==="returns"&&(
            <div>
              <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:COLORS.accent,letterSpacing:"0.1em",marginBottom:6}}>
                STEP 8 OF 9 · <span style={{color:GROUP_COLORS[cat?.group]||COLORS.accent}}>{cat?.label}</span>
              </div>
              <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,fontWeight:400,margin:"0 0 4px",color:"#f1f5f9"}}>Long-Term Return Consistency</h2>
              <p style={{color:COLORS.textMid,fontSize:13,fontFamily:"'DM Sans',sans-serif",margin:"0 0 16px"}}>Consistency across periods beats peak short-term performance</p>
              <div style={{background:COLORS.accentDim,border:`1px solid ${COLORS.accentBorder}`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,fontFamily:"'DM Sans',sans-serif",color:COLORS.accent}}>
                <strong>Weighting:</strong> 10Y = 40% · 5Y = 30% · 3Y = 20% · 1Y = 10%
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
                {[{k:"r1",l:"1-Year Annualised (%)",w:"10%"},{k:"r3",l:"3-Year Annualised (%)",w:"20%"},{k:"r5",l:"5-Year Annualised (%)",w:"30%"},{k:"r10",l:"10-Year Annualised (%)",w:"40%"}].map(f=>(
                  <div key={f.k}>
                    <label style={{display:"block",marginBottom:6,fontSize:12,color:COLORS.textDim,fontFamily:"'DM Sans',sans-serif"}}>{f.l} <span style={{color:COLORS.accent}}>({f.w})</span></label>
                    <input className="fi" type="number" step="0.1" placeholder="e.g. 14.2" value={returnInputs[f.k]} onChange={e=>setReturnInputs(prev=>({...prev,[f.k]:e.target.value}))}/>
                  </div>
                ))}
              </div>
              <div style={{display:"flex",gap:10}}>
                <button className="fb" onClick={evaluateReturns} disabled={!returnInputs.r1&&!returnInputs.r3&&!returnInputs.r5&&!returnInputs.r10}>Evaluate Returns →</button>
                <button className="sb" onClick={()=>setStepIndex(prev=>prev+1)}>Skip</button>
              </div>
            </div>
          )}

          {/* VERDICT */}
          {currentStep.type==="verdict"&&(()=>{
            const v=computeVerdict();
            const summary=stepResultSummary();
            return(
              <div>
                <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:COLORS.accent,letterSpacing:"0.1em",marginBottom:6}}>
                  FINAL VERDICT · <span style={{color:GROUP_COLORS[cat?.group]||COLORS.accent}}>{cat?.label}</span>
                </div>
                <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,fontWeight:400,margin:"0 0 18px",color:"#f1f5f9"}}>Decision Summary</h2>
                <div style={{background:v.bg,border:`2px solid ${v.border}`,borderRadius:12,padding:"16px 20px",marginBottom:20,display:"flex",alignItems:"flex-start",gap:14}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:v.border,color:"#0a0e1a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:700,flexShrink:0}}>{v.icon}</div>
                  <div>
                    <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:700,color:v.color,marginBottom:5,letterSpacing:"0.04em"}}>{v.decision}</div>
                    <div style={{fontSize:13,color:COLORS.textMid,fontFamily:"'DM Sans',sans-serif",lineHeight:1.5}}>{v.msg}</div>
                  </div>
                </div>
                <div style={{marginBottom:18}}>
                  <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:COLORS.textDim,letterSpacing:"0.1em",marginBottom:10,textTransform:"uppercase"}}>Factor Scorecard</div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {summary.map(s=>(
                      <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0d1420",border:`1px solid ${COLORS.cardBorder}`,borderRadius:8,padding:"9px 13px"}}>
                        <span style={{fontSize:13,fontFamily:"'DM Sans',sans-serif",color:COLORS.textMid}}>{s.label}</span>
                        <StatusBadge status={s.result.status} label={s.result.label}/>
                      </div>
                    ))}
                    {results.returns&&(
                      <div style={{background:"#0d1420",border:`1px solid ${COLORS.cardBorder}`,borderRadius:8,padding:"9px 13px"}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:results.returns.length>1?5:0}}>
                          <span style={{fontSize:13,fontFamily:"'DM Sans',sans-serif",color:COLORS.textMid}}>Returns</span>
                          <StatusBadge status={results.returns[0].status} label={results.returns[0].status==="pass"?"Consistent":"Flags Raised"}/>
                        </div>
                        {results.returns.map((r,i)=><div key={i} style={{fontSize:11,color:COLORS.textDim,fontFamily:"'DM Sans',sans-serif",marginTop:3}}>{r.msg}</div>)}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:COLORS.textDim,letterSpacing:"0.1em",marginBottom:10,textTransform:"uppercase"}}>Detailed Notes</div>
                  {summary.map(s=>(
                    <div key={s.id} style={{fontSize:12,color:COLORS.textMid,fontFamily:"'DM Sans',sans-serif",lineHeight:1.6,paddingLeft:12,borderLeft:`2px solid ${COLORS.cardBorder}`,marginBottom:8}}>
                      <strong style={{color:COLORS.text}}>{s.label}:</strong> {s.result.msg}
                    </div>
                  ))}
                </div>
                <button className="fb" onClick={reset} style={{width:"100%",background:COLORS.cardBorder,color:COLORS.textMid}}>↺ Evaluate Another Fund</button>
              </div>
            );
          })()}
        </div>

        {/* Running scorecard */}
        {stepIndex>1&&stepIndex<steps.length-1&&Object.keys(results).length>0&&(
          <div style={{background:COLORS.card,border:`1px solid ${COLORS.cardBorder}`,borderRadius:12,padding:"13px 16px"}}>
            <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:COLORS.textDim,letterSpacing:"0.1em",marginBottom:9,textTransform:"uppercase"}}>Checks Completed</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {stepResultSummary().map(s=>(
                <div key={s.id} style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{fontSize:11,color:COLORS.textDim,fontFamily:"'DM Sans',sans-serif"}}>{s.label}</span>
                  <StatusBadge status={s.result.status} label={s.result.label}/>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{textAlign:"center",marginTop:26,fontSize:10,color:COLORS.textDim,fontFamily:"'DM Mono',monospace",lineHeight:1.8}}>
          Framework calibrated for Indian mutual funds · Morningstar India categories<br/>
          <span style={{color:"#ef444488"}}>For educational purposes only · Not SEBI-registered investment advice</span>
        </div>
      </div>
    </div>
  );
}

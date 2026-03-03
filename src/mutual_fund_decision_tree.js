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
  largecap: { label:"Large Cap", group:"Equity", fees:0.8, sd:15, alpha:0, beta:[0.85,1.05], rsq:85, sharpeMin:0.9, hint:"Top 100 stocks. Look for High Active Share & Information Ratio to justify fees.", alphaNote:"Alpha should be evaluated on rolling 3-year periods over a 7-year horizon." },
  midcap: { label:"Mid Cap", group:"Equity", fees:1.2, sd:20, alpha:1.0, beta:[0.9,1.15], rsq:75, sharpeMin:0.75, hint:"101–250. Watch AUM capacity. 7-10 yr cycles matter more than trailing 3Y Sharpe.", alphaNote:"Active alpha of 1%+ expected. Ensure AUM size doesn't create impact-cost drag." },
  smallcap: { label:"Small Cap", group:"Equity", fees:1.5, sd:25, alpha:1.5, beta:[0.9,1.25], rsq:65, sharpeMin:0.65, hint:"251+. Structurally volatile. Heavy AUM penalty applies. Use Downside Capture/Sortino.", alphaNote:"Alpha decays rapidly past ₹15k Cr AUM. Deep liquidity research justifies the fee." },
  multicap: { label:"Multi Cap", group:"Equity", fees:1.2, sd:20, alpha:1.0, beta:[0.9,1.15], rsq:70, sharpeMin:0.75, hint:"Forced 25% allocation creates natural volatility. Look for managers who use this mandate wisely.", alphaNote:"Forced small/mid allocation creates structural volatility. Alpha of 1.0%+ expected." },
  largemidcap: { label:"Large & Mid Cap", group:"Equity", fees:1.1, sd:18, alpha:0.8, beta:[0.88,1.1], rsq:78, sharpeMin:0.78, hint:"Min 35% each in Large & Mid. Alpha expected from the mid-cap allocation.", alphaNote:"Blend of large cap stability and mid cap growth. Evaluate rolling returns." },
  flexicap: { label:"Flexi Cap", group:"Equity", fees:1.0, sd:17, alpha:0.5, beta:[0.85,1.1], rsq:78, sharpeMin:0.8, hint:"Unrestricted allocation. Dynamic allocation skill is the key differentiator.", alphaNote:"Penalize benchmark-hugging. True flexi-caps should exhibit dynamic market cap shifts." },
  focused: { label:"Focused", group:"Equity", fees:1.2, sd:19, alpha:1.0, beta:[0.85,1.15], rsq:68, sharpeMin:0.75, hint:"Max 30 stocks. Concentration risk is the feature, not a bug. Low R² expected.", alphaNote:"High R² means the manager is diluting the mandate. Look for idiosyncratic alpha." },
  elss: { label:"ELSS", group:"Equity", fees:1.2, sd:18, alpha:0.5, beta:[0.85,1.1], rsq:78, sharpeMin:0.75, hint:"3-year lock-in. Structural advantage in managing redemptions.", alphaNote:"Lock-in is a behavioural advantage for the manager. Expect a liquidity premium in returns." },
  contra: { label:"Contra", group:"Equity", fees:1.3, sd:20, alpha:1.0, beta:[0.8,1.1], rsq:65, sharpeMin:0.68, hint:"Invests against sentiment. Extremely lumpy returns; requires full cycle evaluation.", alphaNote:"Judge over full market cycles. 3Y metrics will consistently misclassify contra funds." },
  value: { label:"Value", group:"Equity", fees:1.2, sd:18, alpha:0.8, beta:[0.82,1.08], rsq:68, sharpeMin:0.70, hint:"Buys undervalued stocks. Lags in momentum markets. 7-10yr lens required.", alphaNote:"Value strategies lag in momentum markets. 5–10yr rolling metrics are appropriate." },
  dividendyield: { label:"Dividend Yield", group:"Equity", fees:1.1, sd:15, alpha:0.5, beta:[0.78,1.0], rsq:72, sharpeMin:0.78, hint:"Defensive positing. Reward consistent dividends and lower drawdowns.", alphaNote:"Defensive posturing naturally suppresses beta. Focus on yield + capital preservation." },
  equityconsumption: { label:"Equity — Consumption", group:"Equity", fees:1.5, sd:18, alpha:1.0, beta:[0.82,1.1], rsq:65, sharpeMin:0.68, hint:"Thematic bet. Cyclically sensitive to rural income and urban sentiment.", alphaNote:"Consumption has decade-long tailwinds. Evaluate against sector valuation multiples." },
  equityesg: { label:"Equity — ESG", group:"Equity", fees:1.3, sd:16, alpha:0.5, beta:[0.83,1.05], rsq:72, sharpeMin:0.75, hint:"Screens for ESG criteria. Mandate restrictions can create tracking error.", alphaNote:"ESG data quality in India is maturing. Verify screening rigour vs benchmark hugging." },
  equityinfra: { label:"Equity — Infrastructure", group:"Equity", fees:1.5, sd:22, alpha:1.0, beta:[0.88,1.25], rsq:62, sharpeMin:0.60, hint:"Highly policy-sensitive and cyclical. Heavy mean-reversion potential.", alphaNote:"Performance tied to government capex. Do not project peak-cycle 3Y returns forward." },
  equityothers: { label:"Equity — Others", group:"Equity", fees:1.3, sd:20, alpha:0.8, beta:[0.82,1.2], rsq:65, sharpeMin:0.65, hint:"Catch-all thematic. Requires mandate scrutiny and custom benchmarking.", alphaNote:"Benchmark carefully. Focus on absolute Sharpe and rolling consistency." },
  equitysavings: { label:"Equity — Savings", group:"Equity", fees:0.9, sd:8, alpha:0.3, beta:[0.3,0.6], rsq:50, sharpeMin:0.85, hint:"FD alternative with equity taxation. Downside protection is paramount.", alphaNote:"Alpha from equity portion is muted. Focus heavily on Max Drawdown and Sharpe." },
  // ── SECTORAL ──
  sectorenergy: { label:"Sector — Energy", group:"Sectoral", fees:1.5, sd:24, alpha:1.0, beta:[0.88,1.3], rsq:62, sharpeMin:0.55, hint:"Tactical allocation. Strip out long-term accrual consistency checks.", alphaNote:"Macro and global commodity cycles dictate returns. Value based on forward multiples." },
  sectorfinancial: { label:"Sector — Financial Services", group:"Sectoral", fees:1.5, sd:22, alpha:1.0, beta:[0.92,1.25], rsq:72, sharpeMin:0.60, hint:"High natural R² vs broader indices. Focus on NBFC/Bank quality mix.", alphaNote:"High R² is structural here. Focus on active bets outside the top 4 private banks." },
  sectorfmcg: { label:"Sector — FMCG", group:"Sectoral", fees:1.5, sd:14, alpha:0.8, beta:[0.72,1.0], rsq:65, sharpeMin:0.70, hint:"Defensive hedge. Alpha comes from picking rural-urban shift beneficiaries.", alphaNote:"High historical valuations. Check relative P/E multiples vs 10Y average before entry." },
  sectorhealthcare: { label:"Sector — Healthcare", group:"Sectoral", fees:1.5, sd:20, alpha:1.2, beta:[0.78,1.15], rsq:60, sharpeMin:0.62, hint:"Regulatory cycles create episodic volatility. Deep pharma research matters.", alphaNote:"USFDA compliance is a primary risk driver. Manager's bottom-up skill is critical." },
  sectormetals: { label:"Sector — Precious Metals", group:"Sectoral", fees:1.0, sd:22, alpha:0.5, beta:[0.4,0.9], rsq:35, sharpeMin:0.40, hint:"Portfolio hedge. Low correlation to equity is the value proposition.", alphaNote:"Gold is a macro hedge. Do not evaluate on traditional alpha/beta metrics." },
  sectortech: { label:"Sector — Tech", group:"Sectoral", fees:1.5, sd:22, alpha:1.2, beta:[0.88,1.3], rsq:65, sharpeMin:0.62, hint:"Sensitive to INR/USD and global tech capex. Tactical macro play.", alphaNote:"Assess manager's view on global enterprise spending, not just trailing 3Y IT returns." },
  // ── HYBRID & ALLOCATION ──
  aggressivealloc: { label:"Aggressive Allocation", group:"Hybrid & Allocation", fees:1.2, sd:16, alpha:0.5, beta:[0.72,1.0], rsq:72, sharpeMin:0.82, hint:"Equity drives returns. Strong Sharpe with smooth drawdowns is the hallmark.", alphaNote:"Asset allocation + stock picking. Evaluate downside capture ratios heavily." },
  balancedalloc: { label:"Balanced Allocation", group:"Hybrid & Allocation", fees:1.0, sd:12, alpha:0.3, beta:[0.55,0.82], rsq:65, sharpeMin:0.85, hint:"Classic 50/50. A high alpha but poor Sharpe defeats the fund's purpose.", alphaNote:"Risk-adjusted returns (Sortino, Sharpe) outweigh pure alpha generation here." },
  conservativealloc: { label:"Conservative Allocation", group:"Hybrid & Allocation", fees:0.9, sd:7, alpha:0.2, beta:[0.25,0.55], rsq:45, sharpeMin:0.88, hint:"Capital preservation. Scrutinize the credit quality of the 70%+ debt portion.", alphaNote:"Sharpe should be high due to low SD. Credit defaults are the main risk." },
  dynamicassetalloc: { label:"Dynamic Asset Allocation", group:"Hybrid & Allocation", fees:1.0, sd:12, alpha:0.3, beta:[0.45,0.85], rsq:58, sharpeMin:0.88, hint:"BAF. The proprietary model is the alpha. Evaluate Max Drawdown rigorously.", alphaNote:"Calculating Alpha/Beta against a static 50/50 index is misleading. Focus on Sortino." },
  multiassetalloc: { label:"Multi-Asset Allocation", group:"Hybrid & Allocation", fees:1.1, sd:13, alpha:0.5, beta:[0.5,0.88], rsq:55, sharpeMin:0.85, hint:"True diversification. Low R² is structurally correct and desirable.", alphaNote:"The non-correlated asset mix IS the strategy. Compare Sharpe vs peer group." },
  retirement: { label:"Retirement", group:"Hybrid & Allocation", fees:1.1, sd:14, alpha:0.3, beta:[0.55,0.9], rsq:62, sharpeMin:0.82, hint:"Lifecycle-based. Focus on consistent compounding over the full lock-in.", alphaNote:"Evaluate manager consistency over full 5-year lock-in blocks, ignoring 1Y noise." },
  arbitrage: { label:"Arbitrage Fund", group:"Hybrid & Allocation", fees:0.5, sd:1.5, alpha:0.0, beta:[0.0,0.15], rsq:5, sharpeMin:0.6, hint:"Liquid-fund equivalent with equity tax. Cash-futures spread strategy.", alphaNote:"Beta and R² are meaningless. Compare post-tax yield against liquid funds." },
  // ── DEBT ──
  liquid: { label:"Liquid", group:"Debt", fees:0.2, sd:0.5, alpha:0.0, beta:[0.0,0.05], rsq:5, sharpeMin:0.5, hint:"Safety > Returns. Reject anything holding sub-A1+ rated paper.", alphaNote:"Sharpe is mathematically flawed here. Rank strictly on YTM minus fees with pristine credit." },
  overnight: { label:"Overnight", group:"Debt", fees:0.1, sd:0.1, alpha:0.0, beta:[0.0,0.02], rsq:2, sharpeMin:0.3, hint:"Safest category. Returns track RBI repo rate. Zero credit risk allowed.", alphaNote:"No active alpha possible. Strict fee minimization is the only valid screen." },
  ultrashorttduration: { label:"Ultra Short Duration", group:"Debt", fees:0.4, sd:1.0, alpha:0.0, beta:[0.0,0.08], rsq:8, sharpeMin:0.6, hint:"Marginal yield over liquid. Watch for credit-quality dilution for yield.", alphaNote:"Some managers chase yield with AA paper. Ensure credit risk matches your profile." },
  lowduration: { label:"Low Duration", group:"Debt", fees:0.5, sd:1.5, alpha:0.1, beta:[0.02,0.15], rsq:12, sharpeMin:0.65, hint:"6–12 month duration. Credit risk is the primary performance lever.", alphaNote:"Duration risk is minimal. Scrutinize the credit rating distribution explicitly." },
  moneymkt: { label:"Money Market", group:"Debt", fees:0.3, sd:0.8, alpha:0.0, beta:[0.0,0.08], rsq:6, sharpeMin:0.55, hint:"High quality, highly liquid. Fees above 0.3% destroy the yield advantage.", alphaNote:"Purely an accrual play on high-grade short-term paper. Keep fees low." },
  shorttduration: { label:"Short Duration", group:"Debt", fees:0.6, sd:2.5, alpha:0.2, beta:[0.05,0.25], rsq:20, sharpeMin:0.70, hint:"1–3 year duration. First bucket where active rate calls matter slightly.", alphaNote:"Active duration management starts contributing. Evaluate manager's rate cycle calls." },
  mediumduration: { label:"Medium Duration", group:"Debt", fees:0.8, sd:4.5, alpha:0.3, beta:[0.1,0.45], rsq:35, sharpeMin:0.72, hint:"3–4 year duration. Meaningful interest rate risk. Needs macro view.", alphaNote:"Evaluate track record across at least two RBI rate hike/cut cycles." },
  mediumlongduration: { label:"Medium to Long Duration", group:"Debt", fees:0.9, sd:6.5, alpha:0.4, beta:[0.15,0.6], rsq:45, sharpeMin:0.68, hint:"Significant rate sensitivity. Best entered at peak rate cycles.", alphaNote:"Forward-looking duration bet. Backward-looking 3Y trailing returns are misleading." },
  longduration: { label:"Long Duration", group:"Debt", fees:1.0, sd:9.0, alpha:0.5, beta:[0.2,0.75], rsq:55, sharpeMin:0.62, hint:"7+ year duration. Tactical positioning for rate cuts only. High NAV risk.", alphaNote:"Do not evaluate on trailing metrics. Model on forward Yield Curve and Modified Duration." },
  dynamicbond: { label:"Dynamic Bond", group:"Debt", fees:0.9, sd:5.0, alpha:0.4, beta:[0.05,0.6], rsq:38, sharpeMin:0.70, hint:"Pure active debt management. Manager's rate conviction IS the product.", alphaNote:"Manager moves freely across durations. Track record of anticipating RBI moves is key." },
  corporatebond: { label:"Corporate Bond", group:"Debt", fees:0.6, sd:3.0, alpha:0.3, beta:[0.05,0.3], rsq:25, sharpeMin:0.75, hint:"Min 80% AA+. Reject funds dropping below this floor to pad yields.", alphaNote:"Credit quality floor is rigid. Yield generation must come from curve positioning." },
  bankingpsu: { label:"Banking & PSU", group:"Debt", fees:0.4, sd:2.5, alpha:0.1, beta:[0.03,0.22], rsq:18, sharpeMin:0.78, hint:"Quasi-sovereign quality. Lowest credit risk outside G-Secs.", alphaNote:"Minimal active skill required. Enforce strict fee ceilings." },
  creditrisk: { label:"Credit Risk", group:"Debt", fees:1.0, sd:5.5, alpha:0.8, beta:[0.1,0.55], rsq:30, sharpeMin:0.55, hint:"Deliberate risk for yield. Manager's default avoidance is the only alpha.", alphaNote:"Credit research quality is paramount. Examine the illiquidity premium." },
  govbond: { label:"Government Bond", group:"Debt", fees:0.5, sd:7.0, alpha:0.2, beta:[0.15,0.65], rsq:50, sharpeMin:0.62, hint:"Zero credit risk, pure duration. Volatile during rate hike cycles.", alphaNote:"Evaluate exclusively on duration management capabilities. Ideal for rate cut cycles." },
  "10yrgovbond": { label:"10yr Gov Bond", group:"Debt", fees:0.3, sd:8.0, alpha:0.1, beta:[0.2,0.8], rsq:60, sharpeMin:0.55, hint:"Benchmark duration bet. Highly sensitive to global and domestic yields.", alphaNote:"A pure macro bet. Evaluate based on current 10Y vs 2Y yield spread." },
  floating: { label:"Floating Rate", group:"Debt", fees:0.4, sd:1.2, alpha:0.1, beta:[0.0,0.1], rsq:8, sharpeMin:0.68, hint:"Natural hedge for rising rates. Low duration risk by design.", alphaNote:"Best tactical holding during RBI rate hike cycles." },
  otherbond: { label:"Other Bond", group:"Debt", fees:0.7, sd:4.0, alpha:0.3, beta:[0.05,0.4], rsq:28, sharpeMin:0.65, hint:"Catch-all. Scrutinize the actual portfolio for hidden credit/duration risks.", alphaNote:"Mandate ambiguity requires deep portfolio teardown before investing." },
  // ── FIXED MATURITY ──
  fmpintermediate: { label:"Fixed Maturity — Intermediate", group:"Fixed Maturity", fees:0.5, sd:2.5, alpha:0.1, beta:[0.02,0.2], rsq:15, sharpeMin:0.70, hint:"Locks in yields. Avoids reinvestment risk. Evaluate at NFO stage.", alphaNote:"Returns locked at inception. Focus on portfolio yield vs prevailing FD rates." },
  fmpshort: { label:"Fixed Maturity — Short Term", group:"Fixed Maturity", fees:0.4, sd:1.5, alpha:0.1, beta:[0.01,0.1], rsq:10, sharpeMin:0.65, hint:"Predictable returns for specific near-term liabilities.", alphaNote:"Credit quality of the initial portfolio is the primary evaluation metric." },
  fmpultrashort: { label:"Fixed Maturity — Ultrashort", group:"Fixed Maturity", fees:0.3, sd:0.8, alpha:0.0, beta:[0.0,0.05], rsq:5, sharpeMin:0.55, hint:"Near-liquid returns in a closed structure. Keep fees minimal.", alphaNote:"Structured liquid instrument. Zero tolerance for credit risk." },
  // ── INDEX & PASSIVE ──
  indexfund: { label:"Index Fund", group:"Index & Passive", fees:0.2, sd:15, alpha:-0.1, beta:[0.97,1.03], rsq:99, sharpeMin:0.80, hint:"Passive replication. Tracking Difference and Tracking Error are key.", alphaNote:"Low fee is irrelevant if Tracking Difference exceeds 0.40%." },
  indexfixedincome: { label:"Index Fund — Fixed Income", group:"Index & Passive", fees:0.15, sd:3.5, alpha:-0.05, beta:[0.96,1.04], rsq:98, sharpeMin:0.72, hint:"Tracks debt indices. Tracking error and fee minimization are paramount.", alphaNote:"No active management implies no active fee. Lowest cost wins." },
  // ── GLOBAL & ALTERNATIVE ──
  globalother: { label:"Global — Other", group:"Global & Alternative", fees:1.5, sd:18, alpha:0.5, beta:[0.5,1.1], rsq:40, sharpeMin:0.60, hint:"Fund of Funds. INR/USD currency risk is a silent primary return driver.", alphaNote:"Factor in the double-layer of FoF fees carefully." },
  alternativeother: { label:"Alternative — Other", group:"Global & Alternative", fees:1.5, sd:15, alpha:0.5, beta:[0.1,0.7], rsq:25, sharpeMin:0.55, hint:"REITs/InvITs. Evaluated purely on non-correlation to core equity.", alphaNote:"Low R² vs equity indices is structurally correct. Focus on yield generation." },
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
  { id:"sharpe", type:"gate", title:"Sharpe/Risk-Adjusted Gate", subtitle:"Primary filter — risk-adjusted return quality", question:"3-Year Sharpe Ratio (or Sortino for BAFs)", placeholder:"e.g. 1.2",
    evaluate:(val,cat)=>{ 
      const t=CATEGORY_THRESHOLDS[cat],v=parseFloat(val); 
      if(["liquid","overnight","moneymkt","fmpultrashort"].includes(cat)) return {status:"pass",label:"N/A",msg:"Sharpe ratio is mathematically flawed for ultra-short debt (denominator too small). Proceed."};
      if(["dynamicassetalloc","balancedalloc"].includes(cat) && v<t.sharpeMin) return {status:"warn",label:"Check Sortino",msg:`Sharpe is ${v}. For BAFs, downside protection (Sortino/Max Drawdown) is strictly more critical than Sharpe. Verify separately.`};
      if(t.group==="Sectoral" && v>=1.0) return {status:"warn",label:"Cyclical Peak?",msg:`Excellent Sharpe (≥1.0) in a thematic fund often signals a peaking cycle. Do not buy purely on trailing Sharpe.`};
      if(v>=1.0)return{status:"pass",label:"Excellent ≥1.0",msg:"Strong risk-adjusted returns. High conviction to proceed."}; 
      if(v>=t.sharpeMin)return{status:"warn",label:`Acceptable ≥${t.sharpeMin}`,msg:`Above category minimum of ${t.sharpeMin}. Proceed carefully — check all other factors rigorously.`}; 
      return{status:"fail",label:"Below threshold",msg:`Sharpe of ${v.toFixed(2)} is below the ${t.sharpeMin} minimum for ${t.label}. Move to the next fund.`}; 
    }},
  { id:"fees", type:"gate", title:"Institutional Fee Check", subtitle:"The only guaranteed drag on your returns", question:"Expense Ratio (%)", placeholder:"e.g. 0.85",
    evaluate:(val,cat)=>{ 
      const t=CATEGORY_THRESHOLDS[cat],v=parseFloat(val); 
      if(t.group==="Index & Passive" && v>0.3) return {status:"fail",label:"Unjustifiable Fee",msg:`Passive replication requires zero active skill. Fees > 0.3% are unacceptable.`};
      if(v<=t.fees*0.6)return{status:"pass",label:"Very low — excellent",msg:"Cost efficiency is a strong structural advantage."}; 
      if(v<=t.fees)return{status:"pass",label:"Within range",msg:`At or below the ${t.fees}% ceiling for ${t.label}. Acceptable.`}; 
      if(v<=t.fees*1.3)return{status:"warn",label:"Slightly high",msg:`Marginally above ${t.fees}% threshold. Only acceptable if alpha clearly compensates.`}; 
      return{status:"fail",label:"Too expensive",msg:`Fees of ${v}% significantly exceed the ${t.fees}% ceiling for ${t.label}. Compounding drag is too high.`}; 
    }},
  { id:"aum", type:"gate", title:"Capacity & Liquidity Gate", subtitle:"Does the fund size hinder its strategy?", question:"Fund AUM (₹ Cr)", placeholder:"e.g. 15000",
    evaluate:(val,cat)=>{
      const t=CATEGORY_THRESHOLDS[cat],v=parseFloat(val);
      if(cat==="smallcap"){
          if(v>15000) return {status:"fail",label:"Capacity Breach",msg:"AUM > ₹15,000 Cr in Indian small caps destroys alpha via impact costs. Severe liquidity risk."};
          if(v>8000) return {status:"warn",label:"Borderline AUM",msg:"Monitor portfolio liquidity. Days-to-liquidate is likely rising, impairing active management."};
          return {status:"pass",label:"Nimble Size",msg:"Optimal capacity footprint for small cap alpha generation."};
      }
      if(cat==="midcap" && v>30000) return {status:"warn",label:"Large AUM",msg:"Alpha decay risk due to size. Ensure the fund maintains low portfolio turnover."};
      if(["indexfund","largecap"].includes(cat) && v<500) return {status:"warn",label:"Low AUM",msg:"Sub-scale AUM might lead to higher tracking error or fund closure risk."};
      return {status:"pass",label:"AUM Acceptable",msg:`Fund size is not a primary constraint for ${t.label}.`};
    }},
  { id:"rsq", type:"gate", title:(cat)=>["indexfund","indexfixedincome"].includes(cat)?"Tracking Efficiency Check":"Active Share / R-Squared Check", subtitle:"Are you paying active fees for active management?", question:(cat)=>["indexfund","indexfixedincome"].includes(cat)?"1-Year Tracking Error (%)":"3-Year R-Squared", placeholder:(cat)=>["indexfund","indexfixedincome"].includes(cat)?"e.g. 0.15":"e.g. 88",
    evaluate:(val,cat)=>{ 
      const t=CATEGORY_THRESHOLDS[cat],v=parseFloat(val); 
      if(["indexfund","indexfixedincome"].includes(cat)){
        if(v<=0.15)return{status:"pass",label:"Excellent Tracking",msg:"Tracking Error ≤ 0.15%. Institutional grade index replication."};
        if(v<=0.40)return{status:"warn",label:"Acceptable TE",msg:"Tracking error is manageable, but monitor Tracking Difference carefully."};
        return{status:"fail",label:"Poor Replication",msg:`Tracking error of ${v}% is too high for passive. Signals cash drag or poor execution.`};
      } 
      if(["arbitrage","liquid","overnight","sectormetals","alternativeother","multiassetalloc"].includes(cat))return{status:"pass",label:"N/A for category",msg:`R² vs equity benchmark is structurally low for ${t.label}. Expected and correct.`}; 
      if(v>95)return{status:"fail",label:"Closet indexer!",msg:`R² of ${v} means this fund mirrors its benchmark. With active fees, this is unjustifiable.`}; 
      if(v>=70&&v<=t.rsq)return{status:"pass",label:"Genuine active mgmt",msg:"Manager is making real active bets (high Active Share) away from the benchmark."}; 
      if(v>t.rsq&&v<=95)return{status:"warn",label:"Benchmark-hugging",msg:`R² of ${v} is above the ${t.rsq} ideal. Justify the active fee with strong Information Ratio.`}; 
      return{status:"warn",label:"Very differentiated",msg:`R² of ${v} — benchmark is a poor reference. Focus on absolute Sharpe and SD.`}; 
    }},
  { id:"macro", type:"gate", title:(cat)=>CATEGORY_THRESHOLDS[cat]?.group==="Debt"?"Credit & Macro Duration Gate":"Valuation & Macro Gate", subtitle:"Cycle positioning and underlying portfolio risk", question:(cat)=>CATEGORY_THRESHOLDS[cat]?.group==="Debt"?"% AAA / Sovereign / A1+":"Sector P/B or Valuation Check (Enter 1 for OK, 0 for High)", placeholder:(cat)=>CATEGORY_THRESHOLDS[cat]?.group==="Debt"?"e.g. 98":"1 or 0",
    evaluate:(val,cat)=>{
      const t=CATEGORY_THRESHOLDS[cat],v=parseFloat(val);
      if(t.group==="Debt" && ["liquid","overnight","moneymkt"].includes(cat)){
          if(v<95) return {status:"fail",label:"Credit Risk!",msg:`${t.label} must hold ~100% A1+/Sovereign. Yield chasing in this category is an institutional hard fail.`};
          return {status:"pass",label:"Pristine Credit",msg:"Institutional grade safety and liquidity confirmed."};
      }
      if(t.group==="Debt" && cat==="creditrisk"){
          if(v>50) return {status:"warn",label:"Mandate Drift",msg:"High AAA% in a credit risk fund defeats the purpose. Check if manager is charging high fees for safe paper."};
          return {status:"pass",label:"Expected Profile",msg:"Reflects expected credit risk profile. Default avoidance is paramount."};
      }
      if(t.group==="Sectoral"){
          if(v===0) return {status:"warn",label:"Peak Valuation",msg:"Valuation metrics suggest a cyclical peak. Sector funds are tactical; avoid entry at cycle tops."};
          return {status:"pass",label:"Valuation Check",msg:"Ensure macro tailwinds exist to justify entry."};
      }
      if(t.group==="Debt" && ["longduration","10yrgovbond","dynamicbond"].includes(cat)){
          return {status:"warn",label:"Duration Note",msg:`Ensure entry is aligned with forward macro yield curve positioning, not trailing SD.`};
      }
      return {status:"pass",label:"Gate Cleared",msg:"Macro constraints satisfied or N/A for this category."};
    }},
  { id:"alpha", type:"gate", title:"Alpha Verification", subtitle:"Is the manager genuinely adding value above benchmark?", question:"3-Year Alpha (%)", placeholder:"e.g. 2.1",
    evaluate:(val,cat)=>{ 
      const t=CATEGORY_THRESHOLDS[cat],v=parseFloat(val); 
      if(["indexfund","indexfixedincome"].includes(cat)){
        if(v>=-0.3&&v<=0.3)return{status:"pass",label:"Correct for passive",msg:"Near-zero alpha is exactly right for an index fund."};
        if(v<-0.5)return{status:"fail",label:"Excessive drag",msg:"Too much negative alpha indicates high tracking error or hidden transaction costs."};
        return{status:"warn",label:"Minor variance",msg:"Slight deviation. Acceptable but monitor."};
      } 
      if(["arbitrage","liquid","overnight"].includes(cat))return{status:"pass",label:"N/A for category",msg:"Alpha vs equity benchmark is mathematically irrelevant for this fund type."}; 
      let horizonNote = (t.group==="Sectoral" || ["smallcap","midcap"].includes(cat)) ? " (Ensure this holds over 5-7 year rolling periods, not just static 3Y)." : "";
      if(v>=t.alpha+2)return{status:"pass",label:"Exceptional alpha",msg:`Strong manager value-add of ${v}% above benchmark.` + horizonNote}; 
      if(v>=t.alpha)return{status:"pass",label:"Positive alpha",msg:`Alpha of ${v}% meets the ${t.alpha}%+ threshold for ${t.label}.` + horizonNote}; 
      if(v>=0)return{status:"warn",label:"Marginally positive",msg:"Low but positive. Acceptable only if Downside Capture is strong and fees are low."}; 
      return{status:"warn",label:"Negative alpha",msg:`Manager underperforming benchmark by ${Math.abs(v)}%. Acceptable only in BAFs if Max Drawdown compensates.`}; 
    }},
  { id:"sd", type:"gate", title:"Standard Deviation", subtitle:"Is the volatility commensurate with the returns?", question:"3-Year Standard Deviation (%)", placeholder:"e.g. 17.5",
    evaluate:(val,cat)=>{ 
      const t=CATEGORY_THRESHOLDS[cat],v=parseFloat(val); 
      if(["liquid","overnight"].includes(cat)) return {status:"pass",label:"N/A",msg:"SD is structurally minimal. Focus on credit."};
      if(["longduration","10yrgovbond"].includes(cat)) return {status:"pass",label:"Macro Driven",msg:"SD is backward-looking. Assess based on current Yield Curve and Modified Duration."};
      if(v<=t.sd*0.85)return{status:"pass",label:"Below avg — excellent",msg:`SD of ${v}% is well below the ${t.sd}% category ceiling. Smoother ride than peers.`}; 
      if(v<=t.sd)return{status:"pass",label:"Within norms",msg:`SD of ${v}% is within the expected ${t.sd}% range for ${t.label}.`}; 
      if(v<=t.sd*1.15)return{status:"warn",label:"Slightly elevated",msg:"Marginally above category norm. Acceptable if Information Ratio compensates."}; 
      return{status:"fail",label:"Excessive volatility",msg:`SD of ${v}% significantly exceeds ${t.sd}% for ${t.label}. Investor experience will suffer.`}; 
    }},
  { id:"beta", type:"gate", title:"Beta Sensitivity", subtitle:"Market sensitivity — match to your risk profile & horizon", question:"3-Year Beta", placeholder:"e.g. 0.95",
    evaluate:(val,cat)=>{ 
      const t=CATEGORY_THRESHOLDS[cat],v=parseFloat(val),[lo,hi]=t.beta; 
      if(["arbitrage","liquid","overnight","sectormetals","indexfund","indexfixedincome","longduration","10yrgovbond","dynamicbond"].includes(cat))return{status:"pass",label:"N/A for category",msg:"Beta is not the primary risk metric here (use Duration or TE)."}; 
      if(v>=lo&&v<=hi)return{status:"pass",label:`Ideal ${lo}–${hi}`,msg:`Beta of ${v} is within the institutional target range for ${t.label}.`}; 
      if(v<lo)return{status:"warn",label:"Defensively positioned",msg:`Beta of ${v} is below ideal. Good for conservative profiles — may lag in structural bull markets.`}; 
      if(v>hi&&v<=hi+0.15)return{status:"warn",label:"Slightly aggressive",msg:`Beta of ${v} slightly above range. Requires a strict 8+ year horizon.`}; 
      return{status:"warn",label:"High sensitivity",msg:`Beta of ${v} violently amplifies both gains and losses. Re-evaluate portfolio fit.`}; 
    }},
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
    
    const catGroup = CATEGORY_THRESHOLDS[category].group;
    const isEquity = ["Equity", "Sectoral", "Hybrid & Allocation"].includes(catGroup);

    if(!filled.every(v=>v.val>0) && catGroup === "Debt"){
        flags.push({status:"fail",msg:"Negative long-term returns in a debt fund indicate severe default/credit events or massive duration miscalculations. Reject."});
    }

    if(isEquity) {
      if(filled.length >= 2 && filled[0].val > filled[filled.length-1].val * 2) {
        flags.push({status:"warn",msg:"Recency bias alert: 1Y/3Y returns heavily outpace long-term average. The cycle or sector may be peaking."});
      }
      if(filled.length >= 2 && filled[filled.length-1].val < 8) {
        flags.push({status:"warn",msg:"Poor long-term compounding. Ensure the manager's strategy justifies destroying the time value of money."});
      }
      if(flags.length === 0) {
        flags.push({status:"pass",msg:"Return profile adequately captures non-linear equity compounding across market cycles."});
      }
    } else {
      let consistent=true;
      for(let i=0;i<filled.length-1;i++){
         if(Math.abs(filled[i].val-filled[i+1].val)>4) consistent=false;
      }
      if(!consistent) flags.push({status:"warn",msg:"High variance in fixed income returns suggests heavy duration bets or credit shocks rather than pure accrual."});
      if(flags.length===0) flags.push({status:"pass",msg:"Stable accrual return history confirmed."});
    }

    setResults(prev=>({...prev,returns:flags}));
    setStepIndex(prev=>prev+1);
  };

  const computeVerdict=()=>{
    const all=Object.values(results);
    const fails=all.filter(r=>Array.isArray(r)?r.some(x=>x.status==="fail"):r.status==="fail").length;
    const warns=all.filter(r=>Array.isArray(r)?r.some(x=>x.status==="warn"):r.status==="warn").length;
    if(fails===0&&warns<=1)return{decision:"SELECT THIS FUND",color:COLORS.pass,bg:COLORS.passDim,border:COLORS.pass,icon:"✓",msg:"Passes all institutional constraints with strong conviction."};
    if(fails===0&&warns<=3)return{decision:"PROCEED WITH CAUTION",color:COLORS.warn,bg:COLORS.warnDim,border:COLORS.warn,icon:"⚠",msg:"Multiple flags raised. Acceptable if filling a specific portfolio gap — monitor closely."};
    if(fails===1&&warns<=2)return{decision:"CONSIDER NEXT FUND",color:COLORS.warn,bg:COLORS.warnDim,border:COLORS.warn,icon:"⚠",msg:"One hard fail detected. Move to the next fund in your sorted list unless this fund has a uniquely compelling alpha source."};
    return{decision:"SKIP — REJECT",color:COLORS.danger,bg:COLORS.dangerDim,border:COLORS.danger,icon:"✗",msg:`${fails} hard fail(s) and ${warns} warning(s). This fund does not meet institutional quantitative standards.`};
  };

  const reset=()=>{setStepIndex(0);setCategory("");setInputs({});setResults({});setReturnInputs({r1:"",r3:"",r5:"",r10:""});setSearch("");setExpandedGroup(null);};
  const stepResultSummary=()=>["sharpe","fees","aum","rsq","macro","alpha","sd","beta"].filter(id=>results[id]).map(id=>({id,label:{sharpe:"Risk-Adj/Sharpe",fees:"Fees",aum:"Capacity/AUM",rsq:"Tracking/Active",macro:"Macro/Credit",alpha:"Alpha Verify",sd:"Volatility",beta:"Sensitivity"}[id],result:results[id]}));
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
            Institutional Portfolio Manager Framework
          </div>
          <h1 style={{fontFamily:"'DM Serif Display',serif",fontSize:"clamp(20px,5vw,32px)",fontWeight:400,margin:"0 0 8px",color:"#f1f5f9",lineHeight:1.2}}>
            Quantitative Fund Selection
          </h1>
          <p style={{color:COLORS.textMid,fontSize:13,fontFamily:"'DM Sans',sans-serif",margin:0}}>
            Strict institutional gates · Dynamic macro overlays · 54 Categories
          </p>
        </div>

        {stepIndex>0&&<ProgressBar current={stepIndex} total={steps.length}/>}

        {/* MAIN CARD */}
        <div style={{background:COLORS.card,border:`1px solid ${COLORS.cardBorder}`,borderRadius:16,padding:"24px 26px",marginBottom:14}}>

          {/* CATEGORY SELECT */}
          {currentStep.type==="category"&&(
            <div>
              <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:COLORS.accent,letterSpacing:"0.1em",marginBottom:6}}>STEP 1 OF {steps.length}</div>
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
                                  <div style={{fontSize:10,opacity:0.5,marginTop:2}}>Fee≤{c.fees}% · Alpha≥{c.alpha}</div>
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
                STEP {stepIndex+1} OF {steps.length} · <span style={{color:GROUP_COLORS[cat.group]||COLORS.accent}}>{cat.label}</span>
              </div>
              <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,fontWeight:400,margin:"0 0 4px",color:"#f1f5f9"}}>
                {typeof currentStep.title === 'function' ? currentStep.title(category) : currentStep.title}
              </h2>
              <p style={{color:COLORS.textMid,fontSize:13,fontFamily:"'DM Sans',sans-serif",margin:"0 0 16px"}}>
                {typeof currentStep.subtitle === 'function' ? currentStep.subtitle(category) : currentStep.subtitle}
              </p>
              <div style={{background:COLORS.accentDim,border:`1px solid ${COLORS.accentBorder}`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,fontFamily:"'DM Sans',sans-serif",color:COLORS.accent,lineHeight:1.5}}>
                <strong>📌 Institutional Overlay: </strong>
                {currentStep.id==="sharpe"&&`Min: ${cat.sharpeMin}. Evaluate Sortino rigorously for Hybrid funds.`}
                {currentStep.id==="fees"&&`Ceiling: ${cat.fees}%. ${cat.hint}`}
                {currentStep.id==="aum"&&cat.alphaNote}
                {currentStep.id==="rsq"&&`Target 70–${cat.rsq} for active. >95% is a closet indexer. Track Error <0.15% for passives.`}
                {currentStep.id==="macro"&&cat.hint}
                {currentStep.id==="alpha"&&cat.alphaNote}
                {currentStep.id==="sd"&&`Ceiling: ${cat.sd}% · Ensure risk aligns with mandate.`}
                {currentStep.id==="beta"&&`Target macro-range: ${cat.beta[0]}–${cat.beta[1]}`}
              </div>
              <label style={{display:"block",marginBottom:8,fontSize:13,color:COLORS.textMid,fontFamily:"'DM Sans',sans-serif"}}>
                {typeof currentStep.question === 'function' ? currentStep.question(category) : currentStep.question}
              </label>
              <input className="fi" type="number" step="0.01" 
                placeholder={typeof currentStep.placeholder === 'function' ? currentStep.placeholder(category) : currentStep.placeholder}
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
                STEP {stepIndex+1} OF {steps.length} · <span style={{color:GROUP_COLORS[cat?.group]||COLORS.accent}}>{cat?.label}</span>
              </div>
              <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,fontWeight:400,margin:"0 0 4px",color:"#f1f5f9"}}>Rolling Return Consistency</h2>
              <p style={{color:COLORS.textMid,fontSize:13,fontFamily:"'DM Sans',sans-serif",margin:"0 0 16px"}}>Evaluates non-linear equity compounding or fixed-income accrual stability.</p>
              <div style={{background:COLORS.accentDim,border:`1px solid ${COLORS.accentBorder}`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,fontFamily:"'DM Sans',sans-serif",color:COLORS.accent}}>
                <strong>Weighting Profile:</strong> 10Y = 40% · 5Y = 30% · 3Y = 20% · 1Y = 10%
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
                  <div style={{fontSize:10,fontFamily:"'DM Mono',monospace",color:COLORS.textDim,letterSpacing:"0.1em",marginBottom:10,textTransform:"uppercase"}}>Institutional Scorecard</div>
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
                          <span style={{fontSize:13,fontFamily:"'DM Sans',sans-serif",color:COLORS.textMid}}>Returns Profile</span>
                          <StatusBadge status={results.returns[0].status} label={results.returns[0].status==="pass"?"Verified":"Flags Raised"}/>
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
          Framework calibrated for Indian mutual funds · Institutional overlays active<br/>
          <span style={{color:"#ef444488"}}>For educational purposes only · Not SEBI-registered investment advice</span>
        </div>
      </div>
    </div>
  );
}

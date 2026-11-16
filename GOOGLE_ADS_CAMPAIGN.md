# Google Ads App Campaign — LoanPilot

Everything needed to create the install campaign in Google Ads, in the order the setup screens ask for it. All text is checked against Google's limits (headlines ≤ 30 characters, descriptions ≤ 90).

Goal: cheap installs in India from people who actually have a loan.

---

## 1. Who we are targeting

App campaigns don't let you pick audiences or keywords; Google finds users from the ad text, images and store listing. The ads below are written to attract this person:

| | |
|---|---|
| **Who** | Salaried adults in India, roughly 25–45, paying at least one home, car, personal or education loan |
| **Where** | Metros and tier-2 cities first (Bengaluru, Mumbai, Pune, Hyderabad, Delhi NCR, Chennai, Ahmedabad) |
| **Device** | Android phones |
| **Problem** | Doesn't know how much interest a part-payment saves, loses track of EMIs, is unsure what a rate change means for their EMI |
| **Trigger moments** | Bonus or salary hike (thinking about prepaying), RBI repo rate announcements, new loan taken |
| **What wins them** | A concrete number: "Prepay ₹1 lakh, save ₹2.88 lakh" |
| **Trust points** | Free, no sign-up, no bank linking, data stays on the phone, not a lender |

---

## 2. Campaign

| Field | Value |
|---|---|
| Objective | App promotion |
| Campaign subtype | App installs |
| Platform | Android |
| App | `com.loanpilot.app` (LoanPilot) |
| Campaign name | `LoanPilot – Installs – India` |
| Locations | India |
| Languages | English |
| Start / end | Today / no end date |
| Budget | ₹1,000 per day |
| Focus on | Install volume |
| Install tracking | Google Play |
| Target cost per install | ₹20 (starting point; adjust to real results after 1–2 weeks) |

---

## 3. Ad groups

### Ad group 1 — `Prepayment`

Headlines:
```
Prepay Smarter, Save Interest
See Interest Saved Instantly
Close Your Loan Years Sooner
Free Loan Prepayment Planner
Part-Payment Savings Checker
```

Descriptions:
```
Simulate a part-payment and see the interest you save and the months you cut.
Reduce EMI or reduce tenure? Compare both before you pay a rupee extra.
Plan your debt-free date for your home, car or personal loan.
Free app. No sign-up. Your loan data stays on your phone.
Not a lender: a planning tool to help you pay off your loans faster.
```

Images (`store-assets/google-ads/`): `prepay-1200x628.png`, `prepay-1200x1200.png`, `prepay-1200x1500.png`

### Ad group 2 — `EMI Calculator`

Headlines:
```
EMI Calculator & Loan Tracker
Free Home Loan EMI Calculator
Calculate Any EMI in Seconds
Home, Car & Personal Loan EMI
EMI, SIP, FD & GST Calculators
```

Descriptions:
```
Calculate EMI for home, car, personal and education loans with a full schedule.
See your monthly EMI, total interest and the full amortisation schedule.
SIP, FD, RD, GST, CAGR and more calculators in one free app.
Built for India: amounts in ₹ with lakh and crore formatting.
No sign-up needed. Calculators work offline. Free to use.
```

Images: `calculators-1200x628.png`, `calculators-1200x1200.png`, `calculators-1200x1500.png`

### Ad group 3 — `Loan Tracking`

Headlines:
```
Rate Changed? See New EMI
Track Every Loan & EMI
Never Miss an EMI Again
All Your Loans in One App
Know Your Debt-Free Date
```

Descriptions:
```
Repo rate changed? Update your rate and see your new EMI or tenure instantly.
Track balance, interest paid and EMIs left for every loan you have.
Get EMI due-date reminders on your phone so you never miss a payment.
Record payments and match your bank balance in seconds.
Free app. No sign-up. Your loan data stays on your phone.
```

Images: `track-1200x628.png`, `track-1200x1200.png`, `track-1200x1500.png`

### Videos

None yet; Google auto-generates simple videos from the images and store listing. Real 15–30 second screen recordings (portrait, landscape and square) usually lower the cost per install. Ideas:

1. **Prepayment:** "₹40 lakh home loan, ₹1 lakh prepayment" → interest saved and months cut appear.
2. **Rate change:** "Repo rate went up. What's your new EMI?" → add a rate revision, new EMI shown. Push this one around RBI rate announcements.
3. **Tracking:** all loans on one screen, record an EMI, debt-free date.

---

## 4. Ad wording rules (finance policy)

Finance ads get extra review, and in India Google may ask for financial services verification.

- Describe LoanPilot as a **calculator, tracker and planner**.
- Never write "get a loan", "instant approval", "low interest rates", "loan offer" or anything that suggests LoanPilot lends money. That gets ads rejected and contradicts the Play financial features declaration.
- Every image carries "Not a lender. Loan tracking & planning tool."

---

## 5. Conversion tracking

1. Firebase → Project settings → Integrations → **Google Ads → Link**.
2. Google Ads → Goals → Conversions: confirm **First open (Google Play)** exists; it is the install conversion.
3. Once they have data, import from Firebase:
   - `loan_created` — the user added a loan (an engaged user). Switch to optimising for it at ~30 per week.
   - `ad_impression` — ad revenue per user (arrives with the next app update). Enables target ROAS bidding.

---

## 6. Schedule

| When | Action |
|---|---|
| Days 1–10 | Don't change anything; the campaign is learning. |
| Weekly | Replace headlines, descriptions and images rated **"Low"** in each ad group's asset report. |
| After 2 weeks | Move budget to the ad group with the lowest cost per install. Lower the target cost per install 10–15% at a time. Check cost per install by state and lower bids in expensive states. |
| ~30 `loan_created` a week | Add a second campaign optimising for `loan_created`. |
| Scaling | Raise budget by at most 20% every 3–4 days. |

---

## 7. Weekly numbers to check

| Metric | Where | Healthy sign |
|---|---|---|
| Cost per install | Google Ads | Falling toward or below target |
| Store listing install rate | Play Console → Statistics | Rising after listing changes |
| Day-1 retention | Firebase / Play Console | ~20% or more; below that, installs are low quality |
| Cost per `loan_created` | Google Ads (after import) | The real cost of an engaged user |
| Ad revenue per user | Firebase `ad_impression` (next update) | Must exceed cost per install to be profitable |

Pause any ad group that is cheap but brings users who don't come back.

---

## 8. Store listing (affects every install's cost)

Apply in Play Console; the full text is in `PLAY_STORE_METADATA.md`.

- **Title:** `LoanPilot: EMI Loan Calculator`
- **Short description:** `EMI calculator & loan tracker. See how much prepaying saves you in interest.`
- **First screenshot:** `store-assets/screenshots/01-prepay-savings.png` ("Prepay ₹1 lakh, save ₹2.88 lakh")
- **Listing experiment:** test the short description above against `See how much interest a ₹1 lakh prepayment saves. EMI calculator & loan tracker.`

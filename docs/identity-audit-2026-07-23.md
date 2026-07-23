# WorldOS Identity corpus audit — 23 July 2026

Scope: all 59 stored signal rows. Verdicts assess the evidence actually available to the
scanner. The entire legacy corpus is quarantined because it mixed heuristic and AI rows,
counted duplicate signals as documents, and did not require retrieved source evidence.

| # | Entity | Article | Stored | Audit verdict | Reason |
|---:|---|---|---|---|---|
| 1 | Apple | World News in Brief: Ukraine, Sudan, DR Congo | CONTEXT | INVALID MATCH | No Apple relationship |
| 2 | United States | Thousands prevented from returning home to southern Lebanon | CONTEXT | INVALID MATCH | No US entity evidence |
| 3 | United Kingdom | Bluetongue: latest situation | CONTEXT | CONTEXT 0 | Routine situation update |
| 4 | United Kingdom | Generative AI in animals in science: response | CONTEXT | CONTEXT | Response notice; no identity passage |
| 5 | United Kingdom | Foreign Secretary remarks at ASEAN meeting | CONTEXT | UNASSESSED | Metadata announces remarks but does not contain them |
| 6 | United Kingdom | Kent waste operator loses permit | CONTEXT | CONTEXT | Enforcement event |
| 7 | United Kingdom | DfE Update 22 July 2026 | CONTEXT | CONTEXT | Administrative update |
| 8 | United Kingdom | How to submit applications and complaints | CONTEXT | CONTEXT | Procedure |
| 9 | United Kingdom | Chief Inspector retires after 51 years | CONTEXT | CONTEXT | Personnel story |
| 10 | United Kingdom | Lynne Ford retires after 34 years | CONTEXT | CONTEXT | Personnel story |
| 11 | United Kingdom | Machinery of Government changes | CONTEXT | CONTEXT | Structural event |
| 12 | United Kingdom | Power of Youth Charter | CONTEXT | HOW | Program participation |
| 13 | United Kingdom | Chancellor speech to Treasury staff | CONTEXT | UNASSESSED | Speech body absent |
| 14 | United Kingdom | Supporting African critical-minerals governance | CONTEXT | HOW | Policy action |
| 15 | United Kingdom | Funding for maternity services | CONTEXT | HOW | Investment |
| 16 | United Kingdom | Government Chemist Conference | CONTEXT | CONTEXT | Conference notice |
| 17 | United Kingdom | River restoration in Shipley | CONTEXT | HOW | Project execution |
| 18 | United Kingdom | PM call with Prime Minister Carney | CONTEXT | CONTEXT | Diplomatic event |
| 19 | United Kingdom | PM call with Prime Minister Meloni | CONTEXT | CONTEXT | Diplomatic event |
| 20 | United Kingdom | Ministerial appointments | CONTEXT | CONTEXT | Personnel announcement |
| 21 | United Kingdom | Growth in every postcode | CONTEXT | HOW | Policy promise, not institutional identity |
| 22 | United Kingdom | Business-rates cuts | CONTEXT | HOW | Policy execution |
| 23 | United States | Measuring balance-of-payments deficits | CONTEXT | CONTEXT | Analytical article |
| 24 | United States | Birthday of Saint Frances Xavier Cabrini | CONTEXT | CONTEXT | Commemoration |
| 25 | United States | Campaign against radical-left terrorism | CONTEXT | HOW | Enforcement strategy |
| 26 | United States | Foreign election interference evidence | CONTEXT | CONTEXT | Political claim/event |
| 27 | United States | Declassification on election interference | CONTEXT | CONTEXT | Disclosure event |
| 28 | United States | Made in America Week | CONTEXT | POTENTIAL WHAT | Full page contains explicit national-identity language |
| 29 | United States | Captive Nations Week | CONTEXT | POTENTIAL WHAT | Full page explicitly states beliefs, role, and preservation |
| 30 | United States | Nomination sent to Senate | CONTEXT | CONTEXT | Personnel action |
| 31 | United States | Securing defense supply chains | CONTEXT | WHAT + HOW | Full page defines military identity then sets policy |
| 32 | United States | Defense supply-chains fact sheet | CONTEXT | HOW | Policy execution |
| 33 | United States | Adjusting aluminum imports | CONTEXT | HOW | Trade instrument |
| 34 | United States | Aluminum-import fact sheet | CONTEXT | HOW | Trade policy |
| 35 | United States | Additional tariffs on Canada | CONTEXT | HOW | Trade policy |
| 36 | United States | Duties concerning Canadian dairy | CONTEXT | HOW | Trade policy |
| 37 | United States | Duties concerning alcoholic beverages | CONTEXT | HOW | Trade policy |
| 38 | United States | Duties concerning motor vehicles | CONTEXT | HOW | Trade policy |
| 39 | United States | Space Exploration Day | CONTEXT | POTENTIAL WHAT | Full page states desired national role and future |
| 40 | United States | Reciprocal-trade agreement with Jordan | CONTEXT | CONTEXT | Agreement; shared values are relational context |
| 41 | United States | Trade deal with Jordan | CONTEXT | HOW | Commercial policy |
| 42 | United States | Tax cuts and manufacturing | CONTEXT | HOW | Claimed policy outcome |
| 43 | United States | Voter-registration glitch | CONTEXT | CONTEXT | Political event/advocacy |
| 44 | United States | Nominations sent to Senate | CONTEXT | CONTEXT | Personnel action |
| 45 | United States | Liberation of Guam anniversary | CONTEXT | POTENTIAL WHAT | Full page claims enduring national role as defender of freedom |
| 46 | United States | Renewing American scientific discovery | CONTEXT | HOW | R&D strategy; identity requires a direct passage |
| 47 | United States | $5B for Genesis Mission | WHAT | HOW | Investment and program execution |
| 48 | Alphabet | Screwfix partnership | CONTEXT | HOW | Partnership and capability adoption |
| 49 | Alphabet | DMA security and privacy | CONTEXT | POTENTIAL WHAT | Explicit value/position may qualify after exact evidence retrieval |
| 50 | Alphabet | Georgia library training partnership | CONTEXT | HOW | Partnership/program |
| 51 | Alphabet | Skilled Trades Alliance | CONTEXT | HOW | Alliance launch |
| 52 | Alphabet | Q2 earnings-call remarks | CONTEXT | UNASSESSED | Metadata only |
| 53 | Apple | Major League Soccer returns to Apple TV | CONTEXT | CONTEXT | Programming announcement |
| 54 | Alphabet | Q2 earnings-call remarks | WHAT | INVALID WHAT | “Read an edited transcript” is not identity evidence |
| 55 | Alphabet | Screwfix partnership | WHAT | HOW | Beneficial partnership was mistaken for purpose |
| 56 | Alphabet | Georgia library partnership | WHAT | HOW | Training activity was mistaken for purpose |
| 57 | Alphabet | Skilled Trades Alliance | WHAT | HOW | Alliance membership was mistaken for purpose |
| 58 | Amazon | Leo targets India expansion | WHAT | HOW | Market expansion is operating strategy |
| 59 | Amazon | Leo eyes India expansion | HOW | HOW | Correct class, but title-only evidence is insufficient |

## Audit conclusion

- Valid stored WHAT rows: **0**. Some source documents contain potential identity passages,
  but the stored signal rows did not extract and ground those passages correctly.
- Correctly useful stored HOW rows: **1**, but it lacked retrieved evidence.
- Obvious invalid entity matches: **2**.
- Heuristic rows: **53**; these were transport candidates, not defensible classifications.
- AI rows: **6**; five were misclassified or unsupported and one was directionally HOW but
  unsupported by retrieved text.
- The displayed 25% was invalid because five WHAT signal rows (including duplicates) were
  divided by twenty documents.

The defensible baseline after audit is therefore **no publishable identity yield yet**.

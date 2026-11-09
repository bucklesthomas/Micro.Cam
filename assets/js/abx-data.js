---
layout: null
---
/* Antibiotic reference data: UK-AWaRe 2024 categories (UKHSA, 2025); usual adult BNF doses; PK/PD from product information and standard references; spectrum codes 2 = usually active, 1 = variable, 0 = not active. Source file: _data/antibiotics.json */
window.ABX_DATA = {{ site.data.antibiotics | jsonify }};

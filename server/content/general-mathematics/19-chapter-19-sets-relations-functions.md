# Chapter 19 — Sets, Relations and Functions / অধ্যায় ১৯ — সংহতি, সম্বন্ধ আৰু ফলন

*Level: Class VIII to Graduate · Every answer computed and checked by script · Solutions in English and Assamese*\
*স্তৰ: অষ্টম শ্ৰেণীৰ পৰা স্নাতক · প্ৰতিটো উত্তৰ গণনা কৰি পৰীক্ষা কৰা হৈছে*

## 19.1 Concepts and formulas / ধাৰণা আৰু সূত্ৰ

| Item / বিষয় | Rule / নিয়ম |
| --- | --- |
| Subsets of an n-element set / উপসংহতি | 2ⁿ (proper subsets 2ⁿ − 1) |
| Union / সংযোগ | n(A ∪ B) = n(A) + n(B) − n(A ∩ B) |
| Three sets / তিনিটা সংহতি | n(A ∪ B ∪ C) = ΣA − Σ(pairs) + n(A ∩ B ∩ C) |
| Cartesian product / কাৰ্টেজীয় গুণফল | n(A × B) = n(A) × n(B) |
| Relations from A to B / সম্বন্ধ | 2^(n(A) × n(B)) |
| De Morgan / ডি মৰ্গান | (A ∪ B)′ = A′ ∩ B′; (A ∩ B)′ = A′ ∪ B′ |

- A **function** assigns exactly one output to each input. The **domain** is the set of allowed inputs; **f⁻¹** undoes f.\
**ফলন**ে প্ৰতিটো ইনপুটক ঠিক এটা আউটপুট দিয়ে। **আদিক্ষেত্ৰ** হৈছে অনুমোদিত ইনপুটৰ সংহতি; **f⁻¹**ে fৰ কাম উলটায়।

## 19.2 Question bank / প্ৰশ্নৰ ভঁৰাল

**Instructions:** Each question has four options; choose the one correct answer. The answer and a worked solution follow each question. All 17 questions are **\[Practice\]** questions.\
**নিৰ্দেশনা:** প্ৰতিটো প্ৰশ্নৰ চাৰিটা বিকল্প আছে; শুদ্ধ উত্তৰটো বাছি উলিওৱা। প্ৰতিটো প্ৰশ্নৰ পিছত উত্তৰ আৰু সমাধান দিয়া হৈছে। আটাইকেইটা (১৭টা) প্ৰশ্ন **\[অনুশীলনী\]** প্ৰশ্ন।

**1.** In a group, 40 people like tea, 35 like coffee and 15 like both. Everyone likes at least one. How many people are in the group?\
এটা গোটত ৪০ জনে চাহ, ৩৫ জনে কফি আৰু ১৫ জনে দুয়োটা ভাল পায়। প্ৰত্যেকে অন্ততঃ এটা ভাল পায়। গোটটোত কিমান জন আছে?\
(A) 60 / ৬০\
(B) 90 / ৯০\
(C) 50 / ৫০\
(D) 75 / ৭৫\
**Answer / উত্তৰ: (A) 60 / ৬০**\
Solution: n(A ∪ B) = n(A) + n(B) − n(A ∩ B) = 40 + 35 − 15 = 60.\
সমাধান: n(A ∪ B) = n(A) + n(B) − n(A ∩ B) = ৪০ + ৩৫ − ১৫ = ৬০।\
*B12-C19-0001 · Union of sets · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P3, ADRE-III-P5, APC, SSC*

**2.** Of 100 students, 60 study Assamese, 50 study English and 20 study neither. How many study both?\
১০০ জন ছাত্ৰৰ ৬০ জনে অসমীয়া, ৫০ জনে ইংৰাজী পঢ়ে আৰু ২০ জনে কোনোটোৱেই নপঢ়ে। কিমান জনে দুয়োটা পঢ়ে?\
(A) 10 / ১০\
(B) 30 / ৩০\
(C) 20 / ২০\
(D) 40 / ৪০\
**Answer / উত্তৰ: (B) 30 / ৩০**\
Solution: Students taking at least one = 100 − 20 = 80. Both = 60 + 50 − 80 = 30.\
সমাধান: অন্ততঃ এটা পঢ়া ছাত্ৰ = ১০০ − ২০ = ৮০। দুয়োটা = ৬০ + ৫০ − ৮০ = ৩০।\
*B12-C19-0002 · Venn diagrams · Moderate · ADRE-IV-P2, ADRE-III-P3, ADRE-III-P4, ADRE-III-P5, APC, APSI, SSC*

**3.** How many subsets does a set with 4 elements have?\
৪টা উপাদান থকা এটা সংহতিৰ কেইটা উপসংহতি আছে?\
(A) 8 / ৮\
(B) 15 / ১৫\
(C) 16 / ১৬\
(D) 4 / ৪\
**Answer / উত্তৰ: (C) 16 / ১৬**\
Solution: A set with n elements has 2ⁿ subsets: 2⁴ = 16 (including ∅ and the set itself).\
সমাধান: nটা উপাদান থকা সংহতিৰ 2ⁿটা উপসংহতি: ২⁴ = ১৬ (∅ আৰু সংহতিটোসহ)।\
*B12-C19-0003 · Subsets · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P3, ADRE-III-P5, APC, SSC*

**4.** How many proper subsets does a set with 5 elements have?\
৫টা উপাদান থকা সংহতিৰ কেইটা প্ৰকৃত উপসংহতি আছে?\
(A) 32 / ৩২\
(B) 10 / ১০\
(C) 25 / ২৫\
(D) 31 / ৩১\
**Answer / উত্তৰ: (D) 31 / ৩১**\
Solution: Proper subsets = 2ⁿ − 1 = 32 − 1 = 31 (all subsets except the set itself).\
সমাধান: প্ৰকৃত উপসংহতি = 2ⁿ − ১ = ৩২ − ১ = ৩১ (সংহতিটোৰ বাহিৰে সকলো)।\
*B12-C19-0004 · Subsets · Moderate · ADRE-IV-P2, ADRE-III-P3, ADRE-III-P4, ADRE-III-P5, APC, APSI, SSC*

**5.** If A = {1, 2, 3, 4} and B = {3, 4, 5, 6}, what is A ∩ B?\
যদি A = {১, ২, ৩, ৪} আৰু B = {৩, ৪, ৫, ৬}, তেন্তে A ∩ B কি?\
(A) {3, 4} / {৩, ৪}\
(B) {1, 2} / {১, ২}\
(C) {1, 2, 3, 4, 5, 6} / {১, ২, ৩, ৪, ৫, ৬}\
(D) {5, 6} / {৫, ৬}\
**Answer / উত্তৰ: (A) {3, 4} / {৩, ৪}**\
Solution: A ∩ B contains the elements common to both: {3, 4}.\
সমাধান: A ∩ Bত দুয়োটাতে থকা উপাদান থাকে: {৩, ৪}।\
*B12-C19-0005 · Intersection · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P3, ADRE-III-P5, APC, SSC*

**6.** For the same sets A = {1, 2, 3, 4} and B = {3, 4, 5, 6}, what is A − B?\
একে সংহতি A = {১, ২, ৩, ৪} আৰু B = {৩, ৪, ৫, ৬}ৰ বাবে A − B কি?\
(A) {5, 6} / {৫, ৬}\
(B) {1, 2} / {১, ২}\
(C) {3, 4} / {৩, ৪}\
(D) {1, 2, 5, 6} / {১, ২, ৫, ৬}\
**Answer / উত্তৰ: (B) {1, 2} / {১, ২}**\
Solution: A − B contains the elements of A that are not in B: {1, 2}.\
সমাধান: A − Bত Aত থকা কিন্তু Bত নথকা উপাদান থাকে: {১, ২}।\
*B12-C19-0006 · Difference of sets · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P3, ADRE-III-P5, APC, SSC*

**7.** If n(A) = 2 and n(B) = 3, how many relations are there from A to B?\
যদি n(A) = ২ আৰু n(B) = ৩, তেন্তে Aৰ পৰা Bলৈ কেইটা সম্বন্ধ আছে?\
(A) 8 / ৮\
(B) 6 / ৬\
(C) 64 / ৬৪\
(D) 32 / ৩২\
**Answer / উত্তৰ: (C) 64 / ৬৪**\
Solution: n(A × B) = 6, and every subset of A × B is a relation: 2⁶ = 64.\
সমাধান: n(A × B) = ৬, আৰু A × Bৰ প্ৰতিটো উপসংহতি এটা সম্বন্ধ: ২⁶ = ৬৪।\
*B12-C19-0007 · Relations · Moderate · ADRE-IV-P2, ADRE-III-P3, ADRE-III-P4, ADRE-III-P5, APC, APSI, SSC*

**8.** If f(x) = 2x + 3, find f(f(1)).\
যদি f(x) = ২x + ৩, তেন্তে f(f(১)) নিৰ্ণয় কৰা।\
(A) 8 / ৮\
(B) 5 / ৫\
(C) 10 / ১০\
(D) 13 / ১৩\
**Answer / উত্তৰ: (D) 13 / ১৩**\
Solution: f(1) = 5, then f(5) = 13.\
সমাধান: f(১) = ৫, তাৰ পিছত f(৫) = ১৩।\
*B12-C19-0008 · Functions · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P3, ADRE-III-P5, APC, SSC*

**9.** What is the inverse of f(x) = 3x − 2?\
f(x) = ৩x − ২ৰ বিপৰীত ফলন কি?\
(A) (x + 2)/3 / (x + ২)/৩\
(B) (x − 2)/3 / (x − ২)/৩\
(C) 3x + 2 / ৩x + ২\
(D) 1/(3x − 2) / ১/(৩x − ২)\
**Answer / উত্তৰ: (A) (x + 2)/3 / (x + ২)/৩**\
Solution: Let y = 3x − 2; then x = (y + 2)/3. So f⁻¹(x) = (x + 2)/3.\
সমাধান: y = ৩x − ২ ধৰা হওক; তেন্তে x = (y + ২)/৩। সেয়ে f⁻¹(x) = (x + ২)/৩।\
*B12-C19-0009 · Inverse functions · Moderate · ADRE-IV-P2, ADRE-III-P3, ADRE-III-P4, ADRE-III-P5, APC, APSI, SSC*

**10.** What is the domain of f(x) = 1/(x − 2)?\
f(x) = ১/(x − ২)ৰ আদিক্ষেত্ৰ (domain) কি?\
(A) All real numbers / সকলো বাস্তৱ সংখ্যা\
(B) All real numbers except 2 / ২ৰ বাহিৰে সকলো বাস্তৱ সংখ্যা\
(C) Only positive numbers / কেৱল ধনাত্মক সংখ্যা\
(D) All real numbers except 0 / ০ৰ বাহিৰে সকলো বাস্তৱ সংখ্যা\
**Answer / উত্তৰ: (B) All real numbers except 2 / ২ৰ বাহিৰে সকলো বাস্তৱ সংখ্যা**\
Solution: The function is undefined only when the denominator is 0, i.e. at x = 2.\
সমাধান: হৰ ০ হ'লে, অৰ্থাৎ x = ২ত, ফলনটো অসংজ্ঞাত।\
*B12-C19-0010 · Domain · Moderate · ADRE-IV-P2, ADRE-III-P3, ADRE-III-P4, ADRE-III-P5, APC, APSI, SSC*

**11.** By De Morgan's law, (A ∪ B)′ equals:\
ডি মৰ্গানৰ সূত্ৰ অনুসৰি (A ∪ B)′ৰ সমান:\
(A) A′ ∪ B′\
(B) A ∩ B\
(C) A′ ∩ B′\
(D) A′ ∪ B\
**Answer / উত্তৰ: (C) A′ ∩ B′**\
Solution: The complement of a union is the intersection of the complements: (A ∪ B)′ = A′ ∩ B′.\
সমাধান: সংযোগৰ পূৰক হৈছে পূৰকবোৰৰ ছেদ: (A ∪ B)′ = A′ ∩ B′।\
*B12-C19-0011 · De Morgan's laws · Moderate · ADRE-IV-P2, ADRE-III-P3, ADRE-III-P4, ADRE-III-P5, APC, APSI, SSC*

**12.** If n(A) = 3 and n(B) = 4, what is n(A × B)?\
যদি n(A) = ৩ আৰু n(B) = ৪, তেন্তে n(A × B) কিমান?\
(A) 7 / ৭\
(B) 81 / ৮১\
(C) 64 / ৬৪\
(D) 12 / ১২\
**Answer / উত্তৰ: (D) 12 / ১২**\
Solution: n(A × B) = n(A) × n(B) = 3 × 4 = 12.\
সমাধান: n(A × B) = n(A) × n(B) = ৩ × ৪ = ১২।\
*B12-C19-0012 · Cartesian product · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P3, ADRE-III-P5, APC, SSC*

**13.** In a club, 25 members play football, 18 play cricket and 7 play both. If every member plays at least one game, how many members are there?\
এটা ক্লাবত ২৫ জনে ফুটবল, ১৮ জনে ক্ৰিকেট আৰু ৭ জনে দুয়োটা খেলে। প্ৰত্যেকে অন্ততঃ এটা খেল খেলিলে সদস্য কিমান?\
(A) 36 / ৩৬\
(B) 43 / ৪৩\
(C) 29 / ২৯\
(D) 50 / ৫০\
**Answer / উত্তৰ: (A) 36 / ৩৬**\
Solution: n(A ∪ B) = 25 + 18 − 7 = 36.\
সমাধান: n(A ∪ B) = ২৫ + ১৮ − ৭ = ৩৬।\
*B12-C19-0013 · Union of sets · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P3, ADRE-III-P5, APC, SSC*

**14.** In a club, 50 members play football, 40 play cricket and 20 play both. If every member plays at least one game, how many members are there?\
এটা ক্লাবত ৫০ জনে ফুটবল, ৪০ জনে ক্ৰিকেট আৰু ২০ জনে দুয়োটা খেলে। প্ৰত্যেকে অন্ততঃ এটা খেল খেলিলে সদস্য কিমান?\
(A) 90 / ৯০\
(B) 70 / ৭০\
(C) 110 / ১১০\
(D) 50 / ৫০\
**Answer / উত্তৰ: (B) 70 / ৭০**\
Solution: n(A ∪ B) = 50 + 40 − 20 = 70.\
সমাধান: n(A ∪ B) = ৫০ + ৪০ − ২০ = ৭০।\
*B12-C19-0014 · Union of sets · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P3, ADRE-III-P5, APC, SSC*

**15.** In a club, 32 members play football, 28 play cricket and 12 play both. If every member plays at least one game, how many members are there?\
এটা ক্লাবত ৩২ জনে ফুটবল, ২৮ জনে ক্ৰিকেট আৰু ১২ জনে দুয়োটা খেলে। প্ৰত্যেকে অন্ততঃ এটা খেল খেলিলে সদস্য কিমান?\
(A) 60 / ৬০\
(B) 36 / ৩৬\
(C) 48 / ৪৮\
(D) 72 / ৭২\
**Answer / উত্তৰ: (C) 48 / ৪৮**\
Solution: n(A ∪ B) = 32 + 28 − 12 = 48.\
সমাধান: n(A ∪ B) = ৩২ + ২৮ − ১২ = ৪৮।\
*B12-C19-0015 · Union of sets · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P3, ADRE-III-P5, APC, SSC*

**16.** How many subsets does a set with 3 elements have?\
৩টা উপাদান থকা সংহতিৰ কেইটা উপসংহতি আছে?\
(A) 7 / ৭\
(B) 9 / ৯\
(C) 6 / ৬\
(D) 8 / ৮\
**Answer / উত্তৰ: (D) 8 / ৮**\
Solution: 2ⁿ = 2^3 = 8.\
সমাধান: 2ⁿ = ২^৩ = ৮।\
*B12-C19-0016 · Subsets · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P3, ADRE-III-P5, APC, SSC*

**17.** How many subsets does a set with 6 elements have?\
৬টা উপাদান থকা সংহতিৰ কেইটা উপসংহতি আছে?\
(A) 64 / ৬৪\
(B) 36 / ৩৬\
(C) 12 / ১২\
(D) 63 / ৬৩\
**Answer / উত্তৰ: (A) 64 / ৬৪**\
Solution: 2ⁿ = 2^6 = 64.\
সমাধান: 2ⁿ = ২^৬ = ৬৪।\
*B12-C19-0017 · Subsets · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P3, ADRE-III-P5, APC, SSC*

## 19.3 References and verification status / উৎস আৰু সত্যাপন

| Item | Status |
| --- | --- |
| Concepts and formulas | NCERT Mathematics Classes VI–X; SEBA General Mathematics — standard results |
| Answers | Every answer computed in code (Python `fractions`) and checked against the options before publishing |
| Question origin | All newly written **\[Practice\]** questions modelled on ADRE and SSC arithmetic |

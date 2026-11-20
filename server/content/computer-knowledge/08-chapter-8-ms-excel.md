# Chapter 8 — MS Excel (Spreadsheets) / অধ্যায় ৮ — এমএছ এক্সেল (স্প্ৰেডশ্বীট)

*Facts checked: 19 November 2026 · Level: Moderate (ADRE Grade III graduate, computer skill test, SSC) · Sources in 8.3*\
*তথ্য পৰীক্ষা: ১৯ নৱেম্বৰ ২০২৬*

## 8.1 Revision notes / পুনৰালোচনাৰ টোকা

- A **workbook** (.xlsx) contains **worksheets**; a sheet has **rows** (numbered 1, 2, 3…) and **columns** (lettered A, B, C…). Their meeting point is a **cell**, named like **B3**.\
ৰ'(শাৰী) আৰু কলম (স্তম্ভ)ৰ মিলন বিন্দু **cell**।
- Since Excel 2007 a sheet has **1,048,576 rows** and **16,384 columns** (last column **XFD**).
- A **formula** always starts with **=**: `=A1+B1`, `=SUM(A1:A10)`.
- **Cell references:** relative (A1), absolute (\$A\$1), mixed (\$A1 or A\$1). Press **F4** to cycle through them.
- **Functions:** SUM, AVERAGE, COUNT (numbers), COUNTA (non-empty cells), MAX, MIN, IF, VLOOKUP, CONCAT.
- **Errors:** `#DIV/0!` (divide by zero), `#NAME?` (wrong function name), `#VALUE!` (wrong type), `#REF!` (invalid reference), `####` (column too narrow).
- **F2** edits the active cell; **Ctrl + ;** enters today's date; **Alt + =** inserts AutoSum.

## 8.2 Question bank / প্ৰশ্নৰ ভঁৰাল

**Instructions:** Each question has four options; choose the one correct answer. The answer and a short explanation follow each question. All 15 questions are **\[Practice\]** questions.\
**নিৰ্দেশনা:** প্ৰতিটো প্ৰশ্নৰ চাৰিটা বিকল্প আছে; শুদ্ধ উত্তৰটো বাছি উলিওৱা। প্ৰতিটো প্ৰশ্নৰ পিছত উত্তৰ আৰু চমু ব্যাখ্যা দিয়া হৈছে। আটাইকেইটা (১৫টা) প্ৰশ্ন **\[অনুশীলনী\]** প্ৰশ্ন।

**1.** The meeting point of a row and a column in Excel is called a:\
এক্সেলত ৰ' আৰু কলমৰ মিলন বিন্দুক কি বোলে?\
(A) Cell / চেল\
(B) Box / বাকচ\
(C) Grid / গ্ৰিড\
(D) Range / ৰেঞ্জ\
**Answer / উত্তৰ: (A) Cell / চেল**\
Explanation: Each cell has an address such as C5. [C2]\
ব্যাখ্যা: প্ৰতিটো চেলৰ C5-ৰ দৰে ঠিকনা থাকে।\
*B7-C08-0001 · Basics · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**2.** An Excel file is called a:\
এক্সেলৰ ফাইলক কি বোলে?\
(A) Document / ডকুমেণ্ট\
(B) Presentation / প্ৰেজেণ্টেচন\
(C) Workbook / ৱৰ্কবুক\
(D) Database / ডাটাবেছ\
**Answer / উত্তৰ: (C) Workbook / ৱৰ্কবুক**\
Explanation: A workbook contains one or more worksheets. [C2]\
ব্যাখ্যা: ৱৰ্কবুকত এখন বা ততোধিক ৱৰ্কশ্বীট থাকে।\
*B7-C08-0002 · Basics · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**3.** Every formula in Excel begins with:\
এক্সেলৰ প্ৰতিটো ফৰ্মুলা কিহেৰে আৰম্ভ হয়?\
(A) +\
(B) #\
(C) =\
(D) @\
**Answer / উত্তৰ: (C) =**\
Explanation: Without "=" Excel treats the entry as text or a number. [C2]\
ব্যাখ্যা: "=" নহ'লে এক্সেলে ইয়াক লিখনি বা সংখ্যা বুলি ধৰে।\
*B7-C08-0003 · Formulas · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**4.** Columns in an Excel worksheet are labelled with:\
এক্সেল ৱৰ্কশ্বীটৰ কলমবোৰ কিহেৰে চিহ্নিত?\
(A) Letters (A, B, C…) / আখৰ (A, B, C…)\
(B) Numbers (1, 2, 3…) / সংখ্যা (১, ২, ৩…)\
(C) Roman numerals / ৰোমান সংখ্যা\
(D) Symbols / চিহ্ন\
**Answer / উত্তৰ: (A) Letters (A, B, C…) / আখৰ (A, B, C…)**\
Explanation: Rows are numbered; columns are lettered. [C2]\
ব্যাখ্যা: ৰ' সংখ্যাৰে, কলম আখৰেৰে চিহ্নিত।\
*B7-C08-0004 · Basics · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**5.** Which function adds the numbers in cells A1 to A10?\
A1 ৰ পৰা A10 লৈ চেলৰ সংখ্যা কোন ফাংচনে যোগ কৰে?\
(A) =ADD(A1:A10)\
(B) =SUM(A1:A10)\
(C) =TOTAL(A1:A10)\
(D) =COUNT(A1:A10)\
**Answer / উত্তৰ: (B) =SUM(A1:A10)**\
Explanation: COUNT counts how many cells have numbers; it does not add them. [C2]\
ব্যাখ্যা: COUNT-এ সংখ্যা থকা চেল গণে, যোগ নকৰে।\
*B7-C08-0005 · Functions · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**6.** The absolute reference to cell A1 is written as:\
A1 চেলৰ absolute reference কেনেকৈ লিখা হয়?\
(A) A1\
(B) \$A1\
(C) A\$1\
(D) \$A\$1\
**Answer / উত্তৰ: (D) \$A\$1**\
Explanation: \$A\$1 does not change when the formula is copied. \$A1 and A\$1 are mixed references. [C2]\
ব্যাখ্যা: ফৰ্মুলা কপি কৰিলেও \$A\$1 সলনি নহয়; \$A1 আৰু A\$1 mixed reference।\
*B7-C08-0006 · Cell references · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**7.** Which key lets you edit the active cell?\
সক্ৰিয় চেলটো সম্পাদনা কৰিবলৈ কোন কী টিপিব?\
(A) F2\
(B) F4\
(C) F7\
(D) F11\
**Answer / উত্তৰ: (A) F2**\
Explanation: F4 cycles through reference types; F11 creates a chart sheet. [C2]\
ব্যাখ্যা: F4-এ reference সলায়; F11-এ চাৰ্ট শ্বীট বনায়।\
*B7-C08-0007 · Shortcuts · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**8.** The error #DIV/0! appears when a formula:\
কোনো ফৰ্মুলাত #DIV/0! ভুল কেতিয়া দেখা যায়?\
(A) Has a misspelt function name / ফাংচনৰ নামৰ বানান ভুল হ'লে\
(B) Divides by zero or an empty cell / শূন্য বা খালী চেলেৰে হৰণ কৰিলে\
(C) Refers to a deleted cell / মচি পেলোৱা চেল উল্লেখ কৰিলে\
(D) Is too long / ফৰ্মুলা বহু দীঘল হ'লে\
**Answer / উত্তৰ: (B) Divides by zero or an empty cell / শূন্য বা খালী চেলেৰে হৰণ কৰিলে**\
Explanation: A misspelt function gives #NAME?; a deleted reference gives #REF!. [C2]\
ব্যাখ্যা: বানান ভুলত #NAME?, মচা চেলত #REF!।\
*B7-C08-0008 · Errors · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**9.** The result of =MAX(4, 9, 2, 7) is:\
=MAX(4, 9, 2, 7)-ৰ ফলাফল কিমান?\
(A) 2 / ২\
(B) 9 / ৯\
(C) 22 / ২২\
(D) 4 / ৪\
**Answer / উত্তৰ: (B) 9 / ৯**\
Explanation: MAX returns the largest value; MIN would return 2. [C2]\
ব্যাখ্যা: MAX-এ আটাইতকৈ ডাঙৰ মান দিয়ে; MIN-এ ২ দিলেহেঁতেন।\
*B7-C08-0009 · Functions · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**10.** The result of =AVERAGE(10, 20, 30) is:\
=AVERAGE(10, 20, 30)-ৰ ফলাফল কিমান?\
(A) 60 / ৬০\
(B) 30 / ৩০\
(C) 20 / ২০\
(D) 3 / ৩\
**Answer / উত্তৰ: (C) 20 / ২০**\
Explanation: (10 + 20 + 30) ÷ 3 = 20. [C2]\
ব্যাখ্যা: (১০ + ২০ + ৩০) ÷ ৩ = ২০।\
*B7-C08-0010 · Functions · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**11.** Which function counts the cells that are not empty?\
কোন ফাংচনে খালী নহয় এনে চেল গণে?\
(A) COUNT\
(B) SUM\
(C) COUNTBLANK\
(D) COUNTA\
**Answer / উত্তৰ: (D) COUNTA**\
Explanation: COUNT counts only numbers; COUNTA counts any non-empty cell; COUNTBLANK counts empty ones. [C2]\
ব্যাখ্যা: COUNT কেৱল সংখ্যা গণে; COUNTA যিকোনো খালী নোহোৱা চেল; COUNTBLANK খালী চেল।\
*B7-C08-0011 · Functions · Hard · ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**12.** The last column in Excel 2007 and later versions is:\
এক্সেল ২০০৭ আৰু পৰৱৰ্তী সংস্কৰণৰ শেষৰ কলম কোনটো?\
(A) IV\
(B) ZZZ\
(C) XFZ\
(D) XFD\
**Answer / উত্তৰ: (D) XFD**\
Explanation: There are 16,384 columns (A to XFD); IV was the last column in Excel 2003. [C2]\
ব্যাখ্যা: ১৬,৩৮৪টা কলম (A ৰ পৰা XFD); এক্সেল ২০০৩ত শেষ কলম IV আছিল।\
*B7-C08-0012 · Basics · Hard · ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**13.** Which shortcut enters today's date in a cell?\
কোন শ্বৰ্টকাটে চেলত আজিৰ তাৰিখ সুমুৱায়?\
(A) Ctrl + D\
(B) Ctrl + ;\
(C) Ctrl + T\
(D) Shift + D\
**Answer / উত্তৰ: (B) Ctrl + ;**\
Explanation: Ctrl + Shift + ; enters the current time. [C2]\
ব্যাখ্যা: Ctrl + Shift + ;-এ বৰ্তমান সময় দিয়ে।\
*B7-C08-0013 · Shortcuts · Hard · ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**14.** "####" in a cell usually means:\
চেলত "####" দেখা গ'লে সাধাৰণতে কি বুজায়?\
(A) The formula is wrong / ফৰ্মুলা ভুল\
(B) The file is damaged / ফাইল নষ্ট হৈছে\
(C) The cell is locked / চেল লক কৰা আছে\
(D) The column is too narrow to show the number / সংখ্যাটো দেখুৱাবলৈ কলম বহু ঠেক\
**Answer / উত্তৰ: (D) The column is too narrow to show the number / সংখ্যাটো দেখুৱাবলৈ কলম বহু ঠেক**\
Explanation: Widen the column to see the value. [C2]\
ব্যাখ্যা: মানটো চাবলৈ কলম বহল কৰক।\
*B7-C08-0014 · Errors · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**15.** =IF(A1>=40, "Pass", "Fail") shows what when A1 is 35?\
A1-ত ৩৫ থাকিলে =IF(A1>=40, "Pass", "Fail")-এ কি দেখুৱাব?\
(A) Pass\
(B) Fail\
(C) 35\
(D) FALSE\
**Answer / উত্তৰ: (B) Fail**\
Explanation: 35 is not ≥ 40, so the second value, "Fail", is shown. [C2]\
ব্যাখ্যা: ৩৫, ৪০তকৈ সৰু; সেয়ে দ্বিতীয় মান "Fail" দেখুৱাব।\
*B7-C08-0015 · Functions · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

## 8.3 References and verification status / উৎস আৰু সত্যাপন

| Code | Source | Status |
| --- | --- | --- |
| C1 | NCERT / NIOS computer science and IT textbooks; SEBA Computer Science (Class IX–X) | **Book check pending** |
| C2 | Vendor documentation (Microsoft Support for Office and Windows) and standards bodies (IETF, W3C) | **Page check pending** |
| C3 | Government sources: MeitY, CERT-In, NPCI, UIDAI, Digital India and Sewa Setu portals | Checked online 19 November 2026 where marked |

All 15 questions are **\[Practice\]**. Questions whose source is marked *check pending* stay at status Fact-checked (not Verified) until that check is done.\
আটাইকেইটা প্ৰশ্ন **\[অনুশীলনী\]**। উৎস *পৰীক্ষা বাকী* বুলি চিহ্নিত প্ৰশ্নবোৰ সেই পৰীক্ষা নোহোৱালৈকে "তথ্য-পৰীক্ষিত" (সত্যাপিত নহয়) হৈ থাকিব।

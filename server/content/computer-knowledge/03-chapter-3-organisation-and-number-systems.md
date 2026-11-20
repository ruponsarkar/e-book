# Chapter 3 — Computer Organisation and Number Systems / অধ্যায় ৩ — কম্পিউটাৰৰ গঠন আৰু সংখ্যা পদ্ধতি

*Facts checked: 19 November 2026 · Level: Moderate (ADRE Grade III graduate, SSC Tier 2) · Sources in 3.3*\
*তথ্য পৰীক্ষা: ১৯ নৱেম্বৰ ২০২৬*

## 3.1 Revision notes / পুনৰালোচনাৰ টোকা

**CPU (Central Processing Unit) — the "brain" of the computer / কম্পিউটাৰৰ "মগজু"**
- **ALU** (Arithmetic Logic Unit): calculations and comparisons.\
গণনা আৰু তুলনা কৰে।
- **CU** (Control Unit): directs and coordinates all parts; does not process data itself.\
সকলো অংশক নিৰ্দেশনা দিয়ে আৰু সমন্বয় কৰে।
- **Registers:** the fastest, smallest memory inside the CPU.\
চিপিইউৰ ভিতৰৰ আটাইতকৈ দ্ৰুত সৰু মেমৰি।
- The **motherboard** is the main circuit board connecting all components. Clock speed is measured in **hertz** (GHz).
**Units / একক:** 1 **bit** = 0 or 1 · 4 bits = 1 **nibble** · 8 bits = 1 **byte** · 1 KB = 1024 bytes · 1 MB = 1024 KB · 1 GB = 1024 MB · 1 TB = 1024 GB.

| System / পদ্ধতি | Base / ভিত্তি | Digits / অংক |
| --- | --- | --- |
| Binary | 2 | 0, 1 |
| Octal | 8 | 0–7 |
| Decimal | 10 | 0–9 |
| Hexadecimal | 16 | 0–9, A–F (A = 10 … F = 15) |

**Conversion / ৰূপান্তৰ:** decimal → binary: divide by 2 and read remainders from bottom to top. Binary → decimal: add place values 8-4-2-1: (1011)₂ = 8 + 0 + 2 + 1 = 11.\
দশমিকৰ পৰা বাইনেৰী: ২ৰে হৰণ কৰি ভাগশেষ তলৰ পৰা ওপৰলৈ পঢ়ক।

## 3.2 Question bank / প্ৰশ্নৰ ভঁৰাল

**Instructions:** Each question has four options; choose the one correct answer. The answer and a short explanation follow each question. All 16 questions are **\[Practice\]** questions.\
**নিৰ্দেশনা:** প্ৰতিটো প্ৰশ্নৰ চাৰিটা বিকল্প আছে; শুদ্ধ উত্তৰটো বাছি উলিওৱা। প্ৰতিটো প্ৰশ্নৰ পিছত উত্তৰ আৰু চমু ব্যাখ্যা দিয়া হৈছে। আটাইকেইটা (১৬টা) প্ৰশ্ন **\[অনুশীলনী\]** প্ৰশ্ন।

**1.** CPU stands for:\
CPU-ৰ সম্পূৰ্ণ ৰূপ কি?\
(A) Central Program Unit\
(B) Computer Processing Unit\
(C) Control Processing Unit\
(D) Central Processing Unit\
**Answer / উত্তৰ: (D) Central Processing Unit**\
Explanation: The CPU, the "brain" of the computer, carries out all instructions. [C1]\
ব্যাখ্যা: কম্পিউটাৰৰ "মগজু" চিপিইউৱে সকলো নিৰ্দেশনা পালন কৰে।\
*B7-C03-0001 · CPU · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**2.** Which part of the CPU performs arithmetic and logical operations?\
চিপিইউৰ কোন অংশই গাণিতিক আৰু যুক্তিমূলক কাম কৰে?\
(A) CU\
(B) Register\
(C) RAM\
(D) ALU\
**Answer / উত্তৰ: (D) ALU**\
Explanation: ALU = Arithmetic Logic Unit. [C1]\
ব্যাখ্যা: ALU মানে Arithmetic Logic Unit।\
*B7-C03-0002 · CPU · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**3.** Which part of the CPU directs and coordinates the other parts of the computer?\
চিপিইউৰ কোন অংশই কম্পিউটাৰৰ আন অংশবোৰক নিৰ্দেশ আৰু সমন্বয় কৰে?\
(A) Control Unit / নিয়ন্ত্ৰণ একক (CU)\
(B) ALU\
(C) Cache\
(D) Power supply / পাৱাৰ চাপ্লাই\
**Answer / উত্তৰ: (A) Control Unit / নিয়ন্ত্ৰণ একক (CU)**\
Explanation: The Control Unit fetches and decodes instructions and controls the flow of data. [C1]\
ব্যাখ্যা: নিয়ন্ত্ৰণ এককে নিৰ্দেশনা আনি অৰ্থ উলিয়ায় আৰু তথ্যৰ প্ৰবাহ নিয়ন্ত্ৰণ কৰে।\
*B7-C03-0003 · CPU · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**4.** The fastest storage locations, found inside the CPU itself, are:\
চিপিইউৰ ভিতৰত থকা আটাইতকৈ দ্ৰুত সঞ্চয় স্থান কোনবোৰ?\
(A) RAM / ৰেম\
(B) Hard disk / হাৰ্ড ডিস্ক\
(C) Registers / ৰেজিষ্টাৰ\
(D) Pen drive / পেন ড্ৰাইভ\
**Answer / উত্তৰ: (C) Registers / ৰেজিষ্টাৰ**\
Explanation: Speed order: registers > cache > RAM > secondary storage. [C1]\
ব্যাখ্যা: গতিৰ ক্ৰম: ৰেজিষ্টাৰ > কেশ্ব > ৰেম > গৌণ সঞ্চয়।\
*B7-C03-0004 · CPU · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**5.** The main circuit board of a computer is called the:\
কম্পিউটাৰৰ মূল চাৰ্কিট ব'ৰ্ডক কি বোলে?\
(A) Motherboard / মাদাৰব'ৰ্ড\
(B) Keyboard / কীব'ৰ্ড\
(C) Dashboard / ডেশ্বব'ৰ্ড\
(D) Switchboard / চুইচব'ৰ্ড\
**Answer / উত্তৰ: (A) Motherboard / মাদাৰব'ৰ্ড**\
Explanation: The CPU, RAM and expansion cards are all connected to the motherboard. [C1]\
ব্যাখ্যা: চিপিইউ, ৰেম আৰু আন কাৰ্ডবোৰ মাদাৰব'ৰ্ডত সংযুক্ত থাকে।\
*B7-C03-0005 · Hardware · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**6.** The speed of a CPU's clock is measured in:\
চিপিইউৰ ক্লকৰ গতি কি এককত জোখা হয়?\
(A) Bytes / বাইট\
(B) Hertz (GHz) / হাৰ্টজ (GHz)\
(C) Pixels / পিক্সেল\
(D) DPI\
**Answer / উত্তৰ: (B) Hertz (GHz) / হাৰ্টজ (GHz)**\
Explanation: A 3 GHz processor's clock ticks three billion times a second. [C1]\
ব্যাখ্যা: ৩ GHz প্ৰচেছৰৰ ক্লক প্ৰতি ছেকেণ্ডত তিনিশ কোটি বাৰ টিক কৰে।\
*B7-C03-0006 · CPU · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**7.** 1 gigabyte (GB) equals:\
১ গিগাবাইট (GB) কিমানৰ সমান?\
(A) 1000 KB / ১০০০ KB\
(B) 1024 KB / ১০২৪ KB\
(C) 1024 MB / ১০২৪ MB\
(D) 100 MB / ১০০ MB\
**Answer / উত্তৰ: (C) 1024 MB / ১০২৪ MB**\
Explanation: 1 GB = 1024 MB and 1 MB = 1024 KB. [C1]\
ব্যাখ্যা: ১ GB = ১০২৪ MB আৰু ১ MB = ১০২৪ KB।\
*B7-C03-0007 · Units · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**8.** Four bits together are called a:\
চাৰিটা বিটক একেলগে কি বোলে?\
(A) Byte / বাইট\
(B) Word / ৱৰ্ড\
(C) Kilobyte / কিলোবাইট\
(D) Nibble / নিবল\
**Answer / উত্তৰ: (D) Nibble / নিবল**\
Explanation: A nibble is half a byte. [C1]\
ব্যাখ্যা: নিবল হ'ল আধা বাইট।\
*B7-C03-0008 · Units · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**9.** 1 kilobyte (KB) equals:\
১ কিলোবাইট (KB) কিমানৰ সমান?\
(A) 1000 bits / ১০০০ বিট\
(B) 1024 bytes / ১০২৪ বাইট\
(C) 1024 bits / ১০২৪ বিট\
(D) 100 bytes / ১০০ বাইট\
**Answer / উত্তৰ: (B) 1024 bytes / ১০২৪ বাইট**\
Explanation: In the binary convention used in computer exams, 1 KB = 2¹⁰ = 1024 bytes. [C1]\
ব্যাখ্যা: কম্পিউটাৰৰ পৰীক্ষাত ব্যৱহৃত বাইনেৰী নিয়মত ১ KB = ২¹⁰ = ১০২৪ বাইট।\
*B7-C03-0009 · Units · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**10.** Which is the largest unit among these?\
তলৰ কোনটো আটাইতকৈ ডাঙৰ একক?\
(A) Terabyte / টেৰাবাইট\
(B) Gigabyte / গিগাবাইট\
(C) Megabyte / মেগাবাইট\
(D) Kilobyte / কিলোবাইট\
**Answer / উত্তৰ: (A) Terabyte / টেৰাবাইট**\
Explanation: KB < MB < GB < TB, each 1024 times the previous. [C1]\
ব্যাখ্যা: KB < MB < GB < TB; প্ৰতিটো আগৰটোৰ ১০২৪ গুণ।\
*B7-C03-0010 · Units · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**11.** The binary number system has base:\
বাইনেৰী সংখ্যা পদ্ধতিৰ ভিত্তি কিমান?\
(A) 8 / ৮\
(B) 10 / ১০\
(C) 16 / ১৬\
(D) 2 / ২\
**Answer / উত্তৰ: (D) 2 / ২**\
Explanation: Binary uses only 0 and 1. [C1]\
ব্যাখ্যা: বাইনেৰীত কেৱল ০ আৰু ১ ব্যৱহাৰ হয়।\
*B7-C03-0011 · Number systems · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**12.** The binary form of decimal 10 is:\
দশমিক ১০-ৰ বাইনেৰী ৰূপ কি?\
(A) 1100\
(B) 1001\
(C) 1010\
(D) 1110\
**Answer / উত্তৰ: (C) 1010**\
Explanation: 10 = 8 + 2 = 1·8 + 0·4 + 1·2 + 0·1, so 1010. [C1]\
ব্যাখ্যা: ১০ = ৮ + ২, সেয়ে 1010।\
*B7-C03-0012 · Conversion · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**13.** The decimal value of binary 1101 is:\
বাইনেৰী 1101-ৰ দশমিক মান কিমান?\
(A) 11 / ১১\
(B) 13 / ১৩\
(C) 14 / ১৪\
(D) 9 / ৯\
**Answer / উত্তৰ: (B) 13 / ১৩**\
Explanation: 8 + 4 + 0 + 1 = 13. [C1]\
ব্যাখ্যা: ৮ + ৪ + ০ + ১ = ১৩।\
*B7-C03-0013 · Conversion · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**14.** In the hexadecimal system, the letter F stands for:\
হেক্সাডেচিমেল পদ্ধতিত F আখৰে কিমান বুজায়?\
(A) 15 / ১৫\
(B) 16 / ১৬\
(C) 14 / ১৪\
(D) 10 / ১০\
**Answer / উত্তৰ: (A) 15 / ১৫**\
Explanation: A = 10, B = 11, C = 12, D = 13, E = 14, F = 15. [C1]\
ব্যাখ্যা: A = ১০ … F = ১৫।\
*B7-C03-0014 · Number systems · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**15.** Which digit is NOT used in the octal number system?\
অক্টেল সংখ্যা পদ্ধতিত কোনটো অংক ব্যৱহাৰ নহয়?\
(A) 0 / ০\
(B) 7 / ৭\
(C) 5 / ৫\
(D) 8 / ৮\
**Answer / উত্তৰ: (D) 8 / ৮**\
Explanation: Octal has base 8 and uses only 0–7. [C1]\
ব্যাখ্যা: অক্টেলৰ ভিত্তি ৮; কেৱল ০–৭ ব্যৱহাৰ হয়।\
*B7-C03-0015 · Number systems · Hard · ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**16.** The binary sum 1 + 1 equals:\
বাইনেৰীত ১ + ১ কিমান?\
(A) 2\
(B) 10\
(C) 11\
(D) 0\
**Answer / উত্তৰ: (B) 10**\
Explanation: In binary, 1 + 1 = 0 with a carry of 1, written 10 (which is 2 in decimal). [C1]\
ব্যাখ্যা: বাইনেৰীত ১ + ১ = ০, ১ কেৰী; লিখা হয় 10 (দশমিকত ২)।\
*B7-C03-0016 · Binary arithmetic · Hard · ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

## 3.3 References and verification status / উৎস আৰু সত্যাপন

| Code | Source | Status |
| --- | --- | --- |
| C1 | NCERT / NIOS computer science and IT textbooks; SEBA Computer Science (Class IX–X) | **Book check pending** |
| C2 | Vendor documentation (Microsoft Support for Office and Windows) and standards bodies (IETF, W3C) | **Page check pending** |
| C3 | Government sources: MeitY, CERT-In, NPCI, UIDAI, Digital India and Sewa Setu portals | Checked online 19 November 2026 where marked |

All 16 questions are **\[Practice\]**. Questions whose source is marked *check pending* stay at status Fact-checked (not Verified) until that check is done.\
আটাইকেইটা প্ৰশ্ন **\[অনুশীলনী\]**। উৎস *পৰীক্ষা বাকী* বুলি চিহ্নিত প্ৰশ্নবোৰ সেই পৰীক্ষা নোহোৱালৈকে "তথ্য-পৰীক্ষিত" (সত্যাপিত নহয়) হৈ থাকিব।

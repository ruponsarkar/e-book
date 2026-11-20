# Chapter 5 — Memory and Storage / অধ্যায় ৫ — মেমৰি আৰু সঞ্চয়

*Facts checked: 19 November 2026 · Level: Basic to moderate · Sources in 5.3*\
*তথ্য পৰীক্ষা: ১৯ নৱেম্বৰ ২০২৬*

## 5.1 Revision notes / পুনৰালোচনাৰ টোকা

**Primary memory / প্ৰাথমিক মেমৰি** (directly used by the CPU)
- **RAM** (Random Access Memory): read–write, **volatile** — contents are lost when power goes off. Types: DRAM (needs refreshing), SRAM (faster, used for cache).\
ৰেম অস্থায়ী (volatile); বিদ্যুৎ গ'লে তথ্য হেৰায়।
- **ROM** (Read Only Memory): **non-volatile**; holds start-up instructions (BIOS/firmware). Types: PROM, EPROM (erased by UV light), EEPROM (erased electrically).\
ৰম স্থায়ী (non-volatile); আৰম্ভণিৰ নিৰ্দেশনা ৰাখে।
- **Cache:** small, very fast memory between CPU and RAM.
**Secondary storage / গৌণ সঞ্চয়** (permanent, larger, slower)

| Type / প্ৰকাৰ | Examples / উদাহৰণ |
| --- | --- |
| Magnetic | Hard disk drive (HDD), magnetic tape, floppy disk (old) |
| Optical | CD (about 700 MB), DVD (4.7 GB single layer), Blu-ray (25 GB single layer) |
| Flash / solid-state | Pen drive, memory card, SSD |

**Speed order / গতিৰ ক্ৰম:** registers > cache > RAM > SSD > HDD. **Cloud storage** keeps files on servers reached over the internet.

## 5.2 Question bank / প্ৰশ্নৰ ভঁৰাল

**Instructions:** Each question has four options; choose the one correct answer. The answer and a short explanation follow each question. All 14 questions are **\[Practice\]** questions.\
**নিৰ্দেশনা:** প্ৰতিটো প্ৰশ্নৰ চাৰিটা বিকল্প আছে; শুদ্ধ উত্তৰটো বাছি উলিওৱা। প্ৰতিটো প্ৰশ্নৰ পিছত উত্তৰ আৰু চমু ব্যাখ্যা দিয়া হৈছে। আটাইকেইটা (১৪টা) প্ৰশ্ন **\[অনুশীলনী\]** প্ৰশ্ন।

**1.** RAM stands for:\
RAM-ৰ সম্পূৰ্ণ ৰূপ কি?\
(A) Read Access Memory\
(B) Random Access Memory\
(C) Rapid Action Memory\
(D) Random Allocation Module\
**Answer / উত্তৰ: (B) Random Access Memory**\
Explanation: RAM is volatile: its contents are lost when the power is switched off. [C1]\
ব্যাখ্যা: ৰেম অস্থায়ী: বিদ্যুৎ বন্ধ হ'লে ইয়াৰ তথ্য হেৰায়।\
*B7-C05-0001 · RAM · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**2.** Which memory keeps its contents even when the power is off?\
বিদ্যুৎ বন্ধ হ'লেও কোন মেমৰিয়ে তথ্য ধৰি ৰাখে?\
(A) RAM / ৰেম\
(B) ROM / ৰম\
(C) Cache / কেশ্ব\
(D) Register / ৰেজিষ্টাৰ\
**Answer / উত্তৰ: (B) ROM / ৰম**\
Explanation: ROM is non-volatile. [C1]\
ব্যাখ্যা: ৰম স্থায়ী (non-volatile)।\
*B7-C05-0002 · ROM · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**3.** The instructions that start a computer (BIOS) are stored in:\
কম্পিউটাৰ আৰম্ভ কৰা নিৰ্দেশনা (BIOS) ক'ত সঞ্চিত থাকে?\
(A) ROM / ৰম\
(B) RAM / ৰেম\
(C) Hard disk only / কেৱল হাৰ্ড ডিস্কত\
(D) Pen drive / পেন ড্ৰাইভ\
**Answer / উত্তৰ: (A) ROM / ৰম**\
Explanation: BIOS is firmware kept in ROM (today usually flash ROM) so it survives power-off. [C1]\
ব্যাখ্যা: BIOS ৰমত থকা ফাৰ্মৱেৰ, সেয়ে বিদ্যুৎ গ'লেও থাকে।\
*B7-C05-0003 · ROM · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**4.** A small, very fast memory placed between the CPU and RAM is:\
চিপিইউ আৰু ৰেমৰ মাজত থকা সৰু, অতি দ্ৰুত মেমৰি কোনটো?\
(A) Virtual memory / ভাৰ্চুৱেল মেমৰি\
(B) Hard disk / হাৰ্ড ডিস্ক\
(C) Cache memory / কেশ্ব মেমৰি\
(D) ROM / ৰম\
**Answer / উত্তৰ: (C) Cache memory / কেশ্ব মেমৰি**\
Explanation: Cache stores frequently used data so the CPU does not wait for RAM. [C1]\
ব্যাখ্যা: সঘনাই লগা তথ্য কেশ্বত থাকে, যাতে চিপিইউৱে ৰেমলৈ অপেক্ষা কৰিব নালাগে।\
*B7-C05-0004 · Cache · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**5.** Which ROM can be erased using ultraviolet light?\
কোন ৰম অতিবেঙুনীয়া পোহৰেৰে মচিব পাৰি?\
(A) EPROM\
(B) PROM\
(C) EEPROM\
(D) Mask ROM\
**Answer / উত্তৰ: (A) EPROM**\
Explanation: EPROM is erased by UV light; EEPROM is erased electrically. [C1]\
ব্যাখ্যা: EPROM অতিবেঙুনীয়া পোহৰেৰে, EEPROM বিদ্যুতেৰে মচা হয়।\
*B7-C05-0005 · ROM types · Hard · ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**6.** A hard disk drive stores data:\
হাৰ্ড ডিস্ক ড্ৰাইভে তথ্য কেনেকৈ সঞ্চয় কৰে?\
(A) Optically / আলোকীয়ভাৱে\
(B) Using flash chips / ফ্লেশ্ব চিপেৰে\
(C) Magnetically / চুম্বকীয়ভাৱে\
(D) On paper / কাগজত\
**Answer / উত্তৰ: (C) Magnetically / চুম্বকীয়ভাৱে**\
Explanation: An HDD uses spinning magnetic platters. [C1]\
ব্যাখ্যা: HDD-ত ঘূৰি থকা চুম্বকীয় প্লেটাৰ থাকে।\
*B7-C05-0006 · Secondary storage · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**7.** CDs and DVDs are examples of:\
চিডি আৰু ডিভিডি কিহৰ উদাহৰণ?\
(A) Magnetic storage / চুম্বকীয় সঞ্চয়\
(B) Primary memory / প্ৰাথমিক মেমৰি\
(C) Cache memory / কেশ্ব মেমৰি\
(D) Optical storage / আলোকীয় সঞ্চয়\
**Answer / উত্তৰ: (D) Optical storage / আলোকীয় সঞ্চয়**\
Explanation: A laser reads the pits on their surface. [C1]\
ব্যাখ্যা: লেজাৰে ইয়াৰ পৃষ্ঠৰ খাঁজবোৰ পঢ়ে।\
*B7-C05-0007 · Secondary storage · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**8.** A pen drive uses which type of memory?\
পেন ড্ৰাইভে কেনে মেমৰি ব্যৱহাৰ কৰে?\
(A) Magnetic tape / চুম্বকীয় টেপ\
(B) Optical disc / আলোকীয় ডিস্ক\
(C) Flash memory / ফ্লেশ্ব মেমৰি\
(D) Cache / কেশ্ব\
**Answer / উত্তৰ: (C) Flash memory / ফ্লেশ্ব মেমৰি**\
Explanation: Pen drives, memory cards and SSDs use non-volatile flash memory. [C1]\
ব্যাখ্যা: পেন ড্ৰাইভ, মেমৰি কাৰ্ড আৰু SSD-ত ফ্লেশ্ব মেমৰি থাকে।\
*B7-C05-0008 · Secondary storage · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**9.** Which is the fastest of these?\
তলৰ কোনটো আটাইতকৈ দ্ৰুত?\
(A) Cache / কেশ্ব\
(B) RAM / ৰেম\
(C) Hard disk / হাৰ্ড ডিস্ক\
(D) DVD / ডিভিডি\
**Answer / উত্তৰ: (A) Cache / কেশ্ব**\
Explanation: Cache is faster than RAM, which is faster than any disk. [C1]\
ব্যাখ্যা: কেশ্ব ৰেমতকৈ দ্ৰুত, ৰেম যিকোনো ডিস্কতকৈ দ্ৰুত।\
*B7-C05-0009 · Memory hierarchy · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**10.** The memory used to build cache is usually:\
কেশ্ব সাধাৰণতে কোন মেমৰিৰে নিৰ্মিত?\
(A) DRAM\
(B) SRAM\
(C) EPROM\
(D) Flash\
**Answer / উত্তৰ: (B) SRAM**\
Explanation: Static RAM is faster than Dynamic RAM and does not need refreshing. [C1]\
ব্যাখ্যা: SRAM, DRAMতকৈ দ্ৰুত আৰু ইয়াক refresh কৰিব নালাগে।\
*B7-C05-0010 · RAM types · Hard · ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**11.** Which of these is primary memory?\
তলৰ কোনটো প্ৰাথমিক মেমৰি?\
(A) Hard disk / হাৰ্ড ডিস্ক\
(B) Pen drive / পেন ড্ৰাইভ\
(C) Blu-ray disc / ব্লু-ৰে ডিস্ক\
(D) RAM / ৰেম\
**Answer / উত্তৰ: (D) RAM / ৰেম**\
Explanation: Primary memory (RAM, ROM) is directly accessed by the CPU. [C1]\
ব্যাখ্যা: চিপিইউৱে পোনপটীয়াকৈ প্ৰাথমিক মেমৰি (RAM, ROM) ব্যৱহাৰ কৰে।\
*B7-C05-0011 · Primary memory · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**12.** An SSD differs from an HDD mainly because it:\
SSD আৰু HDD-ৰ মূল পাৰ্থক্য কি?\
(A) Stores data on paper / কাগজত তথ্য ৰাখে\
(B) Has no moving parts / ইয়াত কোনো ঘূৰা অংশ নাই\
(C) Is volatile / ই অস্থায়ী\
(D) Can only be read / কেৱল পঢ়িব পাৰি\
**Answer / উত্তৰ: (B) Has no moving parts / ইয়াত কোনো ঘূৰা অংশ নাই**\
Explanation: SSDs use flash chips, so they are faster and more shock-resistant. [C1]\
ব্যাখ্যা: SSD-ত ফ্লেশ্ব চিপ থাকে, সেয়ে দ্ৰুত আৰু আঘাত সহ্য কৰিব পাৰে।\
*B7-C05-0012 · Secondary storage · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**13.** Saving files on servers that you reach through the internet is called:\
ইণ্টাৰনেটৰ জৰিয়তে চাৰ্ভাৰত ফাইল সঞ্চয় কৰাক কি বোলে?\
(A) Cache storage / কেশ্ব ষ্টৰেজ\
(B) Optical storage / আলোকীয় সঞ্চয়\
(C) Virtual RAM / ভাৰ্চুৱেল ৰেম\
(D) Cloud storage / ক্লাউড ষ্টৰেজ\
**Answer / উত্তৰ: (D) Cloud storage / ক্লাউড ষ্টৰেজ**\
Explanation: Examples include Google Drive, OneDrive and DigiLocker. [C3]\
ব্যাখ্যা: উদাহৰণ: Google Drive, OneDrive, DigiLocker।\
*B7-C05-0013 · Cloud storage · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**14.** A single-layer DVD typically holds about:\
এক-স্তৰৰ ডিভিডিত সাধাৰণতে প্ৰায় কিমান তথ্য ধৰে?\
(A) 700 MB / ৭০০ MB\
(B) 4.7 GB / ৪.৭ GB\
(C) 1.44 MB / ১.৪৪ MB\
(D) 25 GB / ২৫ GB\
**Answer / উত্তৰ: (B) 4.7 GB / ৪.৭ GB**\
Explanation: CD ≈ 700 MB; single-layer DVD 4.7 GB; single-layer Blu-ray 25 GB; floppy 1.44 MB. [C1]\
ব্যাখ্যা: চিডি ≈ ৭০০ MB; ডিভিডি ৪.৭ GB; ব্লু-ৰে ২৫ GB; ফ্লপি ১.৪৪ MB।\
*B7-C05-0014 · Storage capacity · Hard · ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

## 5.3 References and verification status / উৎস আৰু সত্যাপন

| Code | Source | Status |
| --- | --- | --- |
| C1 | NCERT / NIOS computer science and IT textbooks; SEBA Computer Science (Class IX–X) | **Book check pending** |
| C2 | Vendor documentation (Microsoft Support for Office and Windows) and standards bodies (IETF, W3C) | **Page check pending** |
| C3 | Government sources: MeitY, CERT-In, NPCI, UIDAI, Digital India and Sewa Setu portals | Checked online 19 November 2026 where marked |

All 14 questions are **\[Practice\]**. Questions whose source is marked *check pending* stay at status Fact-checked (not Verified) until that check is done.\
আটাইকেইটা প্ৰশ্ন **\[অনুশীলনী\]**। উৎস *পৰীক্ষা বাকী* বুলি চিহ্নিত প্ৰশ্নবোৰ সেই পৰীক্ষা নোহোৱালৈকে "তথ্য-পৰীক্ষিত" (সত্যাপিত নহয়) হৈ থাকিব।

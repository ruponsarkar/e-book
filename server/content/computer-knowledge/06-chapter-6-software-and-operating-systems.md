# Chapter 6 — Software and Operating Systems / অধ্যায় ৬ — ছফ্টৱেৰ আৰু অপাৰেটিং চিষ্টেম

*Facts checked: 19 November 2026 · Level: Basic to moderate · Sources in 6.3*\
*তথ্য পৰীক্ষা: ১৯ নৱেম্বৰ ২০২৬*

## 6.1 Revision notes / পুনৰালোচনাৰ টোকা

**Software types / ছফ্টৱেৰৰ প্ৰকাৰ**
- **System software:** runs the computer — operating system, device drivers, utilities (antivirus, disk cleanup).\
**চিষ্টেম ছফ্টৱেৰ:** কম্পিউটাৰ চলায়।
- **Application software:** does a user's task — word processor, spreadsheet, browser, games.\
**এপ্লিকেচন ছফ্টৱেৰ:** ব্যৱহাৰকাৰীৰ কাম কৰে।
- **Language translators:** **compiler** (translates the whole program at once), **interpreter** (line by line), **assembler** (assembly language → machine code).
- Licences: **open source** (code free to view and change, e.g. Linux), **freeware** (free to use), **shareware** (try first, pay later), **proprietary** (e.g. Windows, MS Office).

**Operating system (OS) / অপাৰেটিং চিষ্টেম:** manages hardware, memory, files and processes, and gives a user interface. Examples: Windows, macOS, Linux, Android, iOS. **Linux** was created by **Linus Torvalds** in 1991; **Android** is based on the Linux kernel.
- **Booting:** cold boot (switching on), warm boot (restart).
- **GUI** (icons, windows) vs **CLI** (typed commands, e.g. MS-DOS).

## 6.2 Question bank / প্ৰশ্নৰ ভঁৰাল

**Instructions:** Each question has four options; choose the one correct answer. The answer and a short explanation follow each question. All 14 questions are **\[Practice\]** questions.\
**নিৰ্দেশনা:** প্ৰতিটো প্ৰশ্নৰ চাৰিটা বিকল্প আছে; শুদ্ধ উত্তৰটো বাছি উলিওৱা। প্ৰতিটো প্ৰশ্নৰ পিছত উত্তৰ আৰু চমু ব্যাখ্যা দিয়া হৈছে। আটাইকেইটা (১৪টা) প্ৰশ্ন **\[অনুশীলনী\]** প্ৰশ্ন।

**1.** An operating system is an example of:\
অপাৰেটিং চিষ্টেম কিহৰ উদাহৰণ?\
(A) System software / চিষ্টেম ছফ্টৱেৰ\
(B) Application software / এপ্লিকেচন ছফ্টৱেৰ\
(C) Hardware / হাৰ্ডৱেৰ\
(D) Firmware only / কেৱল ফাৰ্মৱেৰ\
**Answer / উত্তৰ: (A) System software / চিষ্টেম ছফ্টৱেৰ**\
Explanation: The OS manages the computer itself. [C1]\
ব্যাখ্যা: অপাৰেটিং চিষ্টেমে কম্পিউটাৰটোক পৰিচালনা কৰে।\
*B7-C06-0001 · Software types · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**2.** MS Word is an example of:\
এমএছ ৱৰ্ড কিহৰ উদাহৰণ?\
(A) System software / চিষ্টেম ছফ্টৱেৰ\
(B) Operating system / অপাৰেটিং চিষ্টেম\
(C) Device driver / ডিভাইচ ড্ৰাইভাৰ\
(D) Application software / এপ্লিকেচন ছফ্টৱেৰ\
**Answer / উত্তৰ: (D) Application software / এপ্লিকেচন ছফ্টৱেৰ**\
Explanation: It does a user task — writing documents. [C1]\
ব্যাখ্যা: ই ব্যৱহাৰকাৰীৰ কাম — নথি লিখা — কৰে।\
*B7-C06-0002 · Software types · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**3.** Which of these is NOT an operating system?\
তলৰ কোনটো অপাৰেটিং চিষ্টেম নহয়?\
(A) Google Chrome / গুগল ক্ৰ'ম\
(B) Windows / উইণ্ড'জ\
(C) Linux / লিনাক্স\
(D) Android / এণ্ড্ৰইড\
**Answer / উত্তৰ: (A) Google Chrome / গুগল ক্ৰ'ম**\
Explanation: Chrome is a web browser (application software); ChromeOS is a separate operating system. [C1]\
ব্যাখ্যা: ক্ৰ'ম এটা ৱেব ব্ৰাউজাৰ; ChromeOS বেলেগ অপাৰেটিং চিষ্টেম।\
*B7-C06-0003 · Operating systems · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**4.** Linux was first developed by:\
লিনাক্স প্ৰথমে কোনে বিকশিত কৰিছিল?\
(A) Bill Gates / বিল গেটছ\
(B) Steve Jobs / ষ্টিভ জবছ\
(C) Dennis Ritchie / ডেনিছ ৰিচি\
(D) Linus Torvalds / লিনাছ টৰ্ভাল্ডছ\
**Answer / উত্তৰ: (D) Linus Torvalds / লিনাছ টৰ্ভাল্ডছ**\
Explanation: Torvalds released the Linux kernel in 1991; it is open source. [C1]\
ব্যাখ্যা: টৰ্ভাল্ডছে ১৯৯১ত লিনাক্স কাৰ্ণেল মুকলি কৰে; ই মুক্ত উৎস (open source)।\
*B7-C06-0004 · Operating systems · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**5.** Android is based on the kernel of:\
এণ্ড্ৰইড কোনটোৰ কাৰ্ণেলৰ ওপৰত আধাৰিত?\
(A) Windows / উইণ্ড'জ\
(B) macOS\
(C) Linux / লিনাক্স\
(D) MS-DOS\
**Answer / উত্তৰ: (C) Linux / লিনাক্স**\
Explanation: Android uses a modified Linux kernel. [C1]\
ব্যাখ্যা: এণ্ড্ৰইডে সংশোধিত লিনাক্স কাৰ্ণেল ব্যৱহাৰ কৰে।\
*B7-C06-0005 · Operating systems · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**6.** A program that translates a whole high-level program into machine code at once is a:\
উচ্চ-স্তৰৰ গোটেই প্ৰগ্ৰামটো একেবাৰতে মেচিন ক'ডলৈ অনুবাদ কৰা প্ৰগ্ৰাম কোনটো?\
(A) Interpreter / ইণ্টাৰপ্ৰিটাৰ\
(B) Assembler / এছেম্বলাৰ\
(C) Compiler / কম্পাইলাৰ\
(D) Loader / ল'ডাৰ\
**Answer / উত্তৰ: (C) Compiler / কম্পাইলাৰ**\
Explanation: An interpreter translates and runs one line at a time. [C1]\
ব্যাখ্যা: ইণ্টাৰপ্ৰিটাৰে এটা এটা শাৰীকৈ অনুবাদ কৰি চলায়।\
*B7-C06-0006 · Translators · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**7.** An assembler converts:\
এছেম্বলাৰে কি ৰূপান্তৰ কৰে?\
(A) Machine code into English / মেচিন ক'ডক ইংৰাজীলৈ\
(B) Assembly language into machine code / এছেম্বলী ভাষাক মেচিন ক'ডলৈ\
(C) High-level language into assembly only / উচ্চ-স্তৰৰ ভাষাক কেৱল এছেম্বলীলৈ\
(D) Text into images / লিখনিক ছবিলৈ\
**Answer / উত্তৰ: (B) Assembly language into machine code / এছেম্বলী ভাষাক মেচিন ক'ডলৈ**\
Explanation: Assembly uses short codes (mnemonics) such as ADD, MOV. [C1]\
ব্যাখ্যা: এছেম্বলীত ADD, MOV আদি চমু ক'ড ব্যৱহাৰ হয়।\
*B7-C06-0007 · Translators · Hard · ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**8.** The only language a computer understands directly is:\
কম্পিউটাৰে পোনপটীয়াকৈ বুজি পোৱা একমাত্ৰ ভাষা কোনটো?\
(A) English / ইংৰাজী\
(B) Python / পাইথন\
(C) Machine language / মেচিন ভাষা\
(D) HTML\
**Answer / উত্তৰ: (C) Machine language / মেচিন ভাষা**\
Explanation: Machine language is written in binary 0s and 1s. [C1]\
ব্যাখ্যা: মেচিন ভাষা বাইনেৰী ০ আৰু ১-ত লিখা।\
*B7-C06-0008 · Languages · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**9.** Software whose source code anyone can view, change and share is called:\
যিকোনোৱে চাব, সলনি কৰিব আৰু ভাগ কৰিব পৰা উৎস ক'ডৰ ছফ্টৱেৰক কি বোলে?\
(A) Proprietary software / স্বত্বাধিকাৰী ছফ্টৱেৰ\
(B) Shareware / শ্বেয়াৰৱেৰ\
(C) Malware / মেলৱেৰ\
(D) Open-source software / মুক্ত উৎসৰ ছফ্টৱেৰ\
**Answer / উত্তৰ: (D) Open-source software / মুক্ত উৎসৰ ছফ্টৱেৰ**\
Explanation: Linux, LibreOffice and Firefox are open source. [C1]\
ব্যাখ্যা: লিনাক্স, লিব্ৰে'অফিচ, ফায়াৰফক্স মুক্ত উৎসৰ।\
*B7-C06-0009 · Licences · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**10.** Restarting a computer that is already on is called:\
চলি থকা কম্পিউটাৰ পুনৰ আৰম্ভ কৰাক কি বোলে?\
(A) Cold booting / কোল্ড বুটিং\
(B) Warm booting / ৱাৰ্ম বুটিং\
(C) Formatting / ফৰমেটিং\
(D) Logging off / লগ অফ\
**Answer / উত্তৰ: (B) Warm booting / ৱাৰ্ম বুটিং**\
Explanation: Cold booting starts a computer from power-off. [C1]\
ব্যাখ্যা: বন্ধ অৱস্থাৰ পৰা আৰম্ভ কৰাটো কোল্ড বুটিং।\
*B7-C06-0010 · Booting · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**11.** An interface that uses icons, windows and menus is called:\
আইকন, উইণ্ড' আৰু মেনু ব্যৱহাৰ কৰা ইণ্টাৰফেচক কি বোলে?\
(A) CLI / চিএলআই (CLI)\
(B) BIOS\
(C) URL\
(D) GUI / জিইউআই (GUI)\
**Answer / উত্তৰ: (D) GUI / জিইউআই (GUI)**\
Explanation: GUI = Graphical User Interface; CLI = Command Line Interface. [C1]\
ব্যাখ্যা: GUI = Graphical User Interface; CLI = Command Line Interface।\
*B7-C06-0011 · User interface · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**12.** A small program that lets the operating system work with a printer is a:\
অপাৰেটিং চিষ্টেমক প্ৰিণ্টাৰৰ সৈতে কাম কৰিবলৈ দিয়া সৰু প্ৰগ্ৰাম কোনটো?\
(A) Compiler / কম্পাইলাৰ\
(B) Device driver / ডিভাইচ ড্ৰাইভাৰ\
(C) Spreadsheet / স্প্ৰেডশ্বীট\
(D) Browser / ব্ৰাউজাৰ\
**Answer / উত্তৰ: (B) Device driver / ডিভাইচ ড্ৰাইভাৰ**\
Explanation: Each hardware device needs a driver. [C1]\
ব্যাখ্যা: প্ৰতিটো হাৰ্ডৱেৰ ডিভাইচৰ বাবে ড্ৰাইভাৰ লাগে।\
*B7-C06-0012 · System software · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**13.** Software that can be tried free for a period before buying is:\
কিনাৰ আগতে কিছুদিন বিনামূলীয়াকৈ চলাই চাব পৰা ছফ্টৱেৰক কি বোলে?\
(A) Freeware / ফ্ৰীৱেৰ\
(B) Open source / মুক্ত উৎস\
(C) Shareware / শ্বেয়াৰৱেৰ\
(D) Firmware / ফাৰ্মৱেৰ\
**Answer / উত্তৰ: (C) Shareware / শ্বেয়াৰৱেৰ**\
Explanation: Freeware is free to use without a trial limit. [C1]\
ব্যাখ্যা: ফ্ৰীৱেৰ কোনো সময়সীমা নোহোৱাকৈ বিনামূলীয়া।\
*B7-C06-0013 · Licences · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**14.** Which of these is a function of an operating system?\
তলৰ কোনটো অপাৰেটিং চিষ্টেমৰ কাম?\
(A) Memory and file management / মেমৰি আৰু ফাইল পৰিচালনা\
(B) Typing letters / চিঠি টাইপ কৰা\
(C) Editing photos / ফটো সম্পাদনা\
(D) Making presentations / উপস্থাপন প্ৰস্তুত কৰা\
**Answer / উত্তৰ: (A) Memory and file management / মেমৰি আৰু ফাইল পৰিচালনা**\
Explanation: The OS manages memory, files, processes and devices; the others are application tasks. [C1]\
ব্যাখ্যা: অপাৰেটিং চিষ্টেমে মেমৰি, ফাইল, প্ৰচেছ আৰু ডিভাইচ পৰিচালনা কৰে।\
*B7-C06-0014 · OS functions · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

## 6.3 References and verification status / উৎস আৰু সত্যাপন

| Code | Source | Status |
| --- | --- | --- |
| C1 | NCERT / NIOS computer science and IT textbooks; SEBA Computer Science (Class IX–X) | **Book check pending** |
| C2 | Vendor documentation (Microsoft Support for Office and Windows) and standards bodies (IETF, W3C) | **Page check pending** |
| C3 | Government sources: MeitY, CERT-In, NPCI, UIDAI, Digital India and Sewa Setu portals | Checked online 19 November 2026 where marked |

All 14 questions are **\[Practice\]**. Questions whose source is marked *check pending* stay at status Fact-checked (not Verified) until that check is done.\
আটাইকেইটা প্ৰশ্ন **\[অনুশীলনী\]**। উৎস *পৰীক্ষা বাকী* বুলি চিহ্নিত প্ৰশ্নবোৰ সেই পৰীক্ষা নোহোৱালৈকে "তথ্য-পৰীক্ষিত" (সত্যাপিত নহয়) হৈ থাকিব।

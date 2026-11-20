# Chapter 15 — Database Fundamentals / অধ্যায় ১৫ — ডাটাবেছৰ মৌলিক ধাৰণা

*Facts checked: 19 November 2026 · Level: Moderate (ADRE Grade III graduate, SSC Tier 2) · Sources in 15.3*\
*তথ্য পৰীক্ষা: ১৯ নৱেম্বৰ ২০২৬*

## 15.1 Revision notes / পুনৰালোচনাৰ টোকা

- A **database** is an organised collection of related data. A **DBMS** (Database Management System) is the software that stores, retrieves and manages it — e.g. MySQL, Oracle, Microsoft Access, PostgreSQL.\
ডাটাবেছ হ'ল সম্পৰ্কিত তথ্যৰ সুসংগঠিত সংগ্ৰহ।
- In a **relational database (RDBMS)** data is kept in **tables**. A **row** = **record** (tuple); a **column** = **field** (attribute). The relational model was proposed by **E. F. Codd** (1970).\
ৰ' = record; কলম = field।
- **Primary key:** uniquely identifies each record (e.g. roll number); cannot be empty or repeated. **Foreign key:** a field that refers to the primary key of another table.
- **SQL** (Structured Query Language) works with databases. **DDL** defines structure (CREATE, ALTER, DROP); **DML** handles data (SELECT, INSERT, UPDATE, DELETE).
- **Query** = a request for data; **report** = formatted output; **form** = screen for entering data.
- **Redundancy** = unnecessary repetition of data; **normalisation** reduces it.

## 15.2 Question bank / প্ৰশ্নৰ ভঁৰাল

**Instructions:** Each question has four options; choose the one correct answer. The answer and a short explanation follow each question. All 13 questions are **\[Practice\]** questions.\
**নিৰ্দেশনা:** প্ৰতিটো প্ৰশ্নৰ চাৰিটা বিকল্প আছে; শুদ্ধ উত্তৰটো বাছি উলিওৱা। প্ৰতিটো প্ৰশ্নৰ পিছত উত্তৰ আৰু চমু ব্যাখ্যা দিয়া হৈছে। আটাইকেইটা (১৩টা) প্ৰশ্ন **\[অনুশীলনী\]** প্ৰশ্ন।

**1.** Software used to create and manage databases is called a:\
ডাটাবেছ তৈয়াৰ আৰু পৰিচালনা কৰা ছফ্টৱেৰক কি বোলে?\
(A) Compiler / কম্পাইলাৰ\
(B) Browser / ব্ৰাউজাৰ\
(C) Word processor / ৱৰ্ড প্ৰচেছৰ\
(D) DBMS\
**Answer / উত্তৰ: (D) DBMS**\
Explanation: DBMS = Database Management System. [C1]\
ব্যাখ্যা: DBMS = Database Management System।\
*B7-C15-0001 · Basics · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**2.** In a database table, a row is also called a:\
ডাটাবেছ টেবুলত ৰ'ক আন কি নামেৰে জনা যায়?\
(A) Field / ফিল্ড\
(B) Key / কী\
(C) Query / কুৱেৰী\
(D) Record / ৰেকৰ্ড\
**Answer / উত্তৰ: (D) Record / ৰেকৰ্ড**\
Explanation: Columns are fields; rows are records (tuples). [C1]\
ব্যাখ্যা: কলম হ'ল ফিল্ড; ৰ' হ'ল ৰেকৰ্ড।\
*B7-C15-0002 · Tables · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**3.** In a database table, a column is called a:\
ডাটাবেছ টেবুলত কলমক কি বোলে?\
(A) Record / ৰেকৰ্ড\
(B) Tuple / টিউপল\
(C) Field / ফিল্ড\
(D) Report / ৰিপ'ৰ্ট\
**Answer / উত্তৰ: (C) Field / ফিল্ড**\
Explanation: A field holds one kind of data, such as "Name" or "Age". [C1]\
ব্যাখ্যা: ফিল্ডত এবিধ তথ্য থাকে, যেনে "Name" বা "Age"।\
*B7-C15-0003 · Tables · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**4.** A field that uniquely identifies each record in a table is the:\
টেবুলৰ প্ৰতিটো ৰেকৰ্ড অনন্যভাৱে চিনাক্ত কৰা ফিল্ডক কি বোলে?\
(A) Foreign key / ফৰেইন কী\
(B) Primary key / প্ৰাইমাৰী কী\
(C) Secondary field / চেকেণ্ডাৰী ফিল্ড\
(D) Index card / ইণ্ডেক্স কাৰ্ড\
**Answer / উত্তৰ: (B) Primary key / প্ৰাইমাৰী কী**\
Explanation: A primary key cannot be repeated or left empty, e.g. a roll number. [C1]\
ব্যাখ্যা: প্ৰাইমাৰী কী পুনৰাবৃত্তি বা খালী হ'ব নোৱাৰে, যেনে ৰোল নম্বৰ।\
*B7-C15-0004 · Keys · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**5.** A field in one table that refers to the primary key of another table is a:\
এখন টেবুলৰ যি ফিল্ডে আন এখন টেবুলৰ প্ৰাইমাৰী কী উল্লেখ কৰে, তাক কি বোলে?\
(A) Foreign key / ফৰেইন কী\
(B) Super key / ছুপাৰ কী\
(C) Composite field / কম্প'জিট ফিল্ড\
(D) Candidate record / কেণ্ডিডেট ৰেকৰ্ড\
**Answer / উত্তৰ: (A) Foreign key / ফৰেইন কী**\
Explanation: Foreign keys link related tables. [C1]\
ব্যাখ্যা: ফৰেইন কী-য়ে সম্পৰ্কিত টেবুল সংযোগ কৰে।\
*B7-C15-0005 · Keys · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**6.** The language commonly used to query relational databases is:\
ৰিলেচনেল ডাটাবেছত কুৱেৰী কৰিবলৈ সাধাৰণতে কোন ভাষা ব্যৱহাৰ হয়?\
(A) SQL\
(B) HTML\
(C) C++\
(D) XML\
**Answer / উত্তৰ: (A) SQL**\
Explanation: SQL = Structured Query Language. [C1]\
ব্যাখ্যা: SQL = Structured Query Language।\
*B7-C15-0006 · SQL · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**7.** Which SQL command is used to fetch data from a table?\
টেবুলৰ পৰা তথ্য আনিবলৈ কোন SQL কমাণ্ড ব্যৱহাৰ হয়?\
(A) SELECT\
(B) INSERT\
(C) CREATE\
(D) DROP\
**Answer / উত্তৰ: (A) SELECT**\
Explanation: INSERT adds rows; CREATE makes a table; DROP removes a table. [C1]\
ব্যাখ্যা: INSERT-এ ৰ' যোগ কৰে; CREATE-এ টেবুল বনায়; DROP-এ টেবুল আঁতৰায়।\
*B7-C15-0007 · SQL · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**8.** CREATE, ALTER and DROP belong to which category of SQL commands?\
CREATE, ALTER আৰু DROP কোন শ্ৰেণীৰ SQL কমাণ্ড?\
(A) DML (Data Manipulation Language)\
(B) DCL (Data Control Language)\
(C) DDL (Data Definition Language)\
(D) TCL (Transaction Control Language)\
**Answer / উত্তৰ: (C) DDL (Data Definition Language)**\
Explanation: DDL defines the structure; DML (SELECT, INSERT, UPDATE, DELETE) handles the data. [C1]\
ব্যাখ্যা: DDL-এ গঠন নিৰ্ধাৰণ কৰে; DML-এ তথ্য চম্ভালে।\
*B7-C15-0008 · SQL · Hard · ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**9.** The relational model of databases was proposed by:\
ডাটাবেছৰ ৰিলেচনেল মডেল কোনে প্ৰস্তাৱ কৰিছিল?\
(A) Charles Babbage / চাৰ্লছ বেবেজ\
(B) Dennis Ritchie / ডেনিছ ৰিচি\
(C) E. F. Codd / ই. এফ. কড\
(D) James Gosling / জেমছ গছলিং\
**Answer / উত্তৰ: (C) E. F. Codd / ই. এফ. কড**\
Explanation: Codd published the model at IBM in 1970. [C1]\
ব্যাখ্যা: কডে ১৯৭০ত আইবিএমত এই মডেল প্ৰকাশ কৰে।\
*B7-C15-0009 · History · Hard · ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**10.** Which of these is a database management system?\
তলৰ কোনটো ডাটাবেছ মেনেজমেণ্ট চিষ্টেম?\
(A) MS Paint\
(B) MySQL\
(C) Notepad\
(D) Adobe Reader\
**Answer / উত্তৰ: (B) MySQL**\
Explanation: MySQL, Oracle, PostgreSQL and MS Access are DBMSs. [C1]\
ব্যাখ্যা: MySQL, Oracle, PostgreSQL, MS Access — এইবোৰ DBMS।\
*B7-C15-0010 · Examples · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**11.** Unnecessary repetition of the same data in a database is called:\
ডাটাবেছত একে তথ্যৰ অপ্ৰয়োজনীয় পুনৰাবৃত্তিক কি বোলে?\
(A) Data integrity / ডাটা ইণ্টিগ্ৰিটি\
(B) Data security / ডাটা চিকিউৰিটি\
(C) Data mining / ডাটা মাইনিং\
(D) Data redundancy / ডাটা ৰিডাণ্ডেঞ্চি\
**Answer / উত্তৰ: (D) Data redundancy / ডাটা ৰিডাণ্ডেঞ্চি**\
Explanation: Normalisation is used to reduce redundancy. [C1]\
ব্যাখ্যা: ৰিডাণ্ডেঞ্চি কমাবলৈ নৰ্মেলাইজেচন ব্যৱহাৰ হয়।\
*B7-C15-0011 · Concepts · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**12.** In MS Access, a screen designed for entering data easily is a:\
এমএছ এক্সেছত সহজে তথ্য প্ৰবিষ্ট কৰিবলৈ বনোৱা পৰ্দাক কি বোলে?\
(A) Report / ৰিপ'ৰ্ট\
(B) Query / কুৱেৰী\
(C) Macro / মেক্ৰ'\
(D) Form / ফৰ্ম\
**Answer / উত্তৰ: (D) Form / ফৰ্ম**\
Explanation: A report presents data for printing; a query asks for data. [C1]\
ব্যাখ্যা: ৰিপ'ৰ্টে ছপাৰ বাবে তথ্য দেখুৱায়; কুৱেৰীয়ে তথ্য বিচাৰে।\
*B7-C15-0012 · Access objects · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**13.** A request to get specific information from a database is a:\
ডাটাবেছৰ পৰা নিৰ্দিষ্ট তথ্য পাবলৈ কৰা অনুৰোধক কি বোলে?\
(A) Query / কুৱেৰী\
(B) Field / ফিল্ড\
(C) Cell / চেল\
(D) Slide / স্লাইড\
**Answer / উত্তৰ: (A) Query / কুৱেৰী**\
Explanation: Queries filter and combine data from tables. [C1]\
ব্যাখ্যা: কুৱেৰীয়ে টেবুলৰ পৰা তথ্য ছাঁকি একত্ৰিত কৰে।\
*B7-C15-0013 · Concepts · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

## 15.3 References and verification status / উৎস আৰু সত্যাপন

| Code | Source | Status |
| --- | --- | --- |
| C1 | NCERT / NIOS computer science and IT textbooks; SEBA Computer Science (Class IX–X) | **Book check pending** |
| C2 | Vendor documentation (Microsoft Support for Office and Windows) and standards bodies (IETF, W3C) | **Page check pending** |
| C3 | Government sources: MeitY, CERT-In, NPCI, UIDAI, Digital India and Sewa Setu portals | Checked online 19 November 2026 where marked |

All 13 questions are **\[Practice\]**. Questions whose source is marked *check pending* stay at status Fact-checked (not Verified) until that check is done.\
আটাইকেইটা প্ৰশ্ন **\[অনুশীলনী\]**। উৎস *পৰীক্ষা বাকী* বুলি চিহ্নিত প্ৰশ্নবোৰ সেই পৰীক্ষা নোহোৱালৈকে "তথ্য-পৰীক্ষিত" (সত্যাপিত নহয়) হৈ থাকিব।

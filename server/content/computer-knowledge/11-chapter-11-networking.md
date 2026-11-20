# Chapter 11 — Networking / অধ্যায় ১১ — নেটৱৰ্কিং

*Facts checked: 19 November 2026 · Level: Moderate (ADRE Grade III graduate, SSC Tier 2) · Sources in 11.3*\
*তথ্য পৰীক্ষা: ১৯ নৱেম্বৰ ২০২৬*

## 11.1 Revision notes / পুনৰালোচনাৰ টোকা

| Type / প্ৰকাৰ | Area / পৰিসৰ | Example / উদাহৰণ |
| --- | --- | --- |
| PAN | A few metres around a person | Bluetooth earphones |
| LAN | One building or campus | Office or school lab |
| MAN | A city | City cable network |
| WAN | Country or world | The internet |

**Topologies / টপ'লজি:** **bus** (one main cable), **star** (all to a central hub/switch — most common), **ring** (closed loop), **mesh** (every node linked to others), **tree** (hierarchy of stars).

**Devices / ডিভাইচ:** **hub** (sends data to all ports), **switch** (sends only to the right device), **router** (connects different networks, chooses the path), **modem** (modulator–demodulator: digital ↔ analog signal), **NIC** (network card; has a 48-bit **MAC address**), **repeater** (boosts signals), **gateway**.

**Models / মডেল:** **OSI** has **7 layers** (Physical, Data Link, Network, Transport, Session, Presentation, Application). The internet runs on **TCP/IP**.\
**Media:** twisted pair, coaxial cable, **optical fibre** (light signals, fastest), wireless (Wi-Fi, Bluetooth).

## 11.2 Question bank / প্ৰশ্নৰ ভঁৰাল

**Instructions:** Each question has four options; choose the one correct answer. The answer and a short explanation follow each question. All 14 questions are **\[Practice\]** questions.\
**নিৰ্দেশনা:** প্ৰতিটো প্ৰশ্নৰ চাৰিটা বিকল্প আছে; শুদ্ধ উত্তৰটো বাছি উলিওৱা। প্ৰতিটো প্ৰশ্নৰ পিছত উত্তৰ আৰু চমু ব্যাখ্যা দিয়া হৈছে। আটাইকেইটা (১৪টা) প্ৰশ্ন **\[অনুশীলনী\]** প্ৰশ্ন।

**1.** A network covering a single building or campus is a:\
এটা ঘৰ বা চৌহদ সামৰা নেটৱৰ্কক কি বোলে?\
(A) WAN / ৱেন (WAN)\
(B) LAN / লেন (LAN)\
(C) MAN / মেন (MAN)\
(D) PAN / পেন (PAN)\
**Answer / উত্তৰ: (B) LAN / লেন (LAN)**\
Explanation: LAN = Local Area Network. [C1]\
ব্যাখ্যা: LAN = Local Area Network।\
*B7-C11-0001 · Network types · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**2.** The internet is the largest example of a:\
ইণ্টাৰনেট কিহৰ আটাইতকৈ ডাঙৰ উদাহৰণ?\
(A) LAN\
(B) WAN\
(C) PAN\
(D) MAN\
**Answer / উত্তৰ: (B) WAN**\
Explanation: A Wide Area Network spans countries and continents. [C1]\
ব্যাখ্যা: ৱাইড এৰিয়া নেটৱৰ্কে দেশ আৰু মহাদেশ সামৰে।\
*B7-C11-0002 · Network types · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**3.** Connecting a phone to wireless earphones with Bluetooth forms a:\
ব্লুটুথেৰে ফোনক বেতাঁৰ ইয়াৰফোনৰ সৈতে সংযোগ কৰিলে কি নেটৱৰ্ক হয়?\
(A) LAN\
(B) WAN\
(C) MAN\
(D) PAN\
**Answer / উত্তৰ: (D) PAN**\
Explanation: PAN = Personal Area Network, a few metres around a person. [C1]\
ব্যাখ্যা: PAN = Personal Area Network, ব্যক্তিৰ চাৰিওফালে কেইমিটাৰমান।\
*B7-C11-0003 · Network types · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**4.** In which topology are all computers connected to a central device?\
কোন টপ'লজিত সকলো কম্পিউটাৰ এটা কেন্দ্ৰীয় ডিভাইচৰ সৈতে সংযুক্ত?\
(A) Bus / বাছ\
(B) Ring / ৰিং\
(C) Mesh / মেশ্ব\
(D) Star / ষ্টাৰ\
**Answer / উত্তৰ: (D) Star / ষ্টাৰ**\
Explanation: In star topology every node connects to a hub or switch. [C1]\
ব্যাখ্যা: ষ্টাৰ টপ'লজিত প্ৰতিটো ন'ড হাব বা চুইচৰ সৈতে সংযুক্ত।\
*B7-C11-0004 · Topologies · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**5.** In which topology does each device connect to exactly two neighbours, forming a loop?\
কোন টপ'লজিত প্ৰতিটো ডিভাইচ দুটা চুবুৰীয়াৰ সৈতে সংযুক্ত হৈ এটা বৃত্ত গঠন কৰে?\
(A) Ring / ৰিং\
(B) Star / ষ্টাৰ\
(C) Bus / বাছ\
(D) Tree / ট্ৰী\
**Answer / উত্তৰ: (A) Ring / ৰিং**\
Explanation: Data travels around the ring from node to node. [C1]\
ব্যাখ্যা: তথ্য ৰিঙৰ চাৰিওফালে ন'ডৰ পৰা ন'ডলৈ যায়।\
*B7-C11-0005 · Topologies · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**6.** A device that connects different networks and chooses the best path for data is a:\
বেলেগ বেলেগ নেটৱৰ্ক সংযোগ কৰি তথ্যৰ বাবে উত্তম পথ বাছি লোৱা ডিভাইচ কোনটো?\
(A) Hub / হাব\
(B) Repeater / ৰিপিটাৰ\
(C) Router / ৰাউটাৰ\
(D) Keyboard / কীব'ৰ্ড\
**Answer / উত্তৰ: (C) Router / ৰাউটাৰ**\
Explanation: Routers direct data between networks, such as a home network and the internet. [C1]\
ব্যাখ্যা: ৰাউটাৰে ঘৰৰ নেটৱৰ্ক আৰু ইণ্টাৰনেটৰ দৰে নেটৱৰ্কৰ মাজত তথ্য পঠায়।\
*B7-C11-0006 · Devices · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**7.** MODEM stands for:\
MODEM-ৰ সম্পূৰ্ণ ৰূপ কি?\
(A) Mode Emulator\
(B) Modern Device Manager\
(C) Monitor–Device Modulator\
(D) Modulator–Demodulator\
**Answer / উত্তৰ: (D) Modulator–Demodulator**\
Explanation: A modem converts digital signals to analog and back. [C1]\
ব্যাখ্যা: মডেমে ডিজিটেল সংকেতক এনালগলৈ আৰু ওলোটাকৈ ৰূপান্তৰ কৰে।\
*B7-C11-0007 · Devices · Easy · ADRE-IV-P1, ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**8.** A switch is better than a hub because a switch:\
হাবতকৈ চুইচ কিয় ভাল?\
(A) Sends data to every port / সকলো প'ৰ্টলৈ তথ্য পঠায়\
(B) Works without electricity / বিদ্যুৎ নোহোৱাকৈ চলে\
(C) Sends data only to the intended device / কেৱল লক্ষিত ডিভাইচলৈ তথ্য পঠায়\
(D) Connects only two computers / কেৱল দুটা কম্পিউটাৰ সংযোগ কৰে\
**Answer / উত্তৰ: (C) Sends data only to the intended device / কেৱল লক্ষিত ডিভাইচলৈ তথ্য পঠায়**\
Explanation: A hub broadcasts to all ports, causing extra traffic. [C1]\
ব্যাখ্যা: হাবে সকলো প'ৰ্টলৈ পঠায়, যাৰ ফলত অতিৰিক্ত ট্ৰেফিক হয়।\
*B7-C11-0008 · Devices · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**9.** How many layers does the OSI model have?\
OSI মডেলত কেইটা স্তৰ আছে?\
(A) 4 / ৪\
(B) 5 / ৫\
(C) 7 / ৭\
(D) 9 / ৯\
**Answer / উত্তৰ: (C) 7 / ৭**\
Explanation: Physical, Data Link, Network, Transport, Session, Presentation, Application. [C1]\
ব্যাখ্যা: Physical, Data Link, Network, Transport, Session, Presentation, Application।\
*B7-C11-0009 · OSI model · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**10.** The lowest layer of the OSI model is the:\
OSI মডেলৰ আটাইতকৈ তলৰ স্তৰ কোনটো?\
(A) Physical layer / ফিজিকেল স্তৰ\
(B) Application layer / এপ্লিকেচন স্তৰ\
(C) Network layer / নেটৱৰ্ক স্তৰ\
(D) Session layer / চেছন স্তৰ\
**Answer / উত্তৰ: (A) Physical layer / ফিজিকেল স্তৰ**\
Explanation: Layer 1 (Physical) deals with cables and signals; layer 7 is Application. [C1]\
ব্যাখ্যা: স্তৰ ১ (Physical)-এ কেবল আৰু সংকেত চম্ভালে; স্তৰ ৭ Application।\
*B7-C11-0010 · OSI model · Hard · ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**11.** A MAC address is:\
MAC ঠিকনা কি?\
(A) A 48-bit hardware address of a network card / নেটৱৰ্ক কাৰ্ডৰ ৪৮-বিটৰ হাৰ্ডৱেৰ ঠিকনা\
(B) A website address / ৱেবছাইটৰ ঠিকনা\
(C) An email address / ইমেইল ঠিকনা\
(D) The address of an Apple computer only / কেৱল এপল কম্পিউটাৰৰ ঠিকনা\
**Answer / উত্তৰ: (A) A 48-bit hardware address of a network card / নেটৱৰ্ক কাৰ্ডৰ ৪৮-বিটৰ হাৰ্ডৱেৰ ঠিকনা**\
Explanation: MAC = Media Access Control; it is fixed in the NIC. [C1]\
ব্যাখ্যা: MAC = Media Access Control; ই NIC-ত নিৰ্দিষ্ট থাকে।\
*B7-C11-0011 · Addresses · Hard · ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**12.** The fastest transmission medium among these is:\
তলৰ কোনটো আটাইতকৈ দ্ৰুত সংযোগ মাধ্যম?\
(A) Optical fibre / অপ্টিকেল ফাইবাৰ\
(B) Twisted-pair cable / টুইষ্টেড-পেয়াৰ কেবল\
(C) Coaxial cable / কোএক্সিয়েল কেবল\
(D) Telephone wire / টেলিফোনৰ তাঁৰ\
**Answer / উত্তৰ: (A) Optical fibre / অপ্টিকেল ফাইবাৰ**\
Explanation: Optical fibre carries data as light pulses. [C1]\
ব্যাখ্যা: অপ্টিকেল ফাইবাৰে পোহৰৰ স্পন্দন হিচাপে তথ্য কঢ়িয়ায়।\
*B7-C11-0012 · Media · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**13.** The basic set of protocols on which the internet works is:\
ইণ্টাৰনেট কোন মূল প্ৰ'ট'কল গোটৰ ওপৰত চলে?\
(A) OSI only / কেৱল OSI\
(B) HTML/CSS\
(C) TCP/IP\
(D) USB\
**Answer / উত্তৰ: (C) TCP/IP**\
Explanation: TCP/IP = Transmission Control Protocol / Internet Protocol. [C1]\
ব্যাখ্যা: TCP/IP = Transmission Control Protocol / Internet Protocol।\
*B7-C11-0013 · Protocols · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

**14.** A device that boosts a weak signal so it can travel further is a:\
দুৰ্বল সংকেতক শক্তিশালী কৰি আগলৈ পঠোৱা ডিভাইচ কোনটো?\
(A) Router / ৰাউটাৰ\
(B) Modem / মডেম\
(C) Bridge / ব্ৰীজ\
(D) Repeater / ৰিপিটাৰ\
**Answer / উত্তৰ: (D) Repeater / ৰিপিটাৰ**\
Explanation: Repeaters regenerate signals over long cables. [C1]\
ব্যাখ্যা: দীঘল কেবলত ৰিপিটাৰে সংকেত পুনৰ শক্তিশালী কৰে।\
*B7-C11-0014 · Devices · Moderate · ADRE-IV-P2, ADRE-III-P4, SSC-CGL-T2, SSC-CHSL-T2*

## 11.3 References and verification status / উৎস আৰু সত্যাপন

| Code | Source | Status |
| --- | --- | --- |
| C1 | NCERT / NIOS computer science and IT textbooks; SEBA Computer Science (Class IX–X) | **Book check pending** |
| C2 | Vendor documentation (Microsoft Support for Office and Windows) and standards bodies (IETF, W3C) | **Page check pending** |
| C3 | Government sources: MeitY, CERT-In, NPCI, UIDAI, Digital India and Sewa Setu portals | Checked online 19 November 2026 where marked |

All 14 questions are **\[Practice\]**. Questions whose source is marked *check pending* stay at status Fact-checked (not Verified) until that check is done.\
আটাইকেইটা প্ৰশ্ন **\[অনুশীলনী\]**। উৎস *পৰীক্ষা বাকী* বুলি চিহ্নিত প্ৰশ্নবোৰ সেই পৰীক্ষা নোহোৱালৈকে "তথ্য-পৰীক্ষিত" (সত্যাপিত নহয়) হৈ থাকিব।

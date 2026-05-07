# CSVtoTally | Premium Excel to Tally XML Converter

[![Live App](https://img.shields.io/badge/Live%20App-Online-success?style=for-the-badge&logo=github)](https://asr-ajay.github.io/csvtotally/)
[![License: CC BY-NC-ND 4.0](https://img.shields.io/badge/License-CC%20BY--NC--ND%204.0-lightgrey.svg?style=for-the-badge)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

**CSVtoTally** is a state-of-the-art, 100% private Progressive Web App (PWA) designed to bridge the gap between Excel/CSV data and TallyPrime. Built with a focus on privacy, speed, and aesthetics, it allows accounting professionals to convert complex financial data into Tally-ready XML formats without ever uploading data to a server.

---

## 🚀 Key Features

### 💎 Premium Design & UX
- **Glassmorphism Interface**: A modern, sleek, and high-contrast design.
- **Fully Mobile Responsive**: Optimized layouts for Desktop, Tablet, and Mobile devices.
- **Native Experience**: Installable as a Desktop app via PWA support.

### 🛡️ Privacy & Security
- **100% Client-Side**: All data processing happens locally in your browser. No data is stored or transmitted.
- **Secure Local Storage**: Your uploaded masters are persisted only in your local session for the duration of your work.

### 📊 Advanced Conversion Modes
- **Accounting Vouchers**: Supports Single Ledger, Combined, and Multiple Ledger formats.
- **Inventory Vouchers**: Advanced support for Simple and Multiple Stock Item allocations.
- **Master Creation**: Batch create Ledgers and Stock Items with parent groups and opening balances.

### 🔍 Smart Validation System
- **Master Verification**: Upload your Tally HTML exports (Ledgers, Items, Units, Vouchers) to verify CSV data before conversion.
- **Strict Content Detection**: Built-in logic to prevent incorrect file uploads (e.g., blocking Stock Items in the Ledger slot).
- **Real-time Error Logging**: Detailed logs for missing masters or formatting errors.

---

## 🛠️ How it Works

1.  **Configure**: Select your conversion mode and default voucher type.
2.  **Download Template**: Click on the "Templates" button to download the structured CSV for your selected mode.
3.  **Import Masters (Optional)**: Upload your Tally HTML files to enable real-time validation against your actual Tally data.
4.  **Convert**: Drag and drop your filled CSV. The app will preview the data and highlight any verification errors.
5.  **Download**: Once satisfied, click "Convert to XML" and download the generated file.
6.  **Import to Tally**: Open TallyPrime > Alt+O (Import) > Transactions > Select the XML file.

---

## 📥 Supported Tally Exports for Validation
To enable the validation feature, export the following from TallyPrime:
- **Ledgers**: Chart of Accounts > Ledgers > Export (Ctrl+E) > File Format: HTML.
- **Stock Items**: Chart of Accounts > Stock Items > Export (Ctrl+E) > File Format: HTML.
- **Voucher Types**: Chart of Accounts > Voucher Types > Export (Ctrl+E) > File Format: HTML.

---

## 💻 Tech Stack
- **Core**: Vanilla JavaScript (ES6+), HTML5, CSS3.
- **Parsing**: [PapaParse](https://www.papaparse.com/) for robust CSV processing.
- **PWA**: Service Workers & Web Manifest for offline and standalone capabilities.
- **Typography**: Inter & Outfit (Google Fonts).

---

## ⚖️ Legal & License

### Copyright
**Copyright © 2024 asr-ajay. All rights reserved.**
No part of this project may be copied, modified, or redistributed without explicit written permission from the author.

### License
This work is licensed under a **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License (CC BY-NC-ND 4.0)**.
- **Attribution**: You must give appropriate credit.
- **Non-Commercial**: You may not use the material for commercial purposes.
- **No-Derivatives**: If you remix, transform, or build upon the material, you may not distribute the modified material.

For full legal terms, please refer to the [LICENSE](LICENSE) file.

---
*Developed with ❤️ for the Accounting Community.*

// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

// App.js
// App.js
// App.js
// App.js
import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./App.css";

function App() {
  const billRef = useRef();

  const generateBillNo = () => {
    const randomPart = Math.floor(Math.random() * 900 + 100);
    return `${randomPart}`;
  };

  const [formData, setFormData] = useState({
    billNo: "",
    date: new Date().toISOString().split('T')[0],
    name: "",
    village: "",
    rows: [{ date: new Date().toISOString().split('T')[0], start: "09:00", end: "17:00", hours: 8, rate: 150, total: 1200 }],
    totalAmount: 1200,
    amountInWords: ""
  });

  useEffect(() => {
    setFormData(prev => ({ 
      ...prev, 
      billNo: generateBillNo(),
      amountInWords: numberToMarathiWords(1200)
    }));
  }, []);

const numberToMarathiWords = (num) => {
  if (num === 0) return "शून्य रुपये फक्त";
  
  // Basic number words
  const units = ["", "एक", "दोन", "तीन", "चार", "पाच", "सहा", "सात", "आठ", "नऊ"];
  const teens = ["दहा", "अकरा", "बारा", "तेरा", "चौदा", "पंधरा", "सोळा", "सतरा", "अठरा", "एकोणीस"];
  const tens = ["", "वीस", "तीस", "चाळीस", "पन्नास", "साठ", "सत्तर", "ऐंशी", "नव्वद"];
  
  // Special cases for numbers ending with 1, 5, or 9 in the tens place
  const specialCases = {
    21: "एकवीस",
    31: "एकतीस",
    41: "एक्केचाळीस",
    51: "एक्कावन्न",
    61: "एकसष्ठ",
    71: "एक्काहत्तर",
    81: "एक्क्याऐंशी",
    91: "एक्क्याण्णव",
    25: "पंचवीस",
    35: "पस्तीस",
    45: "पंचेचाळीस",
    55: "पंचावन्न",
    65: "पासष्ठ",
    75: "पंच्याहत्तर",
    85: "पंच्याऐंशी",
    95: "पंच्याण्णव",
    29: "एकोणतीस",
    39: "एकोणचाळीस",
    49: "एकोणपन्नास",
    59: "एकोणसाठ",
    69: "एकोणसत्तर",
    79: "एकोणऐंशी",
    89: "एकोणनव्वद",
    99: "नव्याण्णव"
  };

  const twoDigitsToWords = (n) => {
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (specialCases[n]) return specialCases[n];
    
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    if (unit === 0) return tens[ten - 1];
    
    // Handle regular two-digit numbers
    if (ten === 2) return units[unit] + "वीस";
    if (ten === 3) return units[unit] + "्तीस";
    if (ten === 4) return units[unit] + "्वेचाळीस";
    if (ten === 5) return units[unit] + "्पन्नास";
    if (ten === 6) return units[unit] + "्साठ";
    if (ten === 7) return units[unit] + "्सत्तर";
    if (ten === 8) return units[unit] + "्ऐंशी";
    return units[unit] + "्नव्वद";
  };

  const threeDigitsToWords = (n) => {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    let words = "";
    
    if (hundred > 0) {
      words += (hundred === 1 ? "एकशे" : units[hundred] + "शे");
      if (remainder > 0) words += " ";
    }
    
    if (remainder > 0) {
      words += twoDigitsToWords(remainder);
    }
    
    return words;
  };

  let words = "";
  let crore = Math.floor(num / 10000000);
  let remainder = num % 10000000;
  
  if (crore > 0) {
    words += threeDigitsToWords(crore) + " कोटी";
    if (remainder > 0) words += " ";
  }
  
  let lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  
  if (lakh > 0) {
    words += threeDigitsToWords(lakh) + " लाख";
    if (remainder > 0) words += " ";
  }
  
  let thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;
  
  if (thousand > 0) {
    words += threeDigitsToWords(thousand) + " हजार";
    if (remainder > 0) words += " ";
  }
  
  if (remainder > 0) {
    words += threeDigitsToWords(remainder);
  }
  
  return words.trim() + " रुपये फक्त";
};

  const handleRowChange = (index, field, value) => {
    const updatedRows = [...formData.rows];
    updatedRows[index][field] = value;
    
    // Calculate hours if both start and end times are provided
    if (field === "start" || field === "end") {
      if (updatedRows[index].start && updatedRows[index].end) {
        const startTime = new Date(`2000-01-01T${updatedRows[index].start}`);
        const endTime = new Date(`2000-01-01T${updatedRows[index].end}`);
        const diffMs = endTime - startTime;
        const diffHours = diffMs / (1000 * 60 * 60);
        updatedRows[index].hours = diffHours > 0 ? diffHours : 0;
      }
    }

    const hours = parseFloat(updatedRows[index].hours) || 0;
    const rate = parseFloat(updatedRows[index].rate) || 0;
    updatedRows[index].total = hours * rate;

    const newTotal = updatedRows.reduce((sum, row) => sum + row.total, 0);

    setFormData({
      ...formData,
      rows: updatedRows,
      totalAmount: newTotal,
      amountInWords: numberToMarathiWords(Math.round(newTotal))
    });
  };

  const addRow = () => {
    setFormData({
      ...formData,
      rows: [...formData.rows, { 
        date: formData.date || new Date().toISOString().split('T')[0], 
        start: "09:00", 
        end: "17:00", 
        hours: 8, 
        rate: formData.rows[0]?.rate || 150, 
        total: 8 * (formData.rows[0]?.rate || 150) 
      }]
    });
  };

  const deleteRow = (index) => {
    if (formData.rows.length <= 1) return;
    
    const updatedRows = formData.rows.filter((_, i) => i !== index);
    const newTotal = updatedRows.reduce((sum, row) => sum + row.total, 0);

    setFormData({
      ...formData,
      rows: updatedRows,
      totalAmount: newTotal,
      amountInWords: numberToMarathiWords(Math.round(newTotal))
    });
  };

const downloadPDF = async () => {
  // Create a temporary div for PDF content
  const pdfContent = document.createElement("div");
  pdfContent.style.width = "210mm";
  pdfContent.style.padding = "15mm";
  pdfContent.style.fontFamily = "'Noto Sans Devanagari', sans-serif";
  pdfContent.style.fontSize = "14px";
  pdfContent.style.border = "2px solid #333";
  pdfContent.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";
  pdfContent.style.background = "#fff";

  // Bill header with all requested elements
  const header = `
    <div style="position: relative; margin-bottom: 20px;">
      <!-- Top line with three sections -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <div style="width: 30%; text-align: left;">
          <p style="font-size: 16px; font-weight: bold; margin: 0; color: #4a4a4a;">!! श्री गणेशाय नमः !!</p>
        </div>
        <div style="width: 30%; text-align: center;">
          <p style="font-size: 16px; font-weight: bold; margin: 0; color: #4a4a4a;">!! श्री केदारेश्वर प्रसन्न !!</p>
        </div>
        <div style="width: 30%; text-align: right;">
          <p style="font-size: 16px; font-weight: bold; margin: 0; color: #4a4a4a;">कॅश / क्रेडीट मेमो</p>
        </div>
      </div>
      
      <!-- Company name centered below श्री केदारेश्वर प्रसन्न -->
      <div style="text-align: center; margin: 10px 0;">
        <h1 style="color: #1a5276; font-size: 26px; margin: 0; text-shadow: 1px 1px 1px rgba(0,0,0,0.1);">आर्या अर्थमुव्हर्स</h1>
      </div>
      
      <!-- Address below company name -->
      <div style="text-align: center; margin: 5px 0;">
        <p style="margin: 2px 0; color: #555;">मु. पो. म्हैसगांव, ता. राहुरी, जि. अ. नगर</p>
      </div>
      
      <!-- Proprietor info below address -->
      <div style="text-align: center; margin: 5px 0 15px 0;">
        <p style="margin: 2px 0; color: #555;">प्रोप्रा : अनिकेत बेलकर मो. 8208385366</p>
      </div>
      
      <div style="height: 2px; background: linear-gradient(to right, #1a5276, #7fb3d5, #1a5276); margin: 10px 0;"></div>
      
      <!-- Services line -->
      <div style="text-align: center; margin: 10px 0 5px 0;">
        <p style="font-style: italic; color: #555;">आमच्याकडे जे.सी.बी व ट्रक्टर योग्य दरात भाड्याने मिळेल.</p>
      </div>
      
      <div style="height: 2px; background: linear-gradient(to right, #1a5276, #7fb3d5, #1a5276); margin: 10px 0;"></div>
    </div>
  `;

  // Bill meta information
  const metaInfo = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8f9fa; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
      <div>
        <p style="margin: 5px 0;"><strong style="color: #1a5276;">बिल नंबर :</strong> ${formData.billNo}</p>
        <p style="margin: 5px 0;"><strong style="color: #1a5276;">नांव :</strong> ${formData.name}</p>
      </div>
      <div style="text-align: right;">
        <p style="margin: 5px 0;"><strong style="color: #1a5276;">दिनांक :</strong> ${new Date(formData.date).toLocaleDateString('en-IN')}</p>
        <p style="margin: 5px 0;"><strong style="color: #1a5276;">रा :</strong> ${formData.village}</p>
      </div>
    </div>
  `;

  // Calculate total amount from rows for the summary row
  const calculatedTotal = formData.rows.reduce((sum, row) => sum + (row.total || 0), 0);

  // Bill items table
  let tableRows = '';
  formData.rows.forEach((row, index) => {
    tableRows += `
      <tr>
        <td style="text-align: center; border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
        <td style="text-align: center; border: 1px solid #ddd; padding: 8px;">${row.date ? new Date(row.date).toLocaleDateString('en-IN') : ''}</td>
        <td style="text-align: center; border: 1px solid #ddd; padding: 8px;">${row.start || ''}</td>
        <td style="text-align: center; border: 1px solid #ddd; padding: 8px;">${row.end || ''}</td>
        <td style="text-align: center; border: 1px solid #ddd; padding: 8px;">${row.hours || 0}</td>
        <td style="text-align: center; border: 1px solid #ddd; padding: 8px;">₹${row.rate ? row.rate.toFixed(2) : '0.00'}</td>
        <td style="text-align: center; border: 1px solid #ddd; padding: 8px;">₹${row.total ? row.total.toFixed(2) : '0.00'}</td>
      </tr>
    `;
  });

  // Add summary row
  tableRows += `
    <tr style="background-color: #f8f9fa; font-weight: bold;">
      <td colspan="6" style="text-align: right; border: 1px solid #ddd; padding: 8px;">एकूण :</td>
      <td style="text-align: center; border: 1px solid #ddd; padding: 8px;">₹${calculatedTotal.toFixed(2)}</td>
    </tr>
  `;

  const table = `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd;">
      <thead>
        <tr style="background-color: #1a5276; color: white;">
          <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">क्र.</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">दिनांक</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">पासुन</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">पर्यंत</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">एकुण तास</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">दर प्रति तास</th>
          <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">एकूण रक्कम रुपये</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  `;

  // Bill summary
  const summary = `
    <div style="margin-top: 30px;">
      <div style="margin-bottom: 10px; background: #f8f9fa; padding: 10px; border-radius: 5px; border: 1px solid #ddd;">
        <p style="margin: 5px 0;"><strong style="color: #1a5276;">अक्षरी रुपये :</strong> ${formData.amountInWords}</p>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 40px;">
        <div style="text-align: center; width: 200px;">
          <p style="border-top: 1px solid #333; padding-top: 5px; margin-top: 30px; font-weight: bold;">ग्राहक सही</p>
        </div>
        <div style="text-align: center; width: 200px;">
          <p style="border-top: 1px solid #333; padding-top: 5px; margin-top: 30px; font-weight: bold;">ऑपरेटरची सही</p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #777;">
        <p>धन्यवाद! पुन्हा भेट द्या</p>
      </div>
    </div>
  `;

  // Combine all sections
  pdfContent.innerHTML = header + metaInfo + table + summary;

  // Add to document temporarily
  document.body.appendChild(pdfContent);

  try {
    // Generate PDF
    const canvas = await html2canvas(pdfContent, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    
    // Remove temporary element
    document.body.removeChild(pdfContent);
    
    // Save PDF
    pdf.save(`आर्या_अर्थमुव्हर्स_बिल_${formData.billNo}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    document.body.removeChild(pdfContent);
    alert("PDF generation failed. Please try again.");
  }
};

  return (
    <div className="App">
      <header className="app-header">
        <div className="logo-container">
          <h1>आर्या अर्थमूव्हर्स</h1>
          <p className="tagline">विश्वासाचे आणि व्यावसायिकतेचे प्रतीक</p>
        </div>
      </header>

      <div className="form-container">
        <div className="bill-meta">
          <div className="input-group">
            <label>बिल नंबर</label>
            <input 
              value={formData.billNo} 
              readOnly 
              className="styled-input"
            />
          </div>
          <div className="input-group">
            <label>तारीख</label>
            <input 
              type="date" 
              value={formData.date} 
              onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
              className="styled-input"
            />
          </div>
          <div className="input-group">
            <label>ग्राहकाचे नाव</label>
            <input 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              className="styled-input"
              placeholder="नाव प्रविष्ट करा"
            />
          </div>
          <div className="input-group">
            <label>गाव/शहर</label>
            <input 
              value={formData.village} 
              onChange={(e) => setFormData({ ...formData, village: e.target.value })} 
              className="styled-input"
              placeholder="गाव/शहर प्रविष्ट करा"
            />
          </div>
        </div>

        <div ref={billRef} className="bill-area">
          <div className="bill-header">
            <h2>कामाचे तपशील</h2>
          </div>
          
          <div className="table-responsive">
            <table className="bill-table">
              <thead>
                <tr>
                  <th>तारीख</th>
                  <th>पासून</th>
                  <th>पर्यंत</th>
                  <th>तास</th>
                  <th>दर (₹/तास)</th>
                  <th>एकूण (₹)</th>
                  <th>क्रिया</th>
                </tr>
              </thead>
              <tbody>
                {formData.rows.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <input 
                        type="date" 
                        value={row.date} 
                        onChange={(e) => handleRowChange(index, "date", e.target.value)} 
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="time" 
                        value={row.start} 
                        onChange={(e) => handleRowChange(index, "start", e.target.value)} 
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="time" 
                        value={row.end} 
                        onChange={(e) => handleRowChange(index, "end", e.target.value)} 
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={row.hours} 
                        onChange={(e) => handleRowChange(index, "hours", e.target.value)} 
                        className="table-input hours-input"
                        min="0"
                        step="0.5"
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        value={row.rate} 
                        onChange={(e) => handleRowChange(index, "rate", e.target.value)} 
                        className="table-input rate-input"
                        min="0"
                      />
                    </td>
                    <td className="total-cell">
                      {row.total.toFixed(2)}
                    </td>
                    <td>
                      <button 
                        className="delete-btn" 
                        onClick={() => deleteRow(index)}
                        disabled={formData.rows.length <= 1}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="action-buttons">
            <button className="add-row-btn" onClick={addRow}>
              <i className="fas fa-plus-circle"></i> नवीन पंक्ती जोडा
            </button>
          </div>

          <div className="bill-summary">
            <div className="total-amount">
              <span className="total-label">एकूण रक्कम:</span>
              <span className="total-value">₹{formData.totalAmount.toFixed(2)}</span>
            </div>
            <div className="amount-in-words">
              <span className="words-label">रक्कम अक्षरी:</span>
              <span className="words-value">{formData.amountInWords}</span>
            </div>
          </div>
        </div>

        <div className="download-section">
          <button className="download-btn" onClick={downloadPDF}>
            <i className="fas fa-file-pdf"></i> बिल डाउनलोड करा
          </button>
          <p className="note">* बिल PDF स्वरूपात डाउनलोड होईल</p>
        </div>
      </div>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} आर्या अर्थमूव्हर्स. सर्व हक्क राखीव.</p>
        <p className="contact">संपर्क: +91 8208385366 </p>
      </footer>
    </div>
  );
}

export default App;
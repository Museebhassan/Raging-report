// --- Core Logic for Ragging Report Site (ragging_report_logic.js) ---

document.addEventListener('DOMContentLoaded', function() {
    
    // Setup logic based on the page loaded
    if (document.getElementById('reportForm')) {
        setupReportForm();
    }
    
    if (document.getElementById('trackingForm')) {
        setupTracking();
    }
    
    // Note: loadReports() and updateReportStatus() are made global below 
    // to be accessible by admin.htm's inline script.
});

// --- Local Storage Functions (Simulated Database) ---

function getReports() {
    const reportsJSON = localStorage.getItem('raggingReports');
    return reportsJSON ? JSON.parse(reportsJSON) : [];
}
// Made global for access by admin.htm
window.getReports = getReports; 


function saveReport(newReport) {
    const reports = getReports();
    reports.push(newReport);
    localStorage.setItem('raggingReports', JSON.stringify(reports));
}

// Global function to update report status (used by admin.htm)
window.updateReportStatus = function(reportId, newStatus) {
    const reports = getReports();
    // Find the report to update
    const reportIndex = reports.findIndex(r => r.id === reportId);
    
    if (reportIndex > -1) {
        reports[reportIndex].status = newStatus;
        localStorage.setItem('raggingReports', JSON.stringify(reports)); 
        
        // If the admin dashboard's loadReports function exists, call it to refresh the view
        if (window.loadReports) {
            window.loadReports();
        }
        alert(`Status for Report ${reportId} updated to: ${newStatus}`);
    } else {
        console.error(`Error: Report ${reportId} not found for status update.`);
    }
};


// --- Report Submission Logic (For report.html) ---

function setupReportForm() {
    const form = document.getElementById('reportForm');
    const messageElement = document.getElementById('message');

    if (!form || !messageElement) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const formData = new FormData(form);
        
        // Generate a unique ID (e.g., RPT-123456789)
        const uniqueID = 'RPT-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        
        const reportData = {
            id: uniqueID, 
            status: 'Pending Review', // Initial status
            timestamp: new Date().toLocaleString(),
            incidentType: formData.get('incidentType'),
            incidentLocation: formData.get('incidentLocation'),
            incidentDate: formData.get('incidentDate'),
            perpetratorDetails: formData.get('perpetratorDetails'),
            victimDetails: formData.get('victimDetails'),
            description: formData.get('description'),
        };

        // 1. Save to Local Storage
        saveReport(reportData);

        // 2. Display Success Message and reset form
        messageElement.className = 'success';
        messageElement.innerHTML = `✅ **Report submitted successfully!**<br>Your tracking ID is: <strong>${reportData.id}</strong>.`;
        messageElement.style.display = 'block';
        
        form.reset();
        
        // Hide message after a few seconds
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 8000);
    });
}


// --- Report Tracking Logic (For track.html) ---

function setupTracking() {
    const form = document.getElementById('trackingForm');
    const resultDiv = document.getElementById('resultDiv');
    
    if (!form || !resultDiv) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const trackingId = document.getElementById('trackId').value.trim();
        const reports = getReports();
        // Use find() to locate the report by its unique ID
        const report = reports.find(r => r.id === trackingId);
        
        resultDiv.innerHTML = '';
        
        if (report) {
            // STUDENT VIEW: Show updated status
            // Create a CSS-friendly class name from the status (e.g., "Pending Review" -> "pending-review")
            const statusClass = report.status.toLowerCase().replace(/[ (]/g, '-').replace(')', '');
            
            resultDiv.innerHTML = `
                <div class="tracking-result-card">
                    <h3>Report ID: ${report.id}</h3>
                    <p><strong>Submission Time:</strong> ${report.timestamp}</p>
                    <p><strong>Incident Type:</strong> ${report.incidentType}</p>
                    <p><strong>Location:</strong> ${report.incidentLocation}</p>
                    <div class="status-container ${statusClass}">
                        <i class="fas fa-bullhorn fa-2x"></i>
                        <div style="margin-left: 20px;">
                            <span class="label">Current Status:</span>
                            <span class="status-badge ${statusClass}">${report.status}</span>
                            <p class="status-message">${getStatusMessage(report.status)}</p>
                        </div>
                    </div>
                </div>
            `;
            resultDiv.style.display = 'block';

        } else {
            // Error message if ID is not found
            resultDiv.innerHTML = '<p class="info error">Report ID not found. Please check the number.</p>';
            resultDiv.style.display = 'block';
        }
    });
}

function getStatusMessage(status) {
    switch(status) {
        case 'Pending Review':
            return 'Your report has been received and is waiting for initial assessment. You will be notified when investigation begins.';
        case 'Under Investigation':
            return 'The matter is currently being investigated by the disciplinary committee. We will update the status once a conclusion is reached.';
        case 'Closed (Resolved)':
            return 'The issue has been resolved, and necessary actions have been taken. Thank you for your cooperation.';
        case 'Closed (Rejected)':
            return 'The investigation concluded the complaint was invalid or unfounded. If you believe this is an error, please contact the committee.';
        default:
            return 'Status unknown. Please contact administration.';
    }
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, sendSignInLinkToEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.sendOTP = function () {
  const email = document.getElementById("email").value.trim();
  const role = document.getElementById("role").value;

  if (!email) {
    error.textContent = "Enter email address";
    error.style.display = "block";
    return;
  }

  const actionCodeSettings = {
    url: role === "student" ? "stuhome.html" : "admin.html",
    handleCodeInApp: true
  };

  sendSignInLinkToEmail(auth, email, actionCodeSettings)
    .then(() => {
      localStorage.setItem("emailForSignIn", email);
      alert("OTP link sent to email");
    })
    .catch(err => {
      error.textContent = err.message;
      error.style.display = "block";
    });
};
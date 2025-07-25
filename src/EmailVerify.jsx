"use client"

import { useState } from "react"
import { Check, X, AlertTriangle, Mail, Shield, Globe, Server, Sparkles, Loader2 } from "lucide-react"
import "./EmailVerify.css"

const EmailVerificationTool = () => {
  const [email, setEmail] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const verifyEmail = async () => {
    if (!email.trim()) return

    setIsVerifying(true)
    setResults(null)
    setError(null)

    try {
      const response = await fetch("https://mail.leadcourt.cloud/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error("Verification error:", err)
      setError("Failed to verify email. Please check your connection and try again.")
    }

    setIsVerifying(false)
  }

  const getConfidenceColor = (score) => {
    if (score >= 80) return "confidence-high"
    if (score >= 60) return "confidence-medium"
    if (score >= 40) return "confidence-low"
    return "confidence-critical"
  }

  const getStateBadgeStyle = (state) => {
    const normalizedState = state?.toLowerCase()
    if (normalizedState?.includes("deliverable") || normalizedState === "valid") {
      return "badge-valid"
    }
    if (normalizedState?.includes("catch-all") || normalizedState?.includes("unverified")) {
      return "badge-warning"
    }
    if (normalizedState?.includes("invalid") || normalizedState?.includes("undeliverable")) {
      return "badge-invalid"
    }
    return "badge-neutral"
  }

  if (results) {
    return (
      <div className="email-verify-container">
        <div className="email-verify-content">
          {/* Back Button */}
          <button
            onClick={() => {
              setResults(null)
              setError(null)
              setEmail("")
            }}
            className="back-button"
          >
            ← Back to verification
          </button>

          {/* Results Card */}
          <div className="results-card">
            {/* Header */}
            <div className="results-header">
              <div className="header-left">
                <h2 className="results-title">Verification Results</h2>
                <p className="email-display">{results.email}</p>
              </div>
              <div className="header-right">
                <div className={`confidence-score ${getConfidenceColor(results.confidenceScore)}`}>
                  {results.confidenceScore}
                </div>
                <p className="confidence-label">Confidence Score</p>
              </div>
            </div>

            {/* Status */}
            <div className="status-section">
              <div className="status-item">
                <span className="status-label">Status:</span>
                <span className={`status-badge ${getStateBadgeStyle(results.state)}`}>
                  {results.state}
                </span>
              </div>
              <div className="status-divider"></div>
              <div className="reason-section">
                <span className="reason-label">Reason:</span>
                <span className="reason-text">{results.reason}</span>
              </div>
            </div>

            {/* Warning */}
            {results.warning && (
              <div className="warning-panel">
                <AlertTriangle className="warning-icon" />
                <div className="warning-content">
                  <p className="warning-title">Notice</p>
                  <p className="warning-text">{results.warning}</p>
                </div>
              </div>
            )}

            {/* Verification Checks */}
            <div className="checks-section">
              <h3 className="checks-title">
                <Sparkles className="checks-icon" />
                Verification Checks
              </h3>
              <div className="checks-grid">
                {[
                  { key: "emailSyntax", label: "Email Syntax", icon: Mail },
                  { key: "domainValidation", label: "Domain Validation", icon: Globe },
                  { key: "mxRecord", label: "MX Record", icon: Server },
                  { key: "smtpVerification", label: "SMTP Verification", icon: Shield },
                ].map(({ key, label, icon: Icon }) => {
                  const isChecked = results.checks && results.checks[key]
                  return (
                    <div key={key} className="check-item">
                      <div className={`check-status ${isChecked ? 'check-valid' : 'check-invalid'}`}>
                        {isChecked ? (
                          <Check className="check-icon" />
                        ) : (
                          <X className="check-icon" />
                        )}
                      </div>
                      <div className="check-info">
                        <Icon className="check-type-icon" />
                        <span className="check-label">{label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Email Metadata */}
            {results.metadata && (
              <div className="metadata-section">
                <h3 className="metadata-title">Email Metadata</h3>
                <div className="metadata-grid">
                  {[
                    { label: "Domain", value: results.metadata.domain },
                    { label: "MX Record", value: results.metadata.mxRecord },
                    { label: "Disposable", value: results.metadata.disposable },
                    { label: "Role-based", value: results.metadata.roleBased },
                    { label: "Catch-all", value: results.metadata.catchAll },
                  ]
                    .filter(({ value }) => value !== undefined)
                    .map(({ label, value }) => (
                      <div key={label} className="metadata-item">
                        <p className="metadata-label">{label}:</p>
                        <p className={`metadata-value ${
                          value === "Yes" || value === "Valid" ? "metadata-positive" : "metadata-neutral"
                        }`}>
                          {value}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="email-verify-container">
      <div className="email-verify-form">
        {/* Header */}
        <div className="form-header">
          <div className="logo-section">
            <Sparkles className="logo-icon" />
          </div>
          <h1 className="form-title">EmailVerify</h1>
          <p className="form-description">
            Advanced real-time email verification with intelligent catch-all detection and comprehensive analysis
          </p>
        </div>

        {/* Input Card */}
        <div className="input-card">
          {/* Email Input */}
          <div className="input-section">
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address to verify..."
                className="email-input"
                onKeyPress={(e) => e.key === "Enter" && !isVerifying && verifyEmail()}
              />
            </div>
          </div>

          {/* Verify Button */}
          <button
            onClick={verifyEmail}
            disabled={isVerifying || !email.trim()}
            className="verify-button"
          >
            {isVerifying ? (
              <>
                <Loader2 className="button-icon button-icon-spinning" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="button-icon" />
                Verify Email
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="error-panel">
              <div className="error-content">
                <AlertTriangle className="error-icon" />
                <div className="error-text-content">
                  <p className="error-title">Verification Error</p>
                  <p className="error-message">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Powered By Footer */}
        <div className="powered-by">
          <p className="powered-by-text">
            Powered by <a href="https://www.leadcourt.com" className="powered-by-link" target="_blank" rel="noopener noreferrer">LeadCourt</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationTool

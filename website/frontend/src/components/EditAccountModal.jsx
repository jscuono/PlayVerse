import { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff } from "lucide-react";

import "./AccountModal.css";

function EditAccountModal({
  user,
  onCancel,
  onSave,
  saving = false,
  serverError = "",
}) {
  const [firstName, setFirstName] = useState(user.firstName || "");

  const [lastName, setLastName] = useState(user.lastName || "");

  const [email, setEmail] = useState(user.email || "");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setValidationError("");

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstName || !trimmedLastName || !trimmedEmail) {
      setValidationError("First name, last name, and email are required.");
      return;
    }

    if (password && password.length < 8) {
      setValidationError(
        "The new password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    const updatedAccount = {
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail,
    };

    // Only send a password when the user entered one.
    if (password) {
      updatedAccount.password = password;
    }

    await onSave(updatedAccount);
  }

  function handleClose() {
    if (!saving) {
      onCancel();
    }
  }

  return (
    <div className="account-modal-overlay" onClick={handleClose}>
      <div
        className="account-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="account-modal-close"
          onClick={handleClose}
          aria-label="Close"
          disabled={saving}
        >
          <X size={16} />
        </button>

        <form onSubmit={handleSubmit}>
          <div className="account-modal-row">
            <div className="account-modal-field">
              <label htmlFor="firstName">First Name</label>

              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                disabled={saving}
                required
              />
            </div>

            <div className="account-modal-field">
              <label htmlFor="lastName">Last Name</label>

              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                disabled={saving}
                required
              />
            </div>
          </div>

          <div className="account-modal-field full">
            <label htmlFor="email">Email</label>

            <div className="account-modal-input-icon">
              <Mail size={15} />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={saving}
                required
              />
            </div>
          </div>

          <div className="account-modal-field full">
            <label htmlFor="newPassword">New Password (optional)</label>

            <div className="account-modal-input-icon">
              <Lock size={15} />

              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Insert a new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={saving}
              />

              <button
                type="button"
                className="account-modal-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={saving}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="account-modal-field full">
            <label htmlFor="confirmPassword">Confirm New Password</label>

            <div className="account-modal-input-icon">
              <Lock size={15} />

              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={saving}
              />

              <button
                type="button"
                className="account-modal-toggle"
                onClick={() => setShowConfirm((current) => !current)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                disabled={saving}
              >
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {validationError && (
            <p className="account-modal-error">{validationError}</p>
          )}

          {serverError && <p className="account-modal-error">{serverError}</p>}

          <div className="account-modal-actions">
            <button
              type="button"
              className="account-modal-cancel"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="account-modal-save"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAccountModal;

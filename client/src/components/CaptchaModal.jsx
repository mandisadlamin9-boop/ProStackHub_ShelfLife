import { useState } from "react";
import AnimalCaptcha from "./AnimalCaptcha";

function CaptchaModal({ onClose, onVerified }) {
  const [justVerified, setJustVerified] = useState(false);

  const handleVerify = (isVerified) => {
    if (isVerified) {
      setJustVerified(true);
      setTimeout(() => {
        onVerified();
      }, 700);
    }
  };

  return (
    <div className="captcha-modal-overlay" onClick={onClose}>
      <div className="captcha-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="captcha-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <p className="captcha-modal-title">Quick check before continuing</p>

        <AnimalCaptcha
          verified={justVerified}
          onVerify={handleVerify}
          resetSignal={0}
        />
      </div>
    </div>
  );
}

export default CaptchaModal;

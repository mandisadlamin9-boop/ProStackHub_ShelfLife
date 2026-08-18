import { useEffect, useState } from "react";

const ANIMALS = [
  { id: "fox", label: "fox", color: "#D85A30", accent: "#F0997B" },
  { id: "cat", label: "cat", color: "#534AB7", accent: "#7F77DD" },
  { id: "bird", label: "bird", color: "#0F6E56", accent: "#5DCAA5" },
  { id: "rabbit", label: "rabbit", color: "#993556", accent: "#D4537E" },
];

function FoxShape({ color, accent }) {
  return (
    <>
      <ellipse cx="55" cy="60" rx="30" ry="20" fill={color} />
      <polygon points="80,45 100,35 88,58" fill={color} />
      <polygon points="86,44 96,40 89,54" fill={accent} />
      <circle cx="90" cy="52" r="3" fill="#1D1D1F" />
      <polygon points="35,45 25,30 45,42" fill={color} />
      <ellipse cx="25" cy="72" rx="12" ry="18" fill={accent} />
    </>
  );
}

function CatShape({ color, accent }) {
  return (
    <>
      <ellipse cx="52" cy="65" rx="28" ry="18" fill={color} />
      <circle cx="82" cy="50" r="16" fill={color} />
      <polygon points="72,38 78,24 84,40" fill={color} />
      <polygon points="86,40 92,24 96,38" fill={color} />
      <circle cx="89" cy="49" r="2.5" fill="#1D1D1F" />
      <path
        d="M25 68 Q10 60 15 45"
        stroke={accent}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}

function BirdShape({ color, accent }) {
  return (
    <>
      <ellipse cx="50" cy="62" rx="26" ry="18" fill={color} />
      <circle cx="80" cy="46" r="13" fill={color} />
      <polygon points="92,44 104,48 92,52" fill={accent} />
      <circle cx="84" cy="43" r="2" fill="#1D1D1F" />
      <ellipse cx="42" cy="66" rx="14" ry="8" fill={accent} />
      <polygon points="22,66 8,58 22,74" fill={color} />
    </>
  );
}

function RabbitShape({ color, accent }) {
  return (
    <>
      <ellipse cx="50" cy="68" rx="26" ry="17" fill={color} />
      <circle cx="78" cy="52" r="14" fill={color} />
      <ellipse
        cx="84"
        cy="26"
        rx="6"
        ry="18"
        fill={accent}
        transform="rotate(15 84 26)"
      />
      <ellipse
        cx="70"
        cy="24"
        rx="6"
        ry="18"
        fill={accent}
        transform="rotate(-8 70 24)"
      />
      <circle cx="84" cy="50" r="2.5" fill="#1D1D1F" />
      <circle cx="22" cy="70" r="8" fill={accent} />
    </>
  );
}

const SHAPES = {
  fox: FoxShape,
  cat: CatShape,
  bird: BirdShape,
  rabbit: RabbitShape,
};

function pickRandomAnimal() {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const direction = Math.random() < 0.5 ? "left" : "right";
  return { animal, direction };
}

function AnimalCaptcha({ verified, onVerify, resetSignal }) {
  const [current, setCurrent] = useState(pickRandomAnimal);
  const [wrong, setWrong] = useState(false);

  useEffect(() => {
    setCurrent(pickRandomAnimal());
    setWrong(false);
    onVerify(false);
  }, [resetSignal]);

  const handleClick = (direction) => {
    if (direction === current.direction) {
      onVerify(true);
      setWrong(false);
    } else {
      setWrong(true);
      setTimeout(() => {
        setCurrent(pickRandomAnimal());
        setWrong(false);
      }, 700);
    }
  };

  const Shape = SHAPES[current.animal.id];

  return (
    <div className="captcha-box">
      <div className="captcha-label">
        {verified
          ? "Verified"
          : `Which way is the ${current.animal.label} facing?`}
      </div>

      {!verified && (
        <>
          <div className={`captcha-stage${wrong ? " captcha-wrong" : ""}`}>
            <svg width="72" height="72" viewBox="0 0 100 100">
              <g
                transform={
                  current.direction === "left"
                    ? "translate(100,0) scale(-1,1)"
                    : ""
                }
              >
                <Shape
                  color={current.animal.color}
                  accent={current.animal.accent}
                />
              </g>
            </svg>
          </div>

          <div className="captcha-buttons">
            <button
              type="button"
              onClick={() => handleClick("left")}
              aria-label="Facing left"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => handleClick("right")}
              aria-label="Facing right"
            >
              →
            </button>
          </div>
        </>
      )}

      {verified && (
        <div className="captcha-verified">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default AnimalCaptcha;

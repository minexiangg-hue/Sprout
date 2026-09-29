export function Mascot({
  className = "",
  mood = "happy",
}: {
  className?: string;
  mood?: "happy" | "thinking";
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 240"
      role="img"
      aria-label="芽芽，一只有嫩芽耳朵的绿色创作精灵"
    >
      <ellipse cx="124" cy="217" rx="68" ry="11" fill="#24392e" opacity=".10" />
      <path
        d="M111 65C76 61 59 38 64 17c33-1 55 15 55 43M121 60c0-37 21-53 48-47 0 28-16 49-44 51"
        fill="#356d49"
      />
      <path
        d="M67 143c-33-5-40 14-30 25 10 9 20 4 37-7m100-27c35-9 46 4 37 18-7 11-19 10-36 0"
        fill="#a6d765"
        stroke="#2c4837"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M86 190l-8 23c4 9 24 10 31 0l4-16m31-4 8 22c9 7 26 1 26-6l-11-23"
        fill="#82b84e"
        stroke="#2c4837"
        strokeWidth="4"
      />
      <path
        d="M49 130c-1-49 20-75 71-75s78 28 76 76c-2 45-24 69-76 69s-69-24-71-70"
        fill="#c0e98c"
        stroke="#2c4837"
        strokeWidth="4"
      />
      <path
        d="M68 103c9-26 26-34 48-35"
        fill="none"
        stroke="#e2f6c1"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <ellipse cx="84" cy="146" rx="13" ry="7" fill="#ed9e88" opacity=".8" />
      <ellipse cx="161" cy="146" rx="13" ry="7" fill="#ed9e88" opacity=".8" />
      <ellipse cx="94" cy="123" rx="6" ry="9" fill="#24392e" />
      <ellipse cx="148" cy="123" rx="6" ry="9" fill="#24392e" />
      {mood === "happy" ? (
        <path
          d="M110 145q12 16 24 0"
          fill="none"
          stroke="#24392e"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ) : (
        <ellipse cx="122" cy="147" rx="5" ry="4" fill="#24392e" />
      )}
      <path
        d="m186 78 5-12m9 23 12-3"
        stroke="#6a9655"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

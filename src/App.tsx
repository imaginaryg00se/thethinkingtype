import { useCallback, useEffect, useRef, useState } from "react";
import { passages } from "./passages";
import "./App.css";

function getRandomPassageIndex(currentIndex: number | null) {
  if (passages.length === 1) return 0;

  let newIndex;

  do {
    newIndex = Math.floor(Math.random() * passages.length);
  } while (newIndex === currentIndex);

  return newIndex;
}

function App() {
  const [passageIndex, setPassageIndex] = useState(() =>
    getRandomPassageIndex(null),
  );
  const passage = passages[passageIndex];

  const [input, setInput] = useState("");

  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const [totalKeyStrokes, setTotalKeyStrokes] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const renderOverlayChars = () => {
    return passage.split("").map((char, index) => {
      let color = "transparent";

      if (index < input.length) {
        color = input[index] === char ? "green" : "red";
      }

      const isCurrent = index === input.length;

      return (
        <span
          key={index}
          className={isCurrent ? "blinking-caret" : ""}
          style={{
            color,
          }}
        >
          {char}
        </span>
      );
    });
  };

  // Compare passage with user input and count correct inputs
  const correctChars = passage
    .split("")
    .reduce((count, char, index) => count + (input[index] === char ? 1 : 0), 0);

  // The win condition
  const isComplete =
    input.length === passage.length && correctChars === passage.length;

  console.log({
    inputLength: input.length,
    passageLength: passage.length,
    correctChars,
    isComplete,
    input,
    passage,
  });

  // Timer Feature
  useEffect(() => {
    // Start timer on first character
    if (input.length > 0 && startTime === null) {
      setStartTime(Date.now());
    }

    // Stop timer when complete (only once)
    if (isComplete && endTime === null) {
      setEndTime(Date.now());
    }
  }, [input.length, isComplete, startTime, endTime]);

  // Input box begins accepting input immediately
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const elapsedMs =
    startTime === null ? 0 : (endTime ?? Date.now()) - startTime;

  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  const accuracy =
    totalKeyStrokes === 0 ? 0 : (passage.length / totalKeyStrokes) * 100;

  const elapsedMinutes = elapsedMs / 1000 / 60;
  const wpm = elapsedMinutes > 0 ? correctChars / 5 / elapsedMinutes : 0;

  // Reset procedure
  const reset = useCallback(() => {
    setPassageIndex((currentIndex) => getRandomPassageIndex(currentIndex));
    setInput("");
    setStartTime(null);
    setEndTime(null);
    setTotalKeyStrokes(0);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault(); // stops focus from jumping away
        reset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [reset]);

  return (
    <div onClick={() => inputRef.current?.focus()}>
      <h1>The Thinking Type</h1>
      <div
        style={{
          maxWidth: "800px",
          width: "100%",
          margin: "0 auto",
          padding: "1rem",
          textAlign: "center",
          fontSize: "3rem",
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          fontFamily: "monospace",
          fontKerning: "none",
          fontVariantLigatures: "none",
        }}
      >
        <div
          style={{
            position: "relative",
          }}
        >
          <div
            style={{
              color: "gray",
              whiteSpace: "pre-wrap",
            }}
          >
            {passage}
          </div>

          <div
            style={{
              position: "absolute",
              inset: 0,
              whiteSpace: "pre-wrap",
              pointerEvents: "none",
            }}
          >
            {renderOverlayChars()}
          </div>
        </div>
      </div>

      <input
        ref={inputRef}
        value={input}
        onChange={(e) => {
          setTotalKeyStrokes((prev) => prev + 1);
          setInput(e.target.value);
        }}
        disabled={isComplete}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        style={{
          opacity: 0,
          position: "absolute",
          pointerEvents: "none",
        }}
      />

      {isComplete && (
        <>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "1rem",
            }}
          >
            Keystroke Accuracy: {accuracy.toFixed(1)}%
          </p>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "1rem",
            }}
          >
            WPM: {wpm.toFixed(1)}
          </p>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "1rem",
            }}
          >
            Time: {elapsedSeconds}s
          </p>
        </>
      )}

      <p
        style={{
          fontFamily: "monospace",
          fontSize: "1rem",
        }}
      >
        Characters typed: {input.length}/{passage.length}
      </p>

      <p
        style={{
          fontFamily: "monospace",
          fontSize: "1rem",
          opacity: 0.5,
        }}
      >
        [Tab] - reset
      </p>
    </div>
  );
}

export default App;

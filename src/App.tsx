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
  const [blockedChar, setBlockedChar] = useState<string | null>(null);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const [totalKeyStrokes, setTotalKeyStrokes] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const correctChars = passage
    .split("")
    .reduce((count, char, index) => count + (input[index] === char ? 1 : 0), 0);

  const isComplete =
    input.length === passage.length && correctChars === passage.length;

  useEffect(() => {
    if (input.length > 0 && startTime === null) {
      setStartTime(Date.now());
    }

    if (isComplete && endTime === null) {
      setEndTime(Date.now());
    }
  }, [input.length, isComplete, startTime, endTime]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const elapsedMs =
    startTime === null ? 0 : (endTime ?? Date.now()) - startTime;

  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const elapsedMinutes = elapsedMs / 1000 / 60;

  const accuracy =
    totalKeyStrokes === 0 ? 0 : (correctChars / totalKeyStrokes) * 100;

  const wpm = elapsedMinutes > 0 ? correctChars / 5 / elapsedMinutes : 0;

  const reset = useCallback(() => {
    setPassageIndex((currentIndex) => getRandomPassageIndex(currentIndex));
    setInput("");
    setBlockedChar(null);
    setStartTime(null);
    setEndTime(null);
    setTotalKeyStrokes(0);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  const renderOverlayChars = () => {
    return passage.split("").map((char, index) => {
      const isCurrent = index === input.length && blockedChar === null;
      const isBlockedSpace =
        index === input.length && char === " " && blockedChar !== null;

      let displayChar = char;
      let color = "transparent";

      if (index < input.length) {
        color = input[index] === char ? "green" : "red";
      }

      if (isBlockedSpace) {
        displayChar = blockedChar!;
        color = "red";
      }

      return (
        <span
          key={index}
          className={isCurrent ? "blinking-caret" : ""}
          style={{ color }}
        >
          {displayChar === " " ? " " : displayChar}
        </span>
      );
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        reset();
        return;
      }

      if (isComplete) return;

      const expectedChar = passage[input.length];

      if (startTime === null && e.key.length === 1) {
        setStartTime(Date.now());
      }

      if (blockedChar !== null) {
        if (e.key === "Backspace") {
          e.preventDefault();
          setBlockedChar(null);
          setTotalKeyStrokes((prev) => prev + 1);
        } else {
          e.preventDefault();
        }
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        setInput((prev) => prev.slice(0, -1));
        setTotalKeyStrokes((prev) => prev + 1);
        return;
      }

      if (e.key.length !== 1) return;

      e.preventDefault();
      setTotalKeyStrokes((prev) => prev + 1);

      if (expectedChar === " ") {
        if (e.key === " ") {
          setInput((prev) => prev + " ");
        } else {
          setBlockedChar(e.key);
        }
        return;
      }

      setInput((prev) => prev + e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [blockedChar, input.length, isComplete, passage, reset, startTime]);

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
        <div style={{ position: "relative" }}>
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
        value=""
        readOnly
        style={{
          opacity: 0,
          position: "absolute",
          pointerEvents: "none",
        }}
      />

      {isComplete && (
        <>
          <p style={{ fontFamily: "monospace", fontSize: "1rem" }}>
            Keystroke Accuracy: {accuracy.toFixed(1)}%
          </p>
          <p style={{ fontFamily: "monospace", fontSize: "1rem" }}>
            WPM: {wpm.toFixed(1)}
          </p>
          <p style={{ fontFamily: "monospace", fontSize: "1rem" }}>
            Time: {elapsedSeconds}s
          </p>
        </>
      )}

      <p style={{ fontFamily: "monospace", fontSize: "1rem" }}>
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

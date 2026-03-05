import { useEffect, useRef, useState } from "react";

function App() {
  const passage = 
    "Your identity is something you can update at any time. Your identity dictates how you experience the game.";

  const [input, setInput] = useState("");

  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);

  const [totalKeyStrokes, setTotalKeyStrokes] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Compare passage with user input and count correct inputs
  const correctChars = passage
    .split("")
    .reduce((count, char, index) => count + (input[index] === char ? 1 : 0), 0);

  // The win condition
  const isComplete = 
    input.length === passage.length && 
    correctChars === passage.length;

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
    totalKeyStrokes === 0
      ? 0
      : (passage.length / totalKeyStrokes) * 100;

  const elapsedMinutes = elapsedMs / 1000 / 60; 
  const wpm = 
    elapsedMinutes > 0 ? (correctChars / 5) / elapsedMinutes : 0;

  // Reset procedure
  const reset = () => {
    setInput("");
    setStartTime(null);
    setEndTime(null);
    setTotalKeyStrokes(0);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }


  return (
    <div>
      <h1>The Thinking Type</h1>
      <p>
        {passage.split("").map((char, index) => { 
          let color = "black"; 

          if (index < input.length) {
            color = input[index] === char ? "green" : "red"
          };

          return (
            <span key={index} style={{ color }} >
              {char}
            </span>
          )
          
      })}
      </p>

      <input
        ref={inputRef}
        value={input}
        onChange={(e) => {
          setTotalKeyStrokes((prev) => prev + 1);
          setInput(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault(); // stops focus from jumping away
            reset();            
          }
        }}
        disabled={isComplete}
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />

      {isComplete && <p>Completed</p>}

      {isComplete && (
        <>
        <p>Accuracy: {accuracy.toFixed(1)}%</p>
        <p>WPM: {wpm.toFixed(1)}</p>
        </>
      )}

      {isComplete && (
        <button onClick={reset}>
          Restart
        </button>
      )}

      <p>Time: {elapsedSeconds}s</p>

      <p>Characters typed: {input.length}</p>
    </div>
  );
}

export default App;

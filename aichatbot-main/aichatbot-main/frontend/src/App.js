import { useState, useRef, useEffect } from "react";

function App() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const chatEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setChat((prev) => [...prev, userMsg]);
    setInput("");

    let aiMsg = { sender: "ai", text: "" };
    setChat((prev) => [...prev, aiMsg]);

    try {
      // ✅ FIXED: correct API call
      const response = await fetch("http://localhost:5000/api/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiMsg.text += chunk;

        setChat((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...aiMsg };
          return updated;
        });

        // Optional: speak AI
        // speakAI(chunk);
      }
    } catch (err) {
      console.error("Error fetching AI response:", err);
    }
  };

  // Voice input
  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.start();
  };

  // Voice output
  const speakAI = (text) => {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    synth.speak(utter);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#1e1e2e",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "400px",
          height: "600px",
          backgroundColor: "#2a2a40",
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 0 15px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            padding: "12px",
            backgroundColor: "#3b3b5c",
            color: "white",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          🤖 My AI Chatbot
        </div>

        <div
          style={{
            flex: 1,
            padding: "12px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {chat.map((msg, i) => (
            <div
              key={i}
              style={{
                alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                backgroundColor:
                  msg.sender === "user" ? "#4f8cff" : "#3b3b5c",
                color: "white",
                padding: "10px 14px",
                borderRadius: "18px",
                maxWidth: "75%",
                wordBreak: "break-word",
              }}
            >
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div
          style={{
            display: "flex",
            padding: "10px",
            backgroundColor: "#3b3b5c",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "20px",
              border: "none",
              outline: "none",
              backgroundColor: "#1e1e2e",
              color: "white",
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              marginLeft: "8px",
              backgroundColor: "#4f8cff",
              color: "white",
              border: "none",
              borderRadius: "20px",
              padding: "10px 16px",
              cursor: "pointer",
            }}
          >
            ➤
          </button>
          <button
            onClick={startVoiceInput}
            style={{
              marginLeft: "5px",
              backgroundColor: "#22c55e",
              color: "white",
              border: "none",
              borderRadius: "20px",
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            🎤
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

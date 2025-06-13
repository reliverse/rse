import { APITester } from "./APITester";
import "./index.css";
import logo from "./logo.svg";
import reactLogo from "./react.svg";

export function App() {
  return (
    <div className="app">
      <div className="logo-container">
        <img src={logo} alt="Bun Logo" className="logo bun-logo" />
        <img src={reactLogo} alt="React Logo" className="logo react-logo" />
      </div>

      <h1>
        Got a spark of inspiration? Let's turn it into a fully realized
        masterpiece!
      </h1>
      <pre>
        @reliverse/rse v1.7.4 | bun v1.2.14 | VSCode Terminal | isDev | w132 h12
      </pre>
      <p>
        [Ad] Resend: "Railway is a game changer for us" →{" "}
        <a href="https://railway.com?referralCode=sATgpf">
          https://railway.com?referralCode=sATgpf
        </a>
      </p>
      <p>
        No ads, more power — get Reliverse subscription:{" "}
        <a href="https://github.com/sponsors/blefnk">
          https://github.com/sponsors/blefnk
        </a>
      </p>
      <p>
        Use <span className="key">↑/↓</span> or <span className="key">k/j</span>{" "}
        to navigate, <span className="key">Enter</span> to select,{" "}
        <span className="key">Ctrl+C</span> to exit
      </p>
      <APITester />
    </div>
  );
}

export default App;

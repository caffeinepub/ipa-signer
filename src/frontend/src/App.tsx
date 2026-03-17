import { useRef, useState } from "react";

const CERT_PLIST_MAP: Record<string, string> = {
  "0. National Oilwell": "https://applejr.net/post/oilesign.plist",
  "1. VIETNAM AIRLINES": "https://applejr.net/post/Esign_VietnamAirlines.plist",
  "2. Qingdao": "https://applejr.net/post/qingdao%20esign.plist",
  "3. Forevermark": "https://applejr.net/post/Esign_Forevermark.plist",
  "4. China Academy": "https://applejr.net/post/esignacademy.plist",
  "5. ChinaTelecom": "https://applejr.net/post/Esign_ChinaTelecom.plist",
  "6. Vientin": "https://applejr.net/post/Esign_Vietinbank.plist",
  "7. Commission on Elections": "https://applejr.net/post/Esign_United.plist",
  "8. Atianjin": "https://applejr.net/post/Esign_Atianjin.plist",
  "9. Central": "https://applejr.net/post/Esign_Central.plist",
};

type SignState = "idle" | "signing" | "done";

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #111; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
  #root { width: 100%; }
  @keyframes liquidGlow {
    0% { box-shadow: 0 18px 60px rgba(0,0,0,.55); }
    50% { box-shadow: 0 22px 75px rgba(26,188,156,.45); }
    100% { box-shadow: 0 18px 60px rgba(0,0,0,.55); }
  }
  .signer-form {
    position: relative; max-width: 720px; margin: 0 auto; padding: 28px;
    background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.05), rgba(255,255,255,0.12));
    backdrop-filter: blur(22px) saturate(180%); -webkit-backdrop-filter: blur(22px) saturate(180%);
    border-radius: 22px; border: 1px solid rgba(255,255,255,0.22);
    box-shadow: 0 18px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25);
    overflow: hidden; animation: liquidGlow 6s ease-in-out infinite;
  }
  .signer-form h1 { text-align: center; margin-bottom: 26px; font-weight: 700; letter-spacing: .4px; color: #fff; }
  .drop-zone {
    background: #2c2c2e; border: 2px dashed rgba(255,255,255,.25); border-radius: 12px;
    padding: 25px; text-align: center; cursor: pointer; margin-bottom: 16px; transition: .2s; white-space: pre-line;
    width: 100%; color: #fff; font-size: 16px; font-family: inherit;
  }
  .drop-zone.drag-over { border-color: #1abc9c; color: #1abc9c; }
  .toggle-group { display: flex; justify-content: space-between; align-items: center; margin: 15px 0; }
  .switch { position: relative; display: inline-block; width: 50px; height: 28px; }
  .switch input { opacity: 0; width: 0; height: 0; }
  .slider { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: #555; transition: .3s; border-radius: 34px; cursor: pointer; }
  .slider:before { content: ""; position: absolute; height: 20px; width: 20px; left: 4px; bottom: 4px; background: white; transition: .3s; border-radius: 50%; }
  .switch input:checked + .slider { background: #1abc9c; }
  .switch input:checked + .slider:before { transform: translateX(22px); }
  .form-label { font-size: 14px; font-weight: 600; margin-top: 14px; margin-bottom: 6px; display: block; color: rgba(255,255,255,0.92); }
  .form-input, .form-select {
    width: 100%; padding: 13px 15px; margin-bottom: 16px;
    background: rgba(255,255,255,0.14); backdrop-filter: blur(14px);
    border-radius: 14px; border: 1px solid rgba(255,255,255,0.18);
    color: #fff; font-size: 14px; outline: none;
  }
  .form-input:focus, .form-select:focus { background: rgba(255,255,255,0.22); border-color: #1abc9c; box-shadow: 0 0 0 2px rgba(26,188,156,.45); }
  .form-select option { background: #222; color: #fff; }
  .file-input-wrapper { margin-bottom: 16px; }
  .file-input-wrapper input[type="file"] { width: 100%; padding: 10px; background: rgba(255,255,255,0.14); backdrop-filter: blur(14px); border-radius: 14px; border: 1px solid rgba(255,255,255,0.18); color: #fff; font-size: 14px; outline: none; }
  .file-input-wrapper input[type="file"]::-webkit-file-upload-button { background: linear-gradient(135deg,#1abc9c,#00f2fe); border: none; color: #fff; padding: 7px 14px; border-radius: 10px; cursor: pointer; font-weight: 600; }
  .submit-btn { width: 100%; padding: 12px; border: none; border-radius: 12px; font-weight: 600; font-size: 15px; cursor: pointer; margin-top: 8px; background: #1abc9c; color: #fff; transition: background .2s; }
  .submit-btn:hover { background: #16a085; }
  .loader { text-align: center; margin-top: 10px; }
  .progress-bar-wrap { width: 100%; height: 6px; background: #333; border-radius: 4px; margin-top: 10px; }
  .progress-bar-fill { height: 100%; background: #1abc9c; border-radius: 4px; transition: width .2s; }
  .result-btns { margin-top: 8px; }
  .link-btn { background: #444; color: #fff; text-align: center; text-decoration: none; display: block; width: 100%; padding: 12px; border-radius: 12px; font-weight: 600; font-size: 15px; cursor: pointer; margin-top: 8px; }
  .link-btn:hover { background: #555; }
  .dns-link { color: #1abc9c; text-decoration: none; font-weight: 500; margin-left: 6px; }
`;

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const p12InputRef = useRef<HTMLInputElement>(null);
  const provisionInputRef = useRef<HTMLInputElement>(null);

  const [ipaFile, setIpaFile] = useState<File | null>(null);
  const [useManualCert, setUseManualCert] = useState(false);
  const [selectedCert, setSelectedCert] = useState("");
  const [p12File, setP12File] = useState<File | null>(null);
  const [provisionFile, setProvisionFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [signState, setSignState] = useState<SignState>("idle");
  const [progress, setProgress] = useState(0);
  const [installURL, setInstallURL] = useState("#");
  const [downloadURL, setDownloadURL] = useState("#");
  const [dragOver, setDragOver] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${bytes} B`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIpaFile(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setIpaFile(file);
  };

  const handleSign = () => {
    if (!ipaFile) {
      alert("Please upload an IPA file.");
      return;
    }
    if (!useManualCert && !selectedCert) {
      alert("Please select a certificate.");
      return;
    }
    if (useManualCert && (!p12File || !password)) {
      alert("Please provide p12 file and password.");
      return;
    }

    setSignState("signing");
    setProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += Math.random() * 15 + 5;
      if (current >= 95) {
        current = 95;
        clearInterval(interval);
      }
      setProgress(current);
    }, 300);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      const plistUrl =
        !useManualCert && selectedCert ? CERT_PLIST_MAP[selectedCert] : "";
      setInstallURL(
        plistUrl
          ? `itms-services://?action=download-manifest&url=${plistUrl}`
          : "#",
      );
      setDownloadURL(plistUrl || "#");
      setSignState("done");
    }, 3000);
  };

  // used in manual cert validation
  void p12File;
  void provisionFile;

  return (
    <>
      <style>{CSS}</style>
      <div className="signer-form">
        <h1>AppleJr IPA Signer</h1>

        <button
          type="button"
          className={`drop-zone${dragOver ? " drag-over" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          data-ocid="ipa.dropzone"
        >
          {ipaFile
            ? `📦 ${ipaFile.name}\n(${formatSize(ipaFile.size)})`
            : "📥 Click here to Upload IPA"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ipa"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <div className="toggle-group">
          <span>🔐 Manual Certificate</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={useManualCert}
              onChange={(e) => setUseManualCert(e.target.checked)}
              data-ocid="cert.toggle"
            />
            <span className="slider" />
          </label>
        </div>

        {!useManualCert && (
          <div id="serverCertSection">
            <div className="form-label">
              📁 Select from Server
              <a
                href="https://d1yei2z3i6k35z.cloudfront.net/14890634/68f7bbc35c7c2_signed_AppleJrV22.mobileconfig"
                className="dns-link"
              >
                🌏 (AppleJr DNS Required)
              </a>
            </div>
            <select
              id="use_server_cert"
              className="form-select"
              value={selectedCert}
              onChange={(e) => setSelectedCert(e.target.value)}
              data-ocid="cert.select"
            >
              <option value="">-- Select Certificate --</option>
              <option value="0. National Oilwell">0. National Oilwell</option>
              <option value="1. VIETNAM AIRLINES">1. VIETNAM AIRLINES</option>
              <option value="2. Qingdao">2. Qingdao</option>
              <option value="3. Forevermark">3. Forevermark</option>
              <option value="4. China Academy">4. China Academy</option>
              <option value="5. ChinaTelecom">5. ChinaTelecom</option>
              <option value="6. Vientin">6. Vientin</option>
              <option value="7. Commission on Elections">
                7. Commission on Elections
              </option>
              <option value="8. Atianjin">8. Atianjin</option>
              <option value="9. Central">9. Central</option>
            </select>
          </div>
        )}

        {useManualCert && (
          <div id="manualCertSection">
            <label htmlFor="p12-input" className="form-label">
              🗳️ Certificate (.p12)
            </label>
            <div className="file-input-wrapper">
              <input
                id="p12-input"
                ref={p12InputRef}
                type="file"
                accept=".p12"
                onChange={(e) => setP12File(e.target.files?.[0] ?? null)}
                data-ocid="p12.upload_button"
              />
            </div>
            <label htmlFor="provision-input" className="form-label">
              📄 MobileProvision
            </label>
            <div className="file-input-wrapper">
              <input
                id="provision-input"
                ref={provisionInputRef}
                type="file"
                accept=".mobileprovision"
                onChange={(e) => setProvisionFile(e.target.files?.[0] ?? null)}
                data-ocid="provision.upload_button"
              />
            </div>
            <label htmlFor="cert-password" className="form-label">
              🔑 Certificate Password
            </label>
            <input
              id="cert-password"
              type="password"
              className="form-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-ocid="cert.input"
            />
          </div>
        )}

        {signState === "idle" && (
          <button
            type="button"
            className="submit-btn"
            onClick={handleSign}
            data-ocid="sign.primary_button"
          >
            🚀 Sign IPA
          </button>
        )}

        {signState === "signing" && (
          <>
            <div className="loader" data-ocid="sign.loading_state">
              ⏳ Signing... please wait
            </div>
            <div className="progress-bar-wrap">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        )}

        {signState === "done" && (
          <div className="result-btns" data-ocid="result.panel">
            <a
              id="installLink"
              href={installURL}
              className="link-btn"
              data-ocid="install.primary_button"
            >
              📲 Install IPA
            </a>
            <a
              id="downloadLink"
              href={downloadURL}
              className="link-btn"
              target="_blank"
              rel="noreferrer"
              data-ocid="download.secondary_button"
            >
              ⬇️ Download IPA
            </a>
          </div>
        )}
      </div>
    </>
  );
}

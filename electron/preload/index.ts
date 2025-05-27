import { ipcRenderer, contextBridge, dialog } from "electron";
// import { Presentation } from "@/types";
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args;
    return ipcRenderer.on(channel, (event, ...args) =>
      listener(event, ...args)
    );
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args;
    return ipcRenderer.off(channel, ...omit);
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args;
    return ipcRenderer.send(channel, ...omit);
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args;
    return ipcRenderer.invoke(channel, ...omit);
  },

  // You can expose other APTs you need here.
  // ...
});

contextBridge.exposeInMainWorld("api", {
  maximizeApp: () => ipcRenderer.send("maximizeApp"),
  minimizeApp: () => {
    console.log("Minimize action triggered");
    ipcRenderer.send("minimizeApp");
  },
  // Add this to your preload script's contextBridge.exposeInMainWorld call
  minimizeProjection: () => ipcRenderer.send("minimizeProjection"),
  closeApp: () => {
    console.log("Close action triggered");
    ipcRenderer.send("closeApp");
  },
});

// --------- Preload scripts loading ---------
function domReady(
  condition: DocumentReadyState[] = ["complete", "interactive"]
) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  },
};

/**
 * Modern backdrop loading screen with layered images and glassmorphism effects
 */
function useLoading() {
  const className = `loaders-css__modern-backdrop`;
  const styleContent = `
/* Keyframe Animations */
@keyframes float-animation {
  0%, 100% { 
    transform: translateY(0px) rotate(0deg); 
  }
  25% { 
    transform: translateY(-15px) rotate(2deg); 
  }
  50% { 
    transform: translateY(-10px) rotate(-1deg); 
  }
  75% { 
    transform: translateY(-20px) rotate(1deg); 
  }
}

@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3),
                0 0 40px rgba(65, 34, 20, 0.951),
                0 0 60px rgba(59, 130, 246, 0.1);
  }
  50% { 
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.5),
                0 0 60px rgba(67, 35, 18, 0.973),
                0 0 90px rgba(56, 27, 15, 0.967);
  }
}

@keyframes backdrop-shimmer {
  0% { 
    background-position: -200% 0; 
  }
  100% { 
    background-position: 200% 0; 
  }
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Main Loading Container */
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
  
  /* Modern gradient background */
  background: linear-gradient(135deg, 
    #292524 100%, 
    #292524 100%, 
    #292524 100%, 
    #292524 100%, 
    #292524 100%
  );
  background-size: 400% 400%;
  animation: backdrop-shimmer 6s ease-in-out infinite;
}

/* Backdrop Image Layer */
.backdrop-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('./cloud.png'); /* Replace with your backdrop image */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0.15;
  filter: blur(3px) brightness(1.2);
  z-index: 1;
}

/* Glassmorphism Overlay */
.glass-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  z-index: 2;
}

/* Content Container */
.loading-content {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
}

/* Main Logo/Image Container */
.${className} {
  position: relative;
  margin-bottom: 30px;
  animation: fade-in-up 1s ease-out;
}

.${className} .main-logo-container {
  position: relative;
  display: inline-block;
  padding: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);

  animation: float-animation 4s ease-in-out infinite,
             pulse-glow 3s ease-in-out infinite;
}

.${className} .main-logo {
  width: 94px;
  height: 90px;
  border-radius: 100%;
  object-fit: cover;
  filter: drop-shadow(0 10px 20px rgba(33, 20, 19, 0.942));
  transition: transform 0.3s ease;
}

.${className} .main-logo:hover {
  transform: scale(1.1);
}

/* Loading Text */
.loading-text {
  color: rgba(255, 255, 255, 0.9);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 20px;
  animation: fade-in-up 1s ease-out 0.3s both;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

/* Modern Progress Bar */
.progress-container {
  width: 280px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  animation: fade-in-up 1s ease-out 0.6s both;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, 
    rgba(255, 255, 255, 0.8) 0%, 
    rgba(56, 34, 17, 0.9) 50%, 
    rgba(60, 32, 14, 0.8) 100%
  );
  background-size: 200% 100%;
  border-radius: 2px;
  animation: backdrop-shimmer 2s linear infinite;
  width: 0%;
  transition: width 0.3s ease;
}

/* Corner Decorative Elements */
.corner-decoration {
  position: absolute;
  width: 100px;
  height: 100px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.corner-decoration.top-left {
  top: 30px;
  left: 30px;
  animation: float-animation 6s ease-in-out infinite;
}

.corner-decoration.bottom-right {
  bottom: 30px;
  right: 30px;
  animation: float-animation 6s ease-in-out infinite reverse;
}

/* Responsive Design */
@media (max-width: 768px) {
  .loading-content {
    padding: 20px;
  }
  
  .${className} .main-logo {
    width: 60px;
    height: 60px;
  }
  
  .loading-text {
    font-size: 16px;
  }
  
  .progress-container {
    width: 220px;
  }
  
  .corner-decoration {
    width: 60px;
    height: 60px;
  }
}
    `;

  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");

  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
  oDiv.innerHTML = `
    <div class="backdrop-layer"></div>
    <div class="glass-overlay"></div>
    <div class="corner-decoration top-left"></div>
    <div class="corner-decoration bottom-right"></div>
    <div class="loading-content">
      <div class="${className}">
        <div class="main-logo-container">
          <img src="./cloud.png" alt="Loading..." class="main-logo" />
        </div>
      </div>
      <div class="loading-text">Loading your experience...</div>
      <div class="progress-container">
        <div class="progress-bar"></div>
      </div>
    </div>
  `;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);

      // Animate progress bar
      setTimeout(() => {
        const progressBar = document.querySelector(
          ".progress-bar"
        ) as HTMLElement;
        if (progressBar) {
          progressBar.style.width = "100%";
        }
      }, 500);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    },
  };
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev) => {
  ev.data.payload === "removeLoading" && removeLoading();
};

setTimeout(removeLoading, 4999);

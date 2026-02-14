import EventEmitter from "eventemitter3";

export const meshEmitter = new EventEmitter();

let intervalId: any = null;
let scanning = false;

export const startScan = async () => {
  if (scanning) return; // prevent multiple scanners

  scanning = true;
  console.log("📡 scanning for nearby devices...");

  intervalId = setInterval(() => {
    const rssi = -40 - Math.floor(Math.random() * 60); // fake signal strength

    meshEmitter.emit("nodeFound", {
      id: "device_" + Math.floor(Math.random() * 100),
      lastSeen: Date.now(),
      rssi,
    });
  }, 4000);
};

export const stopScan = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    scanning = false;
  }
};
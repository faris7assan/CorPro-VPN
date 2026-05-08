export const memoryLogs: any[] = [];

export function hijackConsole() {
  const ogLog = console.log;
  const ogError = console.error;
  const ogWarn = console.warn;

  const addLog = (level: string, ...args: any[]) => {
    const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
    memoryLogs.push({ id: Date.now() + Math.random(), time: new Date().toISOString(), level, message: msg });
    if (memoryLogs.length > 1000) memoryLogs.shift();
  };

  console.log = (...args) => {
    ogLog(...args);
    addLog('info', ...args);
  };
  console.error = (...args) => {
    ogError(...args);
    addLog('error', ...args);
  };
  console.warn = (...args) => {
    ogWarn(...args);
    addLog('warning', ...args);
  };
}

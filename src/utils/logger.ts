import logger from 'pino';
import dayjs from 'dayjs';
import pretty from 'pino-pretty';

const stream = pretty({
  colorize: true,
  translateTime: `${dayjs().format()}`,
});

const log = logger(stream);

// const log = logger({
//   transport: {
//     target: "pino-pretty",
//   },
//   level: "info",
//   base: {
//     pid: false,
//   },
//   timestamp: () => `,"time": "${dayjs().format()}`,
// });

export default log;

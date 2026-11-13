import pino from "pino"

type Fields = Record<string, unknown>

const isDev = process.env.NODE_ENV !== "production"

const pinoLogger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
})

function withFields(msg: string, fields?: Fields): [object, string] {
  return [fields ?? {}, msg]
}

/** Go-style leveled logger: message first, structured fields second. */
export const log = {
  debug(msg: string, fields?: Fields) {
    pinoLogger.debug(...withFields(msg, fields))
  },
  info(msg: string, fields?: Fields) {
    pinoLogger.info(...withFields(msg, fields))
  },
  warn(msg: string, fields?: Fields) {
    pinoLogger.warn(...withFields(msg, fields))
  },
  error(msg: string, fields?: Fields) {
    pinoLogger.error(...withFields(msg, fields))
  },
}

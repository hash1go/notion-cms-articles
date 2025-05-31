/**
 * アプリケーション全体で使用するロギングユーティリティ
 * 開発環境と本番環境で異なる挙動を提供
 */

import { formatErrorForLogging } from "./errors";

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  debug(message: string, data?: any) {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.debug(this.formatMessage("DEBUG", message), data || "");
    }
  }

  info(message: string, data?: any) {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(this.formatMessage("INFO", message), data || "");
    }
  }

  warn(message: string, data?: any) {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(this.formatMessage("WARN", message), data || "");
    }
  }

  error(message: string, error?: unknown, additionalData?: any) {
    if (this.logLevel <= LogLevel.ERROR) {
      const formattedError = error ? formatErrorForLogging(error) : null;
      console.error(
        this.formatMessage("ERROR", message),
        formattedError || "",
        additionalData || ""
      );

      // 本番環境では外部サービスに送信
      if (!this.isDevelopment && error) {
        this.sendToErrorReporting(message, formattedError, additionalData);
      }
    }
  }

  private sendToErrorReporting(
    message: string,
    error: any,
    additionalData?: any
  ) {
    // 将来的な実装: Sentry, LogRocket, DataDogなどへの送信
    // 現在は実装なし
    // 例:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(new Error(message), {
    //     extra: { ...error, ...additionalData }
    //   });
    // }
  }

  // パフォーマンス計測用
  time(label: string) {
    if (this.isDevelopment) {
      console.time(label);
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment) {
      console.timeEnd(label);
    }
  }
}

// シングルトンインスタンス
export const logger = new Logger();

// 使いやすいエクスポート
export const { debug, info, warn, error, time, timeEnd } = logger;

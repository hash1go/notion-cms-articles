/**
 * アプリケーション全体で使用するカスタムエラークラス
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotionAPIError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "NOTION_API_ERROR", 500, details);
    this.name = "NotionAPIError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string) {
    super(message, "VALIDATION_ERROR", 400, { field });
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource} not found${id ? `: ${id}` : ""}`, "NOT_FOUND", 404, {
      resource,
      id,
    });
    this.name = "NotFoundError";
  }
}

export class ImageLoadError extends AppError {
  constructor(url: string, reason?: string) {
    super(`Failed to load image: ${url}`, "IMAGE_LOAD_ERROR", undefined, {
      url,
      reason,
    });
    this.name = "ImageLoadError";
  }
}

export class NetworkError extends AppError {
  constructor(message: string, url?: string) {
    super(message, "NETWORK_ERROR", undefined, { url });
    this.name = "NetworkError";
  }
}

// エラーメッセージをユーザーフレンドリーに変換
export function getErrorMessage(error: unknown): string {
  if (error instanceof NotionAPIError) {
    return "コンテンツの取得中にエラーが発生しました。しばらくしてからもう一度お試しください。";
  }

  if (error instanceof ValidationError) {
    return "入力内容に問題があります。確認してもう一度お試しください。";
  }

  if (error instanceof NotFoundError) {
    return "お探しのページが見つかりませんでした。";
  }

  if (error instanceof ImageLoadError) {
    return "画像の読み込みに失敗しました。";
  }

  if (error instanceof NetworkError) {
    return "ネットワークエラーが発生しました。インターネット接続を確認してください。";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "予期しないエラーが発生しました。";
}

// エラーログ用のフォーマッター
export function formatErrorForLogging(error: unknown): {
  message: string;
  code?: string;
  stack?: string;
  details?: any;
} {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      stack: error.stack,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
  };
}

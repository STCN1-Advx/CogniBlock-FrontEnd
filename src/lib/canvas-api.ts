import { apiGet, apiPost } from './api-client';

// 定义API返回的数据结构

export interface CardPosition {
  x: number;
  y: number;
}

export interface CardResponse {
  card_id: number;
  content_id: number;
  position: CardPosition;
  summary?: string;
}

/**
 * 获取文档列表
 * @param userId 用户ID
 * @param skip 跳过的记录数
 * @param limit 返回的记录数限制
 * @param permission 权限过滤：0=查看，1=编辑，2=管理
 */
export const getArticleList = (userId: string, skip: number = 0, limit: number = 100, permission?: number): Promise<ArticleListResponse> => {
  const params = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString()
  });
  
  if (permission !== undefined) {
    params.append('permission', permission.toString());
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const fullUrl = `${baseUrl}/api/v2/article/?${params.toString()}`;
  return apiGet<ArticleListResponse>(fullUrl, {
    headers: {
      'X-User-ID': userId,
    },
  });
};

/**
 * 根据content_id获取内容详情
 * @param contentId 内容ID
 * @param userId 用户ID
 */
export const getContentById = (contentId: number, userId: string): Promise<ContentDetail> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const fullUrl = `${baseUrl}/api/v2/content/content/${contentId}`;
  return apiGet<ContentDetail>(fullUrl, {
    headers: {
      'X-User-ID': userId,
    },
  });
};

export interface RawCardResponse {
  id: number;
  content_id: number;
  position_x: number;
  position_y: number;
  summary?: string;
}

export interface CanvasInfo {
  // 根据 /api/v2/canva/info/{canvas_id} 的返回定义
  // 暂时留空，待API文档明确
}

/**
 * 内容详情接口
 */
export interface ContentDetail {
  id: number;
  content_type: string;
  text_data: string;
  text_data_length: number;
  text_data_preview: string;
  image_data: string;
  image_data_length: number;
  image_data_has_data: boolean;
  summary_title: string | null;
  summary_topic: string | null;
  summary_content: string | null;
  summary_status: string | null;
  content_hash: string | null;
  created_at: string;
  updated_at: string;
  debug_info: {
    has_text_data: boolean;
    has_image_data: boolean;
    effective_content: string;
    effective_content_length: number;
    effective_content_preview: string;
  };
}

/**
 * 文档列表响应接口
 */
export interface ArticleListResponse {
  articles: ContentDetail[];
  total: number;
}

/**
 * 获取用户的画布ID列表
 * @param userId 用户ID
 */
export const getCanvasList = (userId: string): Promise<number[]> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const fullUrl = `${baseUrl}/api/v2/canva/list`;
  return apiGet<number[]>(fullUrl, {
    headers: {
      'x-user-id': userId,
    },
  });
};

/**
 * 拉取画布的当前状态
 * @param canvasId 画布ID
 * @param userId 用户ID
 */
export const pullCanvasState = (canvasId: number, userId: string): Promise<RawCardResponse[]> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const fullUrl = `${baseUrl}/api/v2/canva/pull`;
  return apiPost<RawCardResponse[]>(fullUrl, { canva_id: canvasId }, {
    headers: {
      'X-User-ID': userId,
    },
  });
};

/**
 * 推送画布更新
 * @param canvasId 画布ID
 * @param cards 卡片更新数据
 * @param userId 用户ID
 */
export const pushCanvasState = (canvasId: number, cards: CardResponse[], userId: string): Promise<{ message: string }> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const fullUrl = `${baseUrl}/api/v2/canva/push`;
  return apiPost<{ message: string }>(fullUrl, { canva_id: canvasId, cards }, {
    headers: {
      'X-User-ID': userId,
    },
  });
};

/**
 * 获取画布基本信息
 * @param canvasId 画布ID
 * @param userId 用户ID
 */
export const getCanvasInfo = (canvasId: number, userId: string): Promise<CanvasInfo> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const fullUrl = `${baseUrl}/api/v2/canva/info/${canvasId}`;
  return apiGet<CanvasInfo>(fullUrl, {
    headers: {
      'X-User-ID': userId,
    },
  });
};
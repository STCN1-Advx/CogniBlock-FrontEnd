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
  
  return apiGet<ArticleListResponse>(`/api/v2/article/?${params.toString()}`, {
    headers: {
      'X-User-ID': userId,
    },
  });
};

/**
 * 根据content_id获取文档内容
 * @param contentId 内容ID
 * @param userId 用户ID
 */
export const getArticleById = (contentId: number, userId: string): Promise<ArticleContent> => {
  return apiGet<ArticleContent>(`/api/v2/article/${contentId}`, {
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
 * 文档内容接口
 */
export interface ArticleContent {
  id: number;
  content_type: string;
  text_data: string;
  image_data: string;
  summary_title: string;
  summary_topic: string;
  summary_content: string;
  summary_status: string;
  filename: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  permission: string;
}

/**
 * 文档列表响应接口
 */
export interface ArticleListResponse {
  articles: ArticleContent[];
  total: number;
}

/**
 * 获取用户的画布ID列表
 * @param userId 用户ID
 */
export const getCanvasList = (userId: string): Promise<number[]> => {
  return apiGet<number[]>(`/api/v2/canva/list`, {
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
  return apiPost<{ message: string }>(`/api/v2/canva/push`, { canva_id: canvasId, cards }, {
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
  return apiGet<CanvasInfo>(`/api/v2/canva/info/${canvasId}`, {
    headers: {
      'X-User-ID': userId,
    },
  });
};
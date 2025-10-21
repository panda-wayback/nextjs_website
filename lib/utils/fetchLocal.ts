// 通用的本地API调用封装
// 简化前端调用后端API的代码

interface FetchLocalOptions extends RequestInit {
  // 可以添加自定义选项
}

interface FetchLocalResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
}

// 通用的本地API调用方法
export const fetchLocal = async <T = any>(
  endpoint: string,
  options: FetchLocalOptions = {}
): Promise<FetchLocalResponse<T>> => {
  // 自动添加基础URL前缀
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `/api${url}`;

  // 默认配置
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // 合并选项
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(fullUrl, finalOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error(`[fetchLocal] 请求失败: ${fullUrl}`, error);
    throw error;
  }
};

// 便捷方法：GET请求
export const getLocal = <T = any>(endpoint: string, options: FetchLocalOptions = {}) => {
  return fetchLocal<T>(endpoint, { ...options, method: 'GET' });
};

// 便捷方法：POST请求
export const postLocal = <T = any>(endpoint: string, data?: any, options: FetchLocalOptions = {}) => {
  return fetchLocal<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// 便捷方法：PUT请求
export const putLocal = <T = any>(endpoint: string, data?: any, options: FetchLocalOptions = {}) => {
  return fetchLocal<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
};

// 便捷方法：DELETE请求
export const deleteLocal = <T = any>(endpoint: string, options: FetchLocalOptions = {}) => {
  return fetchLocal<T>(endpoint, { ...options, method: 'DELETE' });
};

// 便捷方法：PATCH请求
export const patchLocal = <T = any>(endpoint: string, data?: any, options: FetchLocalOptions = {}) => {
  return fetchLocal<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
};
